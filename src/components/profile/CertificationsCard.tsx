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
import { useIsMobile } from '@/hooks/use-mobile';

const SPECIAL_MACHINE_IDS = ["5", "6"]; // Safety Cabinet and Machine Safety Course

interface User {
  id: string;
  certifications?: string[];
}

type AuthUser = {
  id: string;
  certifications?: string[];
};

const CertificationsCard = () => {
  let user: AuthUser | null = null;
  try {
    const auth = useAuth();
    user = auth.user as AuthUser;
  } catch (error) {
    console.error('Error using Auth context in CertificationsCard:', error);
    return null; // Don't render anything if auth is not available
  }

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const [machineStatuses, setMachineStatuses] = useState({});
  const [availableMachineIds, setAvailableMachineIds] = useState<string[]>([]);
  const [coursesMap, setCoursesMap] = useState<Record<string, any>>({});
  const isMobile = useIsMobile();
  
  // Track safety certifications specifically
  const [hasSafetyCertification, setHasSafetyCertification] = useState(false);
  const [hasSafetyCabinetCertification, setHasSafetyCabinetCertification] = useState(false);

  const fetchMachinesAndCertifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setRefreshing(true);
    try {
      let databaseMachines: any[] = [];
      try {
        // Changed to use getAllMachines instead of getMachines to ensure we get ALL machines
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
        
        // Check for safety certifications
        setHasSafetyCertification(userCertifications.includes('6'));
        setHasSafetyCabinetCertification(userCertifications.includes('5'));
      } catch (error) {
        console.error("Error fetching user certifications:", error);
        if (user.certifications && Array.isArray(user.certifications)) {
          userCertifications = user.certifications.map(cert => String(cert));
          setHasSafetyCertification(userCertifications.includes('6'));
          setHasSafetyCabinetCertification(userCertifications.includes('5'));
        }
      }
      
      // Include special machines if not already present
      for (const specialMachineId of SPECIAL_MACHINE_IDS) {
        if (!databaseMachines.some(m => String(m.id) === specialMachineId || String(m._id) === specialMachineId)) {
          // Add default data for special machines
          const specialMachine = {
            _id: specialMachineId,
            id: specialMachineId,
            name: specialMachineId === "5" ? "Safety Cabinet" : "Machine Safety Course",
            type: specialMachineId === "5" ? "Safety Equipment" : "Safety Course",
            description: specialMachineId === "5" 
              ? "For safely storing hazardous materials" 
              : "Essential safety training for all machine users",
            status: "available",
            linkedCourseId: specialMachineId,
            linkedQuizId: specialMachineId,
            requiresCertification: specialMachineId === "5" // Safety cabinet requires certification, Safety course does not
          };
          databaseMachines.push(specialMachine);
        }
      }
      
      // Process machines - important to include ALL machines, not just certified ones
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
      
      // Log the machines for debugging
      console.log("All machines after processing:", processedMachines.map(m => ({ id: m.id, name: m.name })));
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

  const handleBookMachine = (machineId: string) => {
    console.log(`Booking machine ${machineId} from CertificationsCard`);
    navigate(`/booking/${machineId}`);
  };

  if (!user) return null;

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

  // Both safety course and safety cabinet are special and should always be shown
  const safetyCourse = machines.find(m => m.id === "6");
  const safetyCabinet = machines.find(m => m.id === "5");
  const hasCompletedSafetyCourse = hasSafetyCertification;
  const hasCompletedSafetyCabinet = hasSafetyCabinetCertification;
  
  // Modified to show ALL machines if user has completed safety course
  // This allows users to see machines they're not certified for yet
  const displayMachines = hasCompletedSafetyCourse
    ? machines // Show all machines if user has safety certification
    : machines.filter(machine => 
        machine.isCertified || // Show machines user is certified for
        machine.id === "5" ||  // Always show safety cabinet
        machine.id === "6"     // Always show safety course
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
            size={isMobile ? "icon" : "sm"}
            onClick={handleRefresh} 
            disabled={refreshing}
            className={isMobile ? "h-9 w-9 p-0" : ""}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className={`h-4 w-4 ${isMobile ? "" : "mr-1"}`} />
                {!isMobile && <span>Refresh</span>}
              </>
            )}
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
        
        {hasCompletedSafetyCourse && !hasCompletedSafetyCabinet && safetyCabinet && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-4">
            <h3 className="text-blue-800 font-medium mb-2">Safety Cabinet Certification</h3>
            <p className="text-blue-700 text-sm mb-3">
              Get certified to use the Safety Cabinet for storing materials.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                className="bg-blue-100 border-blue-300 text-blue-800"
                onClick={() => navigateToCourse(safetyCabinet.linkedCourseId)}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Safety Cabinet Course
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="bg-blue-100 border-blue-300 text-blue-800"
                onClick={() => navigateToQuiz(safetyCabinet.linkedQuizId)}
              >
                <Award className="mr-2 h-4 w-4" />
                Safety Cabinet Quiz
              </Button>
            </div>
          </div>
        )}
        
        {displayMachines.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">You're not certified for any machines yet.</p>
            {hasCompletedSafetyCourse ? (
              <Button onClick={() => navigate('/machines')}>
                Find Machines to Get Certified
              </Button>
            ) : safetyCourse ? (
              <Button onClick={() => navigateToCourse(safetyCourse.linkedCourseId)}>
                <BookOpen className="mr-2 h-4 w-4" />
                Take Safety Course
              </Button>
            ) : (
              <Button onClick={() => navigate('/machines')}>
                Browse Machines
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
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
                      ${machine.isCertified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
                    `}>
                      {machine.isCertified ? 'Certified' : 'Not Certified'}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificationsCard;
