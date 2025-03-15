
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { certificationService } from '@/services/certificationService';
import { machines } from '@/utils/data';
import { Loader2 } from 'lucide-react';

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
      setOpen(false); // Close dialog after action
    }
  };

  const handleRemoveCertification = async (userId: string, machineId: string) => {
    setLoading(machineId);
    try {
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
      setOpen(false); // Close dialog after action
    }
  };

  const handleMachineSafetyCourse = async (userId: string) => {
    setLoading('machineSafety');
    try {
      console.log("Adding machine safety course certification");
      // Use the specific certification method with the safety ID
      const success = await certificationService.addCertification(userId, "6");
      
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
      setOpen(false); // Close dialog after action
    }
  };

  const handleRemoveMachineSafetyCourse = async (userId: string) => {
    setLoading('machineSafety');
    try {
      console.log("Removing machine safety course certification");
      // Use direct certification removal with the safety ID
      const success = await certificationService.removeCertification(userId, "6");
      
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
      setOpen(false); // Close dialog after action
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
