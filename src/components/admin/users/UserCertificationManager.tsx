
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { certificationService } from '@/services/certificationService';
import { machines } from '@/utils/data';
import { Loader2 } from 'lucide-react';
import mongoDbService from '@/services/mongoDbService';

interface UserCertificationManagerProps {
  user: any;
  onCertificationAdded: () => void;
}

export const UserCertificationManager = ({ user, onCertificationAdded }: UserCertificationManagerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleAddCertification = async (userId: string, machineId: string) => {
    setLoading(machineId);
    try {
      console.log(`Adding certification for machine ID: ${machineId} to user ID: ${userId}`);
      
      // Try MongoDB first for direct access
      let success = false;
      try {
        success = await mongoDbService.updateUserCertifications(userId, machineId);
        console.log(`MongoDB addCertification result: ${success}`);
      } catch (mongoError) {
        console.error("MongoDB certification error:", mongoError);
      }
      
      // If MongoDB fails, try the certification service
      if (!success) {
        success = await certificationService.addCertification(userId, machineId);
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
      
      // Try MongoDB first with direct user update
      let success = false;
      try {
        const user = await mongoDbService.getUserById(userId);
        if (user) {
          const updatedCertifications = user.certifications.filter(id => id !== machineId);
          success = await mongoDbService.updateUser(userId, { certifications: updatedCertifications });
          console.log(`MongoDB removeCertification result: ${success}`);
        }
      } catch (mongoError) {
        console.error("MongoDB remove certification error:", mongoError);
      }
      
      // If MongoDB fails, try the certification service
      if (!success) {
        success = await certificationService.removeCertification(userId, machineId);
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
    setLoading('machineSafety');
    try {
      console.log(`Adding Machine Safety Course (ID: 6) for user ${userId}`);
      
      // Try MongoDB first with direct user update
      let success = false;
      try {
        const user = await mongoDbService.getUserById(userId);
        if (user) {
          if (!user.certifications.includes("6")) {
            const updatedCertifications = [...user.certifications, "6"];
            success = await mongoDbService.updateUser(userId, { certifications: updatedCertifications });
            console.log(`MongoDB addMachineSafetyCourse result: ${success}`);
          } else {
            success = true; // Already has certification
          }
        }
      } catch (mongoError) {
        console.error("MongoDB add machine safety certification error:", mongoError);
      }
      
      // If MongoDB fails, try the certification service
      if (!success) {
        success = await certificationService.addMachineSafetyCertification(userId);
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
      
      // Try MongoDB first with direct user update
      let success = false;
      try {
        const user = await mongoDbService.getUserById(userId);
        if (user) {
          const updatedCertifications = user.certifications.filter(id => id !== "6");
          success = await mongoDbService.updateUser(userId, { certifications: updatedCertifications });
          console.log(`MongoDB removeMachineSafetyCourse result: ${success}`);
        }
      } catch (mongoError) {
        console.error("MongoDB remove machine safety certification error:", mongoError);
      }
      
      // If MongoDB fails, try the certification service
      if (!success) {
        success = await certificationService.removeMachineSafetyCertification(userId);
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

  // Check if the user has a Machine Safety Course certification
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
            {/* Machine Safety Course */}
            <div className="flex justify-between items-center border p-2 rounded">
              <span>Machine Safety Course</span>
              <div>
                {hasMachineSafetyCourse ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMachineSafetyCourse(user.id)}
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
                    onClick={() => handleMachineSafetyCourse(user.id)}
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
            {/* First, the Bambu Lab X1 E (ID "5") */}
            <div className="flex justify-between items-center border p-2 rounded">
              <span>Bambu Lab X1 E</span>
              <div>
                {user.certifications.includes("5") ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveCertification(user.id, "5")}
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
                    onClick={() => handleAddCertification(user.id, "5")}
                    disabled={loading === "5" || !hasMachineSafetyCourse}
                    className={!hasMachineSafetyCourse ? "opacity-50" : ""}
                  >
                    {loading === "5" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {!hasMachineSafetyCourse ? "Requires Safety Course" : "Add"}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Other machines excluding IDs "5" and "6" */}
            {machines.filter(m => m.id !== "5" && m.id !== "6").map(machine => (
              <div key={machine.id} className="flex justify-between items-center border p-2 rounded">
                <span>{machine.name}</span>
                <div>
                  {user.certifications.includes(machine.id) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveCertification(user.id, machine.id)}
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
                      onClick={() => handleAddCertification(user.id, machine.id)}
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
