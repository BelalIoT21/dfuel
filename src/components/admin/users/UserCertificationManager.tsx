import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Trash } from 'lucide-react';
import { certificationService } from '@/services/certificationService';
import { certificationDatabaseService } from '@/services/database/certificationService';

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
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [userCertifications, setUserCertifications] = useState<string[]>([]);
  const { toast } = useToast();

  // Get the userId in a consistent format
  const getUserId = () => {
    return user._id?.toString() || user.id?.toString();
  };

  // Load user certifications on dialog open
  useEffect(() => {
    if (open && user) {
      const loadCertifications = async () => {
        const userId = getUserId();
        try {
          console.log("Loading certifications for user ID:", userId);
          
          // Get fresh certifications from MongoDB
          const certs = await certificationService.getUserCertifications(userId);
          console.log("Received certifications from service:", certs);
          
          if (certs && certs.length > 0) {
            // Make sure all certifications are converted to strings
            setUserCertifications(certs.map(c => c.toString()));
          } else {
            // Fall back to user object
            const certifications = user.certifications 
              ? user.certifications.map((cert: any) => cert.toString())
              : [];
            setUserCertifications(certifications);
          }
        } catch (error) {
          console.error("Error loading certifications:", error);
          // Fall back to user object
          const certifications = user.certifications 
            ? user.certifications.map((cert: any) => cert.toString())
            : [];
          setUserCertifications(certifications);
        }
      };
      
      loadCertifications();
    }
  }, [open, user]);

  // Handle adding a certification
  const handleAddCertification = async (certificationId: string) => {
    const userId = getUserId();
    
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is missing. Cannot add certification."
      });
      return;
    }

    setLoading(certificationId);
    try {
      console.log(`Attempting to add certification ${certificationId} for user ${userId}`);
      
      const success = await certificationDatabaseService.addCertification(userId, certificationId);
      
      if (success) {
        // Update local state
        setUserCertifications(prev => {
          if (!prev.includes(certificationId)) {
            return [...prev, certificationId];
          }
          return prev;
        });
        
        toast({
          title: "Certification Added",
          description: `User certification for ${CERTIFICATIONS.find(c => c.id === certificationId)?.name} has been added.`
        });
        onCertificationAdded();
      } else {
        toast({
          title: "Error",
          description: "Failed to add certification."
        });
      }
    } catch (error) {
      console.error("Error adding certification:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding certification."
      });
    } finally {
      setLoading(null);
    }
  };

  // Handle removing a certification
  const handleRemoveCertification = async (certificationId: string) => {
    const userId = getUserId();
    
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is missing. Cannot remove certification."
      });
      return;
    }

    setLoading(certificationId);
    try {
      console.log(`Attempting to remove certification ${certificationId} for user ${userId}`);
      
      const success = await certificationDatabaseService.removeCertification(userId, certificationId);
      
      if (success) {
        // Update local state
        setUserCertifications(prev => prev.filter(id => id !== certificationId));
        
        toast({
          title: "Certification Removed",
          description: `User certification for ${CERTIFICATIONS.find(c => c.id === certificationId)?.name} has been removed.`
        });
        onCertificationAdded();
      } else {
        toast({
          title: "Error",
          description: "Failed to remove certification."
        });
      }
    } catch (error) {
      console.error("Error removing certification:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while removing certification."
      });
    } finally {
      setLoading(null);
    }
  };

  // Handle clearing all certifications
  const handleClearAllCertifications = async () => {
    const userId = getUserId();
    
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is missing. Cannot clear certifications."
      });
      return;
    }

    setIsClearing(true);
    try {
      console.log(`Attempting to clear all certifications for user ${userId}`);
      
      const success = await certificationDatabaseService.clearUserCertifications(userId);
      
      if (success) {
        // Update local state
        setUserCertifications([]);
        
        toast({
          title: "Certifications Cleared",
          description: "All certifications have been removed from this user."
        });
        onCertificationAdded();
      } else {
        toast({
          title: "Error",
          description: "Failed to clear certifications."
        });
      }
    } catch (error) {
      console.error("Error clearing certifications:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while clearing certifications."
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Helper function to determine if user has a certification
  const hasCertification = (certificationId: string) => {
    return userCertifications.includes(certificationId);
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
              const isCertified = userCertifications.includes(certification.id);
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
                        {loading === certification.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCertification(certification.id)}
                        disabled={loading === certification.id}
                      >
                        {loading === certification.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {userCertifications.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <Button 
                variant="outline"
                size="sm"
                className="w-full border-red-200 hover:bg-red-50 text-red-700"
                onClick={() => {
                  setIsClearing(true);
                  certificationDatabaseService.clearUserCertifications(getUserId())
                    .then(success => {
                      if (success) {
                        setUserCertifications([]);
                        toast({
                          title: "Certifications Cleared",
                          description: "All certifications have been removed from this user."
                        });
                        onCertificationAdded();
                      } else {
                        toast({
                          title: "Error",
                          description: "Failed to clear certifications."
                        });
                      }
                      setIsClearing(false);
                    })
                    .catch(error => {
                      console.error("Error clearing certifications:", error);
                      toast({
                        title: "Error",
                        description: "An unexpected error occurred while clearing certifications."
                      });
                      setIsClearing(false);
                    });
                }}
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
