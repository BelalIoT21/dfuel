import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Trash } from 'lucide-react';
import { certificationDatabaseService } from '@/services/database/certificationService';
import { machineService } from '@/services/machineService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserCertificationManagerProps {
  user: any;
  onCertificationAdded: () => void;
}

// Define special machine IDs
const SPECIAL_MACHINE_IDS = ["5", "6"]; // Safety Cabinet and Safety Course

export const UserCertificationManager = ({ user, onCertificationAdded }: UserCertificationManagerProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [userCertifications, setUserCertifications] = useState<string[]>([]);
  const [availableMachines, setAvailableMachines] = useState<any[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Get the userId in a consistent format
  const getUserId = () => {
    return user._id?.toString() || user.id?.toString();
  };

  // Function to refresh certifications
  const refreshCertifications = async () => {
    const userId = getUserId();
    try {
      console.log("Loading certifications for user ID:", userId);
      
      // Get fresh certifications from MongoDB
      const certs = await certificationDatabaseService.getUserCertifications(userId);
      console.log("Received certifications from service:", certs);
      
      // Always convert to strings
      const formattedCerts = certs.map(cert => cert.toString());
      setUserCertifications(formattedCerts);
    } catch (error) {
      console.error("Error refreshing certifications:", error);
      // Fall back to user object
      const certifications = user.certifications 
        ? user.certifications.map((cert: any) => cert.toString())
        : [];
      setUserCertifications(certifications);
    }
  };
  
  // Function to fetch available machines
  const fetchAvailableMachines = async () => {
    try {
      console.log("Fetching available machines for certification");
      
      // Fetch ALL machines from database
      const machines = await machineService.getAllMachines();
      console.log(`Fetched ${machines.length} machines from database`);
      
      // Add special machines (Safety Cabinet and Safety Course) if they're not in the database
      const specialMachineIds = SPECIAL_MACHINE_IDS.map(id => id.toString());
      
      // Don't filter out any machines - show all of them
      const filteredMachines = machines;
      
      // Ensure each machine has an ID
      const processedMachines = filteredMachines.map(machine => ({
        id: (machine.id || machine._id).toString(),
        name: machine.name
      }));
      
      // Check if special machines are already in the database
      for (const specialId of specialMachineIds) {
        if (!processedMachines.some(m => m.id === specialId)) {
          // Add special machine with appropriate name
          let specialName = "Special Machine";
          if (specialId === "5") specialName = "Safety Cabinet";
          if (specialId === "6") specialName = "Safety Course";
          
          processedMachines.push({
            id: specialId,
            name: specialName
          });
        }
      }
      
      console.log("Available machines for certification:", processedMachines.map(m => ({ id: m.id, name: m.name })));
      setAvailableMachines(processedMachines);
    } catch (error) {
      console.error("Error fetching available machines:", error);
      // Fallback to special machines only
      setAvailableMachines([
        { id: "5", name: "Safety Cabinet" },
        { id: "6", name: "Safety Course" }
      ]);
    }
  };

  // Load user certifications and available machines on dialog open
  useEffect(() => {
    if (open && user) {
      refreshCertifications();
      fetchAvailableMachines();
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
        // Add the certification to local state immediately for UI responsiveness
        setUserCertifications(prev => {
          if (!prev.includes(certificationId)) {
            return [...prev, certificationId];
          }
          return prev;
        });
        
        // Also refresh to ensure we have the latest state from the server
        await refreshCertifications();
        onCertificationAdded();
        
        toast({
          title: "Success",
          description: `Certification added successfully.`
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
        // Remove the certification from local state immediately for UI responsiveness
        setUserCertifications(prev => prev.filter(id => id !== certificationId));
        
        // Also refresh to ensure we have the latest state from the server
        await refreshCertifications();
        onCertificationAdded();
        
        toast({
          title: "Success",
          description: `Certification removed successfully.`
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
        // Clear certifications in local state immediately for UI responsiveness
        setUserCertifications([]);
        onCertificationAdded();
        
        toast({
          title: "Success",
          description: "All certifications cleared successfully."
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
  
  // Compare two arrays of certification IDs (handling both string and non-string types)
  const certificationArraysMatch = (arr1: any[], arr2: any[]): boolean => {
    const normalized1 = arr1.map(item => item?.toString() || '').sort();
    const normalized2 = arr2.map(item => item?.toString() || '').sort();
    
    if (normalized1.length !== normalized2.length) return false;
    
    for (let i = 0; i < normalized1.length; i++) {
      if (normalized1[i] !== normalized2[i]) return false;
    }
    
    return true;
  };
  
  // Check if a certification is already added for this user
  const isCertificationAdded = (certId: string): boolean => {
    if (!certId) return false;
    
    // First check our local state
    const inLocalState = userCertifications.some(id => id.toString() === certId.toString());
    if (inLocalState) return true;
    
    // Then check user object directly (as a fallback)
    if (user && user.certifications && Array.isArray(user.certifications)) {
      return user.certifications.some((id: any) => id?.toString() === certId.toString());
    }
    
    return false;
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
        
        <ScrollArea className={isMobile ? "h-[50vh]" : "max-h-[70vh]"}>
          <div className="py-4 px-1">
            <h4 className="text-sm font-medium mb-2">Certifications</h4>
            {availableMachines.length === 0 ? (
              <div className="text-center p-4">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading machines...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {availableMachines.map(machine => {
                  const isCertified = isCertificationAdded(machine.id);
                  return (
                    <div key={machine.id} className="flex justify-between items-center border p-2 rounded">
                      <span>{machine.name}</span>
                      <div>
                        {isCertified ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveCertification(machine.id)}
                            disabled={loading === machine.id}
                            className="bg-red-50 hover:bg-red-100 border-red-200"
                          >
                            {loading === machine.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Remove
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddCertification(machine.id)}
                            disabled={loading === machine.id}
                          >
                            {loading === machine.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Always show the Clear All button if there are certifications */}
            {userCertifications.length > 0 && (
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
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
