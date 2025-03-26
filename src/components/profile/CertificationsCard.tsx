
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Key, RefreshCw, Calendar, Award, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { certificationService } from '@/services/certificationService';
import { machineService } from '@/services/machineService';
import { courseService } from '@/services/courseService';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import BookMachineButton from './BookMachineButton';

const SPECIAL_MACHINE_IDS = ["5", "6"]; // Safety Cabinet and Machine Safety Course
const MACHINE_ID_LASER_CUTTER = "1"; // Laser Cutter ID

const CertificationsCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const [machineStatuses, setMachineStatuses] = useState({});
  const [availableMachineIds, setAvailableMachineIds] = useState<string[]>([]);
  const [coursesMap, setCoursesMap] = useState<Record<string, any>>({});

  const fetchMachinesAndCertifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setRefreshing(true);
    try {
      console.log("Fetching machines for CertificationsCard");
      
      // Fetch all courses to build a map
      try {
        const allCourses = await courseService.getCourses();
        const coursesById: Record<string, any> = {};
        
        if (Array.isArray(allCourses)) {
          allCourses.forEach(course => {
            const courseId = course.id || course._id;
            coursesById[courseId] = course;
          });
        }
        
        console.log("Courses map created:", Object.keys(coursesById).length);
        setCoursesMap(coursesById);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
      
      let databaseMachines: any[] = [];
      try {
        databaseMachines = await machineService.getMachines();
        console.log("Fetched machines from database:", databaseMachines.length);
      } catch (error) {
        console.error("Error fetching machines from database:", error);
        databaseMachines = [];
      }
      
      const databaseMachineIds = databaseMachines.map(machine => 
        (machine.id || machine._id).toString()
      );
      
      console.log("Available machine IDs from database:", databaseMachineIds);
      setAvailableMachineIds(databaseMachineIds);
      
      const allCertifications = await fetchAvailableMachinesForCertification(databaseMachines);
      console.log("All certifications filtered:", allCertifications.length);
      
      let userCerts = [];
      try {
        userCerts = await certificationService.getUserCertifications(user.id);
        console.log("Fresh certifications from service:", userCerts);
      } catch (err) {
        console.error("Error fetching fresh certifications:", err);
        userCerts = (user?.certifications || []).map(cert => 
          typeof cert === 'string' ? cert : cert.toString()
        );
      }
      
      console.log("User certifications in CertificationsCard:", userCerts);
      
      const statuses = {};
      for (const machine of databaseMachines) {
        const machineId = (machine.id || machine._id).toString();
        try {
          const status = await machineService.getMachineStatus(machineId);
          statuses[machineId] = status;
        } catch (err) {
          console.error("Error fetching machine status:", err);
          statuses[machineId] = 'unknown';
        }
      }
      setMachineStatuses(statuses);
      
      const specialMachines = [];
      if (!allCertifications.some(m => (m.id || m._id).toString() === "5")) {
        specialMachines.push({
          id: "5",
          name: "Safety Cabinet",
          type: "Safety",
          status: "available"
        });
      }
      
      if (!allCertifications.some(m => (m.id || m._id).toString() === "6")) {
        specialMachines.push({
          id: "6",
          name: "Safety Course",
          type: "Course",
          status: "available"
        });
      }
      
      const combinedMachines = [...allCertifications, ...specialMachines];
      
      if (userCerts.length > 0) {
        const validMachineIds = [...databaseMachineIds, ...SPECIAL_MACHINE_IDS];
        const staleCertifications = userCerts.filter(cert => !validMachineIds.includes(cert));
        
        if (staleCertifications.length > 0) {
          console.log(`Found ${staleCertifications.length} stale certifications to remove:`, staleCertifications);
          
          for (const certId of staleCertifications) {
            try {
              await certificationService.removeCertification(user.id, certId);
              console.log(`Removed stale certification for machine ${certId}`);
            } catch (error) {
              console.error(`Failed to remove stale certification for machine ${certId}:`, error);
            }
          }
          
          try {
            userCerts = await certificationService.getUserCertifications(user.id);
            console.log("Updated certifications after cleanup:", userCerts);
          } catch (err) {
            console.error("Error fetching updated certifications:", err);
          }
        }
      }
      
      // Create a map of existing machine IDs for quick lookup
      const existingMachineMap = {};
      databaseMachines.forEach(machine => {
        const machineId = (machine.id || machine._id).toString();
        existingMachineMap[machineId] = true;
      });
      
      // Only show machines that exist in the database (except special IDs)
      const formattedMachines = combinedMachines
        .filter(machine => {
          const machineId = machine.id?.toString() || machine._id?.toString();
          return SPECIAL_MACHINE_IDS.includes(machineId) || existingMachineMap[machineId];
        })
        .map(machine => {
          const machineId = (machine.id || machine._id).toString();
          const certDate = user?.certificationDates?.[machineId] 
            ? new Date(user.certificationDates[machineId])
            : new Date();
          
          // Add linked course information if available
          const linkedCourseId = machine.linkedCourseId;
          const linkedCourse = linkedCourseId && coursesMap[linkedCourseId] 
            ? coursesMap[linkedCourseId] 
            : null;
          
          return {
            id: machineId,
            name: machine.name,
            certified: userCerts.includes(machineId),
            date: format(certDate, 'dd/MM/yyyy'),
            bookable: !SPECIAL_MACHINE_IDS.includes(machineId),
            status: statuses[machineId] || (SPECIAL_MACHINE_IDS.includes(machineId) ? 'available' : 'unknown'),
            linkedCourseId: linkedCourseId || null,
            courseName: linkedCourse ? linkedCourse.title : null
          };
        });
      
      console.log(`Displaying machines: ${formattedMachines.map(m => m.name).join(', ')}`);
      setMachines(formattedMachines);
    } catch (error) {
      console.error("Error fetching machines:", error);
      toast({
        title: "Error",
        description: "Failed to load machine data"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAvailableMachinesForCertification = async (databaseMachines: any[]): Promise<any[]> => {
    return databaseMachines.filter(machine => {
      const machineId = (machine.id || machine._id).toString();
      const machineName = machine.name?.toLowerCase();
      
      if (machineName && machineName === "cnc mill") {
        return false;
      }
      
      return true;
    });
  };

  useEffect(() => {
    fetchMachinesAndCertifications();
  }, [user]);

  const handleAction = (machineId: string) => {
    navigate(`/machine/${machineId}`);
  };

  const navigateToCourse = (courseId: string) => {
    if (courseId) {
      navigate(`/course/${courseId}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-green-600';
      case 'maintenance':
        return 'text-red-600';
      case 'in-use':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      case 'in-use':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = () => {
    fetchMachinesAndCertifications();
  };

  if (!user) return null;

  return (
    <Card className="border-purple-100">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Key size={20} className="text-purple-600" />
            Machine Certifications
          </CardTitle>
          <CardDescription>Manage your machine certifications</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="ml-auto"
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <div>Loading machines...</div>
          </div>
        ) : machines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div>No machines available for certification</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {machines.map((machine) => (
              <div key={machine.id} className="border border-purple-100 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                <div className="font-medium text-purple-800 flex justify-between items-center">
                  <span>{machine.name}</span>
                  {machine.status && (
                    <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusClass(machine.status)}`}>
                      {machine.status.replace('-', ' ')}
                    </span>
                  )}
                </div>
                
                {machine.requiresCertification !== false ? (
                  <>
                    {machine.certified ? (
                      <>
                        <div className="text-sm text-green-600 font-medium mb-1 flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Certified
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          Certified on: {machine.date}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-red-500 mb-1">Not certified</div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-blue-500 mb-1">No certification required</div>
                )}
                
                {/* Only display linked course if there is a valid course ID and it's not the Laser Cutter */}
                {machine.linkedCourseId && machine.courseName && machine.id !== MACHINE_ID_LASER_CUTTER && (
                  <div className="mt-2 mb-2">
                    <div className="text-xs text-purple-600 font-medium flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Required Course:
                    </div>
                    <Button 
                      variant="link" 
                      className="text-xs p-0 h-auto text-blue-600 hover:text-blue-800"
                      onClick={() => navigateToCourse(machine.linkedCourseId)}
                    >
                      {machine.courseName || "View Course"}
                    </Button>
                  </div>
                )}
                
                {machine.bookable ? (
                  <div className="flex flex-col gap-2 mt-3">
                    <BookMachineButton 
                      machineId={machine.id}
                      isCertified={machine.certified || machine.requiresCertification === false}
                      machineStatus={machine.status}
                      size="sm"
                      className="w-full"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-1 border-purple-200 hover:bg-purple-100"
                      onClick={() => navigate(`/machine/${machine.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-purple-600 mt-2">
                    {machine.requiresCertification !== false ? "Certification Complete" : "No certification required"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificationsCard;
