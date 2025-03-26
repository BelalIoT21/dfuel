
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
import { useToast } from '@/hooks/use-toast';
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
  
  // Track safety certification specifically
  const [hasSafetyCertification, setHasSafetyCertification] = useState(false);

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
        databaseMachines = await machineService.getAllMachines();
        console.log("Fetched machines from database:", databaseMachines.length);
      } catch (error) {
        console.error("Error fetching machines from database:", error);
        databaseMachines = [];
      }
      
      // Get user certifications
      let userCertifications: string[] = [];
      try {
        userCertifications = await certificationService.getUserCertifications(user.id);
        console.log("User certifications:", userCertifications);
        
        // Check for safety certification
        setHasSafetyCertification(userCertifications.includes('6'));
      } catch (error) {
        console.error("Error fetching user certifications:", error);
        if (user.certifications && Array.isArray(user.certifications)) {
          userCertifications = user.certifications.map(cert => String(cert));
          setHasSafetyCertification(userCertifications.includes('6'));
        }
      }
      
      // Include special machines
      const specialMachines = [
        {
          _id: "5",
          id: "5",
          name: "Safety Cabinet",
          type: "Safety",
          description: "For safely storing hazardous materials",
          status: "available",
          linkedCourseId: "5",
          linkedQuizId: "5",
          requiresCertification: true
        },
        {
          _id: "6",
          id: "6",
          name: "Machine Safety Course",
          type: "Safety",
          description: "Essential safety training for all machine users",
          status: "available",
          linkedCourseId: "6",
          linkedQuizId: "6",
          requiresCertification: true
        }
      ];
      
      // Add special machines if they don't exist
      for (const specialMachine of specialMachines) {
        if (!databaseMachines.some(m => String(m.id) === String(specialMachine.id))) {
          databaseMachines.push(specialMachine);
        }
      }
      
      // Process machines with certifications
      const processedMachines = databaseMachines.map(machine => {
        const machineId = String(machine.id || machine._id);
        const isCertified = userCertifications.includes(machineId);
        
        return {
          ...machine,
          id: machineId,
          isCertified,
          type: machine.type || "Machine"
        };
      });
      
      // Fetch machine statuses
      const statuses = {};
      for (const machine of processedMachines) {
        try {
          if (machine.id && machine.id !== "5" && machine.id !== "6") { // Safety machines are always available
            const status = await machineService.getMachineStatus(machine.id);
            statuses[machine.id] = status.toLowerCase();
          } else {
            statuses[machine.id] = "available";
          }
        } catch (err) {
          console.error(`Error getting status for machine ${machine.id}:`, err);
          statuses[machine.id] = machine.status?.toLowerCase() || "available";
        }
      }
      
      setMachineStatuses(statuses);
      setMachines(processedMachines);
      setAvailableMachineIds(processedMachines.map(m => m.id));
    } catch (error) {
      console.error("Error in fetchMachinesAndCertifications:", error);
      toast({
        title: "Error",
        description: "Failed to load certifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachinesAndCertifications();
  }, [user]);

  const handleRefresh = () => {
    fetchMachinesAndCertifications();
  };

  const navigateToMachine = (machineId: string) => {
    navigate(`/machine/${machineId}`);
  };
  
  const navigateToCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };
  
  const navigateToQuiz = (quizId: string) => {
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-purple-600" />
              Certifications
            </div>
          </CardTitle>
          <CardDescription>Machines you're certified to use</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Safety course is special and should always be shown
  const safetyCourse = machines.find(m => m.id === "6");
  const hasCompletedSafetyCourse = hasSafetyCertification;
  
  // Filter machines to show:
  // 1. Machines the user is certified for
  // 2. Safety machine (id 6) if not certified
  const displayMachines = machines.filter(machine => 
    machine.isCertified || // Show machines user is certified for
    machine.id === "6" // Always show safety course
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              <div className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-purple-600" />
                Certifications
              </div>
            </CardTitle>
            <CardDescription>Machines you're certified to use</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasCompletedSafetyCourse && safetyCourse && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-4">
            <h3 className="text-amber-800 font-medium mb-2">Safety Course Required</h3>
            <p className="text-amber-700 text-sm mb-3">
              You need to complete the Machine Safety Course to get certified for other machines.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                className="bg-amber-100 border-amber-300 text-amber-800"
                onClick={() => navigateToCourse(safetyCourse.linkedCourseId)}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Take Safety Course
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="bg-amber-100 border-amber-300 text-amber-800"
                onClick={() => navigateToQuiz(safetyCourse.linkedQuizId)}
              >
                <Award className="mr-2 h-4 w-4" />
                Take Safety Quiz
              </Button>
            </div>
          </div>
        )}
        
        {displayMachines.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">You're not certified for any machines yet.</p>
            {hasCompletedSafetyCourse ? (
              <Button onClick={() => navigate('/machines')}>
                View Available Machines
              </Button>
            ) : safetyCourse ? (
              <Button onClick={() => navigateToCourse(safetyCourse.linkedCourseId)}>
                <BookOpen className="mr-2 h-4 w-4" />
                Take Safety Course
              </Button>
            ) : (
              <Button onClick={() => navigate('/machines')}>
                View Machines
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayMachines.map((machine) => {
              const machineStatus = machineStatuses[machine.id] || machine.status || 'unknown';
              const requiresCertification = machine.requiresCertification !== false;
              
              return (
                <div 
                  key={machine.id} 
                  className="border rounded-md p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{machine.name}</h3>
                      <p className="text-sm text-gray-500">{machine.type}</p>
                    </div>
                    <div className={`
                      px-2 py-1 rounded-full text-xs font-medium 
                      ${machineStatus === 'available' ? 'bg-green-100 text-green-800' : 
                        machineStatus === 'maintenance' ? 'bg-red-100 text-red-800' : 
                        machineStatus === 'in-use' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {machineStatus === 'available' ? 'Available' : 
                       machineStatus === 'maintenance' ? 'Maintenance' : 
                       machineStatus === 'in-use' ? 'In Use' : 
                       'Unknown'}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigateToMachine(machine.id)}
                    >
                      View Details
                    </Button>
                    
                    {machine.linkedCourseId && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigateToCourse(machine.linkedCourseId)}
                      >
                        <BookOpen className="mr-1 h-4 w-4" />
                        Course
                      </Button>
                    )}
                    
                    {machine.linkedQuizId && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigateToQuiz(machine.linkedQuizId)}
                      >
                        <Award className="mr-1 h-4 w-4" />
                        Quiz
                      </Button>
                    )}
                    
                    {machineStatus === 'available' && 
                     machine.isCertified && 
                     machine.id !== "5" && // Not safety cabinet
                     machine.id !== "6" && // Not safety course
                     (
                      <BookMachineButton 
                        machineId={machine.id} 
                        isCertified={machine.isCertified}
                        machineStatus={machineStatus}
                        className="ml-auto"
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              );
            })}
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/machines')}
            >
              View All Machines
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificationsCard;
