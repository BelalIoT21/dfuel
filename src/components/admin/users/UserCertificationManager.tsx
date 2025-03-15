
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { certificationService } from '@/services/certificationService';
import { machines } from '@/utils/data';
import { Loader2, Trash } from 'lucide-react';
import mongoDbService from '@/services/mongoDbService';
import { localStorageService } from '@/services/localStorageService';

interface UserCertificationManagerProps {
  user: any;
  onCertificationAdded: () => void;
}

export const UserCertificationManager = ({ user, onCertificationAdded }: UserCertificationManagerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleAddCertification = async (userId: string, machineId: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(machineId);
    try {
      console.log(`Adding certification for machine ID: ${machineId} to user ID: ${userId}`);
      
      // Use certificationService as the primary method
      const success = await certificationService.addCertification(userId, machineId);
      
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
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(machineId);
    try {
      console.log(`Removing certification for machine ID: ${machineId} from user ID: ${userId}`);
      
      const success = await certificationService.removeCertification(userId, machineId);
      
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
      toast({
        title: "Error",
        description: "User ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    setLoading('machineSafety');
    try {
      console.log(`Adding Machine Safety Course (ID: 6) for user ${userId}`);
      
      const success = await certificationService.addMachineSafetyCertification(userId);
      
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
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    setLoading('machineSafety');
    try {
      console.log(`Removing Machine Safety Course (ID: 6) for user ${userId}`);
      
      const success = await certificationService.removeMachineSafetyCertification(userId);
      
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
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "User ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    setIsClearing(true);
    try {
      let success = false;
      try {
        success = await certificationService.clearAllCertifications(user.id || user._id);
      } catch (error) {
        console.error("Error in certification service:", error);
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

  const userId = user.id || user._id;
  const hasMachineSafetyCourse = user?.certifications?.includes("6");

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
                    onClick={() => handleRemoveMachineSafetyCourse(userId)}
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
                    onClick={() => handleMachineSafetyCourse(userId)}
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
                    onClick={() => handleRemoveCertification(userId, "3")}
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
                    onClick={() => handleAddCertification(userId, "3")}
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
                    onClick={() => handleRemoveCertification(userId, "5")}
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
                    onClick={() => handleAddCertification(userId, "5")}
                    disabled={loading === "5" || !hasMachineSafetyCourse}
                    className={!hasMachineSafetyCourse ? "opacity-50" : ""}
                  >
                    {loading === "5" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {!hasMachineSafetyCourse ? "Requires Safety Course" : "Add"}
                  </Button>
                )}
              </div>
            </div>
            
            {machines.filter(m => m.id !== "5" && m.id !== "6" && m.id !== "3").map(machine => (
              <div key={machine.id} className="flex justify-between items-center border p-2 rounded">
                <span>{machine.name}</span>
                <div>
                  {user.certifications?.includes(machine.id) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveCertification(userId, machine.id)}
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
                      onClick={() => handleAddCertification(userId, machine.id)}
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
                onClick={handleClearAllCertifications}
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
