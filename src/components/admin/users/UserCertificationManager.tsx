
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { certificationService } from '@/services/certificationService';
import { machines } from '@/utils/data';
import { Loader2, Trash } from 'lucide-react';
import mongoDbService from '@/services/mongoDbService';
import { localStorageService } from '@/services/localStorageService';
import { machineService } from '@/services/machineService';

interface UserCertificationManagerProps {
  user: any;
  onCertificationAdded: () => void;
}

export const UserCertificationManager = ({ user, onCertificationAdded }: UserCertificationManagerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [allMachines, setAllMachines] = useState<any[]>([]);
  
  useEffect(() => {
    const loadMachines = async () => {
      try {
        const machines = await machineService.getMachines();
        // Filter out duplicates by ID
        const uniqueMachines = Array.from(
          new Map(machines.map(m => [m._id || m.id, m])).values()
        );
        console.log(`Loaded ${uniqueMachines.length} unique machines for certification manager`);
        setAllMachines(uniqueMachines);
      } catch (error) {
        console.error("Error loading machines:", error);
      }
    };
    
    loadMachines();
  }, []);

  const handleAddCertification = async (userId: string, machineId: string) => {
    if (!userId) {
      console.error(`Cannot add certification: user ID is undefined for user`, user);
      toast({
        title: "Error",
        description: "User ID is missing. Cannot add certification.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(machineId);
    try {
      console.log(`Adding certification for machine ID: ${machineId} to user ID: ${userId}`);
      
      // First try MongoDB directly
      let success = false;
      try {
        success = await mongoDbService.updateUserCertifications(userId, machineId);
        console.log(`MongoDB addCertification result: ${success}`);
      } catch (mongoError) {
        console.error("MongoDB certification error:", mongoError);
      }
      
      // If MongoDB direct call fails, try certification service (which tries all options)
      if (!success) {
        success = await certificationService.addCertification(userId, machineId);
        console.log(`CertificationService addCertification result: ${success}`);
      }
      
      if (success) {
        toast({
          title: "Certification Added",
          description: "User certification has been updated."
        });
        onCertificationAdded();
      } else {
        toast({
          title: "Error",
          description: "Failed to add certification.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding certification:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding certification.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveCertification = async (userId: string, machineId: string) => {
    setLoading(machineId);
    try {
      console.log(`Removing certification for machine ID: ${machineId} from user ID: ${userId}`);
      
      let success = false;
      try {
        const userDoc = await mongoDbService.getUserById(userId);
        if (userDoc) {
          const updatedCertifications = userDoc.certifications.filter(id => id !== machineId);
          success = await mongoDbService.updateUser(userId, { certifications: updatedCertifications });
          console.log(`MongoDB removeCertification result: ${success}`);
        }
      } catch (mongoError) {
        console.error("MongoDB remove certification error:", mongoError);
      }
      
      if (!success) {
        success = await certificationService.removeCertification(userId, machineId);
        console.log(`CertificationService removeCertification result: ${success}`);
      }
      
      if (success) {
        toast({
          title: "Certification Removed",
          description: "User certification has been removed."
        });
        onCertificationAdded();
      } else {
        toast({
          title: "Error",
          description: "Failed to remove certification.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error removing certification:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while removing certification.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleMachineSafetyCourse = async (userId: string) => {
    if (!userId) {
      // Make sure to log the user object for debugging
      console.error("Cannot add safety course: user ID is undefined", user);
      toast({
        title: "Error",
        description: "User ID is missing. Cannot add safety course.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading('machineSafety');
    try {
      console.log(`Adding Machine Safety Course (ID: 6) for user ${userId}`);
      
      let success = false;
      try {
        // Try direct MongoDB first
        try {
          success = await mongoDbService.updateUserCertifications(userId, "6");
          console.log(`MongoDB addCertification for Safety Course result: ${success}`);
        } catch (mongoError) {
          console.error("MongoDB error adding safety certification:", mongoError);
        }
        
        // If MongoDB fails, try certification service
        if (!success) {
          console.log("MongoDB failed, trying certification service...");
          success = await certificationService.addCertification(userId, "6");
          console.log(`addCertification result: ${success}`);
        }
        
        // Last resort: add directly to localStorage
        if (!success) {
          console.log("Both methods failed, trying direct localStorage update...");
          const user = localStorageService.findUserById(userId);
          if (user) {
            if (!user.certifications) user.certifications = [];
            if (!user.certifications.includes("6")) {
              user.certifications.push("6");
              success = localStorageService.updateUser(userId, { certifications: user.certifications });
              console.log(`Direct localStorage update result: ${success}`);
            } else {
              console.log("User already has certification in localStorage");
              success = true;
            }
          }
        }
      } catch (error) {
        console.error("Error in addCertification:", error);
      }
      
      if (success) {
        toast({
          title: "Machine Safety Course Completed",
          description: "User has completed the machine safety course."
        });
        onCertificationAdded();
      } else {
        toast({
          title: "Error",
          description: "Failed to add machine safety certification.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding machine safety certification:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding machine safety certification.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveMachineSafetyCourse = async (userId: string) => {
    setLoading('machineSafety');
    try {
      console.log(`Removing Machine Safety Course (ID: 6) for user ${userId}`);
      
      let success = false;
      try {
        // Try MongoDB first
        try {
          const userDoc = await mongoDbService.getUserById(userId);
          if (userDoc) {
            const updatedCertifications = userDoc.certifications.filter(id => id !== "6");
            success = await mongoDbService.updateUser(userId, { certifications: updatedCertifications });
            console.log(`MongoDB removeCertification for Safety Course result: ${success}`);
          }
        } catch (mongoError) {
          console.error("MongoDB remove certification error:", mongoError);
        }
        
        // If MongoDB fails, use certification service
        if (!success) {
          success = await certificationService.removeCertification(userId, "6");
          console.log(`removeCertification result: ${success}`);
        }
      } catch (error) {
        console.error("Error in removeCertification:", error);
      }
      
      if (success) {
        toast({
          title: "Machine Safety Course Removed",
          description: "User's machine safety certification has been removed."
        });
        onCertificationAdded();
      } else {
        toast({
          title: "Error",
          description: "Failed to remove machine safety certification.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error removing machine safety certification:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while removing machine safety certification.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleClearAllCertifications = async () => {
    if (!user || !user.id) return;
    
    setIsClearing(true);
    try {
      let success = false;
      try {
        success = await mongoDbService.updateUser(user.id, { certifications: [] });
        console.log(`MongoDB clearCertifications result: ${success}`);
      } catch (mongoError) {
        console.error("MongoDB error clearing certifications:", mongoError);
      }
      
      if (!success) {
        success = await localStorageService.updateUser(user.id, { certifications: [] });
        console.log(`LocalStorage clearCertifications result: ${success}`);
      }
      
      if (success) {
        toast({
          title: "Certifications Cleared",
          description: "All certifications have been removed from this user."
        });
        onCertificationAdded();
      } else {
        toast({
          title: "Error",
          description: "Failed to clear certifications.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error clearing certifications:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while clearing certifications.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  const hasMachineSafetyCourse = user?.certifications?.includes("6");
  
  // Helper function to get MongoDB machine names
  const getMachineName = (machineId: string) => {
    if (machineId === "6") return "Machine Safety Course";
    if (machineId === "5") return "Bambu Lab X1 E";
    if (machineId === "3") return "Safety Cabinet";
    
    const machine = allMachines.find(m => m.id === machineId || m._id === machineId);
    if (machine) return machine.name;
    
    const localMachine = machines.find(m => m.id === machineId);
    return localMachine ? localMachine.name : `Machine ${machineId}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Manage</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage User: {user.name}</DialogTitle>
          <DialogDescription>
            Manage certifications and settings for this user.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="text-sm font-medium mb-2">Safety Certifications</h4>
          <div className="grid grid-cols-1 gap-2 mb-4">
            <div className="flex justify-between items-center border p-2 rounded">
              <span>Machine Safety Course</span>
              <div>
                {hasMachineSafetyCourse ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMachineSafetyCourse(user.id || user._id)}
                    disabled={loading === 'machineSafety'}
                    className="bg-red-50 hover:bg-red-100 border-red-200"
                  >
                    {loading === 'machineSafety' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Remove
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMachineSafetyCourse(user.id || user._id)}
                    disabled={loading === 'machineSafety'}
                  >
                    {loading === 'machineSafety' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <h4 className="text-sm font-medium mb-2">Machine Certifications</h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between items-center border p-2 rounded">
              <span>Safety Cabinet</span>
              <div>
                {user.certifications?.includes("3") ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveCertification(user.id || user._id, "3")}
                    disabled={loading === "3"}
                    className="bg-red-50 hover:bg-red-100 border-red-200"
                  >
                    {loading === "3" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Remove
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddCertification(user.id || user._id, "3")}
                    disabled={loading === "3" || !hasMachineSafetyCourse}
                    className={!hasMachineSafetyCourse ? "opacity-50" : ""}
                  >
                    {loading === "3" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {!hasMachineSafetyCourse ? "Requires Safety Course" : "Add"}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center border p-2 rounded">
              <span>Bambu Lab X1 E</span>
              <div>
                {user.certifications?.includes("5") ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveCertification(user.id || user._id, "5")}
                    disabled={loading === "5"}
                    className="bg-red-50 hover:bg-red-100 border-red-200"
                  >
                    {loading === "5" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Remove
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddCertification(user.id || user._id, "5")}
                    disabled={loading === "5" || !hasMachineSafetyCourse}
                    className={!hasMachineSafetyCourse ? "opacity-50" : ""}
                  >
                    {loading === "5" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {!hasMachineSafetyCourse ? "Requires Safety Course" : "Add"}
                  </Button>
                )}
              </div>
            </div>
            
            {/* MongoDB machines - filtered to avoid duplicates */}
            {allMachines
              .filter(m => {
                // Skip special machines and duplicates that we handle manually
                return m._id && 
                       m._id !== "5" && 
                       m._id !== "6" && 
                       m._id !== "3" && 
                       // Skip CNC Mill
                       m.name.toLowerCase() !== "cnc mill";
              })
              .map(machine => (
                <div key={machine._id} className="flex justify-between items-center border p-2 rounded">
                  <span>{machine.name}</span>
                  <div>
                    {user.certifications?.includes(machine._id) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveCertification(user.id || user._id, machine._id)}
                        disabled={loading === machine._id}
                        className="bg-red-50 hover:bg-red-100 border-red-200"
                      >
                        {loading === machine._id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCertification(user.id || user._id, machine._id)}
                        disabled={loading === machine._id || !hasMachineSafetyCourse}
                        className={!hasMachineSafetyCourse ? "opacity-50" : ""}
                      >
                        {loading === machine._id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {!hasMachineSafetyCourse ? "Requires Safety Course" : "Add"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            
            {/* Local machines - filtered to avoid duplicates */}
            {machines
              .filter(m => {
                // Skip special machines and duplicates that we handle manually
                return m.id !== "5" && 
                       m.id !== "6" && 
                       m.id !== "3" && 
                       // Skip machines that exist in MongoDB
                       !allMachines.some(dbMachine => dbMachine.name === m.name) &&
                       // Skip CNC Mill
                       m.name.toLowerCase() !== "cnc mill";
              })
              .map(machine => (
                <div key={machine.id} className="flex justify-between items-center border p-2 rounded">
                  <span>{machine.name}</span>
                  <div>
                    {user.certifications?.includes(machine.id) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveCertification(user.id || user._id, machine.id)}
                        disabled={loading === machine.id}
                        className="bg-red-50 hover:bg-red-100 border-red-200"
                      >
                        {loading === machine.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCertification(user.id || user._id, machine.id)}
                        disabled={loading === machine.id || !hasMachineSafetyCourse}
                        className={!hasMachineSafetyCourse ? "opacity-50" : ""}
                      >
                        {loading === machine.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {!hasMachineSafetyCourse ? "Requires Safety Course" : "Add"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
          
          {user.certifications?.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <Button 
                variant="outline"
                size="sm"
                className="w-full border-red-200 hover:bg-red-50 text-red-700"
                onClick={() => handleClearAllCertifications()}
                disabled={isClearing}
              >
                {isClearing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Trash className="h-4 w-4 mr-2" />
                Clear All Certifications
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
