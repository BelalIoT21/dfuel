
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { certificationService } from '@/services/certificationService';
import { machines } from '@/utils/data';
import { Loader2, Trash, Plus } from 'lucide-react';
import mongoDbService from '@/services/mongoDbService';
import { localStorageService } from '@/services/localStorageService';
import { machineService } from '@/services/machineService';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

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
        
        // Close the dialog
        setOpen(false);
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
      console.error(`Cannot remove certification: user ID is undefined for user`, user);
      toast({
        title: "Error",
        description: "User ID is missing. Cannot remove certification.",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Attempting to remove certification: userId=${userId}, machineId=${machineId}`);
    setLoading(machineId);
    
    try {
      // First try direct MongoDB
      let success = false;
      try {
        const userDoc = await mongoDbService.getUserById(userId);
        if (userDoc) {
          const updatedCertifications = (userDoc.certifications || []).filter(id => id !== machineId);
          success = await mongoDbService.updateUser(userId, { certifications: updatedCertifications });
          console.log(`MongoDB removeCertification result: ${success}`);
        }
      } catch (mongoError) {
        console.error("MongoDB remove certification error:", mongoError);
      }
      
      // If MongoDB fails, try certification service
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

  const handleClearAllCertifications = async () => {
    if (!user || !user.id) {
      console.error("Cannot clear certifications: user ID is missing", user);
      toast({
        title: "Error",
        description: "User ID is missing. Cannot clear certifications.",
        variant: "destructive"
      });
      return;
    }
    
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
        
        // Close the dialog
        setOpen(false);
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
  
  // Helper function to get MongoDB machine names with correct ID mapping
  const getMachineName = (machineId: string) => {
    // First check the dynamically loaded machines
    const machine = allMachines.find(m => m.id === machineId || m._id === machineId);
    if (machine) return machine.name;
    
    // Fallback to hardcoded mapping for known machines
    switch (machineId) {
      case "1": return "Laser Cutter";
      case "2": return "Ultimaker";
      case "3": return "Safety Cabinet";
      case "4": return "Bambu Lab X1 E";
      case "5": return "Bambu Lab X1 E";
      case "6": return "Machine Safety Course";
      case "7": return "X1 E Carbon 3D Printer";
      default: return `Machine ${machineId}`;
    }
  };

  // Get list of user certifications to display
  const getUserCertifications = () => {
    if (!user?.certifications) return [];
    
    // Create an array of certification objects
    return user.certifications.map(certId => ({
      id: certId,
      name: getMachineName(certId)
    }));
  }
  
  // Get list of machines that the user is not certified for
  const getAvailableMachines = () => {
    const userCerts = user?.certifications || [];
    
    // Start with a list of common machines to certify for
    const commonMachines = [
      { id: "1", name: "Laser Cutter" },
      { id: "2", name: "Ultimaker" },
      { id: "3", name: "Safety Cabinet" },
      { id: "4", name: "Bambu Lab X1 E" },
      { id: "5", name: "Bambu Lab X1 E" },
      { id: "6", name: "Machine Safety Course" },
      { id: "7", name: "X1 E Carbon 3D Printer" },
    ];
    
    // Filter out machines the user is already certified for
    const available = commonMachines.filter(machine => !userCerts.includes(machine.id));
    
    // Add other machines from allMachines that aren't in commonMachines
    allMachines.forEach(machine => {
      const machineId = machine._id || machine.id;
      if (machineId && 
          !userCerts.includes(machineId) && 
          !available.some(m => m.id === machineId) &&
          !commonMachines.some(m => m.id === machineId)) {
        available.push({
          id: machineId,
          name: machine.name
        });
      }
    });
    
    return available;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Manage</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage User: {user?.name}</DialogTitle>
          <DialogDescription>
            Manage certifications for this user.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[400px] px-1">
          <div className="py-4">
            <h4 className="text-sm font-medium mb-2">Current Certifications</h4>
            <div className="grid grid-cols-1 gap-2">
              {getUserCertifications().length > 0 ? (
                getUserCertifications().map(cert => (
                  <div key={cert.id} className="flex justify-between items-center border p-2 rounded">
                    <span>{cert.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveCertification(user.id || user._id, cert.id)}
                      disabled={loading === cert.id}
                      className="bg-red-50 hover:bg-red-100 border-red-200"
                    >
                      {loading === cert.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4 mr-1" />}
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-gray-500">
                  <p>No certifications yet</p>
                </div>
              )}
            </div>
            
            {user?.certifications?.length > 0 && (
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
            
            <Separator className="my-4" />
            
            <h4 className="text-sm font-medium mb-2">Add Certification</h4>
            <div className="grid grid-cols-1 gap-2">
              {getAvailableMachines().length > 0 ? (
                getAvailableMachines().map(machine => (
                  <div key={machine.id} className="flex justify-between items-center border p-2 rounded">
                    <span>{machine.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddCertification(user.id || user._id, machine.id)}
                      disabled={loading === machine.id}
                      className="bg-green-50 hover:bg-green-100 border-green-200"
                    >
                      {loading === machine.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                      Add
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-gray-500">
                  <p>No additional certifications available</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
