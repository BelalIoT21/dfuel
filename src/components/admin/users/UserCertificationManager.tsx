
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
    }
  };

  const handleSafetyCertification = async (userId: string) => {
    setLoading('safety');
    try {
      const success = await certificationService.addSafetyCertification(userId);
      
      if (success) {
        toast({
          title: "Safety Certification Added",
          description: "User has been certified for safety training."
        });
        onCertificationAdded();
      } else {
        toast({
          title: "Error",
          description: "Failed to add safety certification.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding safety certification:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding safety certification.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveSafetyCertification = async (userId: string) => {
    setLoading('safety');
    try {
      const success = await certificationService.removeSafetyCertification(userId);
      
      if (success) {
        toast({
          title: "Safety Certification Removed",
          description: "User's safety certification has been removed."
        });
        onCertificationAdded();
      } else {
        toast({
          title: "Error",
          description: "Failed to remove safety certification.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error removing safety certification:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while removing safety certification.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
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
            {/* Basic Safety Training */}
            <div className="flex justify-between items-center border p-2 rounded">
              <span>Basic Safety Training</span>
              <div>
                {user.certifications.includes("5") ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveSafetyCertification(user.id)}
                    disabled={loading === 'safety'}
                    className="bg-red-50 hover:bg-red-100 border-red-200"
                  >
                    {loading === 'safety' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Remove
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSafetyCertification(user.id)}
                    disabled={loading === 'safety'}
                  >
                    {loading === 'safety' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <h4 className="text-sm font-medium mb-2">Machine Certifications</h4>
          <div className="grid grid-cols-1 gap-2">
            {machines.filter(m => m.id !== "5").map(machine => (
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
                      disabled={loading === machine.id || !user.certifications.includes("5")}
                      className={!user.certifications.includes("5") ? "opacity-50" : ""}
                    >
                      {loading === machine.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {!user.certifications.includes("5") ? "Requires Safety Cert" : "Add"}
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
