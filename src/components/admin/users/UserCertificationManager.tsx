
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash } from 'lucide-react';
import { certificationService } from '@/services/certificationService';

interface UserCertificationManagerProps {
  user: any;
  onCertificationAdded: () => void;
}

// Define all certifications
const CERTIFICATIONS = [
  { id: "1", name: "Laser Cutter" },
  { id: "2", name: "Ultimaker" },
  { id: "3", name: "X1 E Carbon 3D Printer" },
  { id: "4", name: "Bambu Lab X1 E" },
  { id: "5", name: "Safety Cabinet" },
  { id: "6", name: "Safety Course" },
];

export const UserCertificationManager = ({ user, onCertificationAdded }: UserCertificationManagerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Handle adding a certification
  const handleAddCertification = async (certificationId: string) => {
    // Ensure we always use the id field
    const userId = user.id || user._id;
    
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is missing. Cannot add certification.",
        variant: "destructive"
      });
      return;
    }

    setLoading(certificationId);
    try {
      console.log(`Attempting to add certification ${certificationId} for user ${userId}`);
      
      const success = await certificationService.addCertification(userId.toString(), certificationId);
      
      if (success) {
        toast({
          title: "Certification Added",
          description: `User certification for ${CERTIFICATIONS.find(c => c.id === certificationId)?.name} has been updated.`
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

  // Handle removing a certification
  const handleRemoveCertification = async (certificationId: string) => {
    // Ensure we always use the id field
    const userId = user.id || user._id;
    
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is missing. Cannot remove certification.",
        variant: "destructive"
      });
      return;
    }

    setLoading(certificationId);
    try {
      console.log(`Attempting to remove certification ${certificationId} for user ${userId}`);
      
      const success = await certificationService.removeCertification(userId.toString(), certificationId);
      
      if (success) {
        toast({
          title: "Certification Removed",
          description: `User certification for ${CERTIFICATIONS.find(c => c.id === certificationId)?.name} has been removed.`
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

  // Handle clearing all certifications
  const handleClearAllCertifications = async () => {
    // Ensure we always use the id field
    const userId = user.id || user._id;
    
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is missing. Cannot clear certifications.",
        variant: "destructive"
      });
      return;
    }

    setIsClearing(true);
    try {
      console.log(`Attempting to clear all certifications for user ${userId}`);
      
      const success = await certificationService.clearAllCertifications(userId.toString());
      
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

  // Helper function to determine if user has a certification
  const hasCertification = (certificationId: string) => {
    if (!user || !user.certifications) return false;
    const certStrings = user.certifications.map(cert => cert.toString());
    return certStrings.includes(certificationId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Manage Certifications</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Certifications for {user.name}</DialogTitle>
          <DialogDescription>
            Add or remove certifications for this user.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="text-sm font-medium mb-2">Certifications</h4>
          <div className="grid grid-cols-1 gap-2">
            {CERTIFICATIONS.map(certification => {
              const isCertified = hasCertification(certification.id);
              return (
                <div key={certification.id} className="flex justify-between items-center border p-2 rounded">
                  <span>{certification.name}</span>
                  <div>
                    {isCertified ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveCertification(certification.id)}
                        disabled={loading === certification.id}
                        className="bg-red-50 hover:bg-red-100 border-red-200"
                      >
                        {loading === certification.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCertification(certification.id)}
                        disabled={loading === certification.id}
                      >
                        {loading === certification.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
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
