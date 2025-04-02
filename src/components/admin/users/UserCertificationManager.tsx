
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Trash, Certificate } from 'lucide-react';
import { certificationService } from '@/services/certificationService';
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
      
      // Get fresh certifications from service
      const certs = await certificationService.getUserCertifications(userId);
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
      
      // Sort machines by ID to ensure consistent order
      processedMachines.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      
      console.log("Available machines for certification:", processedMachines.map(m => ({ id: m.id, name: m.name })));
      setAvailableMachines(processedMachines);
    } catch (error) {
      console.error("Error fetching available machines:", error);
      // Fallback to special machines only
      setAvailableMachines([
        { id: "1", name: "Laser Cutter" },
        { id: "2", name: "Ultimaker" },
        { id: "3", name: "X1 Carbon 3D Printer" },
        { id: "4", name: "Bambu Lab X1" },
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
      
      const success = await certificationService.addCertification(userId, certificationId);
      
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
      
      const success = await certificationService.removeCertification(userId, certificationId);
      
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

  // Clear all certifications for a user
  const handleClearCertifications = async () => {
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
      // Remove all certifications one by one
      for (const certId of userCertifications) {
        await certificationService.removeCertification(userId, certId);
      }
      
      setUserCertifications([]);
      onCertificationAdded();
      
      toast({
        title: "Success",
        description: `All certifications cleared successfully.`
      });
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 lg:px-3"
        >
          <Certificate className="h-4 w-4 mr-2" />
          Certifications
        </Button>
      </DialogTrigger>
      
      <DialogContent className={isMobile ? "w-[95vw] max-w-md" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle>Manage User Certifications</DialogTitle>
          <DialogDescription>
            Add or remove machine certifications for {user.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {userCertifications.length > 0 ? (
            <div className="mb-4">
              <h3 className="mb-2 font-medium">Current Certifications:</h3>
              <ScrollArea className="h-[200px] rounded-md border p-2">
                <div className="space-y-2">
                  {userCertifications.map(certId => {
                    const machine = availableMachines.find(m => m.id === certId);
                    const machineName = machine ? machine.name : `Machine ${certId}`;
                    
                    return (
                      <div key={certId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="font-medium">{machineName} (ID: {certId})</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveCertification(certId)}
                          disabled={loading === certId}
                        >
                          {loading === certId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="mb-4 text-center py-8 bg-gray-50 rounded">
              <p className="text-gray-500">No certifications found</p>
            </div>
          )}
          
          <div>
            <h3 className="mb-2 font-medium">Available Machines:</h3>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              <div className="space-y-2">
                {availableMachines.map(machine => {
                  const isCertified = userCertifications.includes(machine.id);
                  
                  return (
                    <div key={machine.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="font-medium">
                        {machine.name} (ID: {machine.id})
                        {isCertified && <span className="ml-2 text-green-500">✓</span>}
                      </span>
                      <Button
                        variant={isCertified ? "destructive" : "default"}
                        size="sm"
                        onClick={() => isCertified 
                          ? handleRemoveCertification(machine.id) 
                          : handleAddCertification(machine.id)
                        }
                        disabled={loading === machine.id}
                      >
                        {loading === machine.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          isCertified ? "Remove" : "Add"
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter>
          {userCertifications.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleClearCertifications}
              disabled={isClearing}
              className="mr-auto"
            >
              {isClearing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Clearing...
                </>
              ) : (
                "Clear All"
              )}
            </Button>
          )}
          
          <Button onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
