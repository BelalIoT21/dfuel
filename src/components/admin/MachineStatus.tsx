import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, WifiOff, Check, AlertTriangle, Clock } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface MachineStatusProps {
  machineData: any[];
  setMachineData: React.Dispatch<React.SetStateAction<any[]>>;
}

export const MachineStatus = ({ machineData, setMachineData }: MachineStatusProps) => {
  const { toast } = useToast();
  const [isMachineStatusDialogOpen, setIsMachineStatusDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState('available');
  const [maintenanceNote, setMaintenanceNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null);
  const [machineStatuses, setMachineStatuses] = useState<Record<string, string>>({});
  const [machineNotes, setMachineNotes] = useState<Record<string, string>>({});
  
  // Filter machine data to only include actual machines (not machine 5 and 6)
  const filteredMachineData = machineData.filter(machine => {
    const machineId = machine.id || machine._id;
    return machineId !== "5" && machineId !== "6";
  });
  
  // Check server connection and load machine statuses on mount
  useEffect(() => {
    const checkServerAndLoadData = async () => {
      try {
        // First check server connection
        console.log("Checking server connection status...");
        const response = await fetch('http://localhost:4000/api/health');
        
        if (response.ok) {
          console.log("Server connected successfully!");
          setIsServerConnected(true);
          
          // Server is connected, fetch fresh machine statuses
          await fetchMachineStatuses();
        } else {
          console.log("Server responded with error:", response.status);
          setIsServerConnected(false);
        }
      } catch (error) {
        console.error("Error during initial data load:", error);
        setIsServerConnected(false);
      } finally {
        setInitialLoadDone(true);
      }
    };
    
    checkServerAndLoadData();
  }, []);

  // Effect to apply machine statuses to machine data
  useEffect(() => {
    if (Object.keys(machineStatuses).length > 0 && machineData.length > 0) {
      console.log("Applying machine statuses to machine data:", machineStatuses);
      
      setMachineData(prevData => {
        return prevData.map(machine => {
          const machineId = machine.id || machine._id;
          if (machineStatuses[machineId]) {
            return {
              ...machine,
              status: machineStatuses[machineId],
              maintenanceNote: machineNotes[machineId] || machine.maintenanceNote || ''
            };
          }
          return machine;
        });
      });
    }
  }, [machineStatuses, machineNotes, machineData.length]);

  // Countdown timer effect for rate limiting
  useEffect(() => {
    if (rateLimitRemaining === null || rateLimitRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setRateLimitRemaining(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [rateLimitRemaining]);

  // Fetch machine statuses function that can be called on load and refresh
  const fetchMachineStatuses = async () => {
    console.log("Fetching fresh machine statuses...");
    setIsLoading(true);
    
    try {
      // Skip machines 5 and 6 which are special machines
      const newStatuses: Record<string, string> = {};
      const newNotes: Record<string, string> = {};
      
      // Get all machines from the API
      const machinesResponse = await fetch('http://localhost:4000/api/machines');
      
      if (machinesResponse.ok) {
        const machines = await machinesResponse.json();
        console.log(`Fetched ${machines.length} machines`);
        
        // Process each machine that's not 5 or 6
        for (const machine of machines) {
          const machineId = machine._id || machine.id;
          if (machineId !== '5' && machineId !== '6') {
            // Store the status in our status map
            newStatuses[machineId] = machine.status?.toLowerCase() || 'available';
            console.log(`Stored status for machine ${machineId}: ${newStatuses[machineId]}`);
            
            // Store maintenance note if present
            if (machine.maintenanceNote) {
              newNotes[machineId] = machine.maintenanceNote;
            }
          }
        }
      }
      
      if (Object.keys(newStatuses).length > 0) {
        console.log("Setting new machine statuses:", newStatuses);
        setMachineStatuses(newStatuses);
        setMachineNotes(newNotes);
      } else {
        console.warn("No machine statuses were retrieved from the server");
      }
    } catch (error) {
      console.error("Error fetching machine statuses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch machine statuses"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleUpdateMachineStatus = (machine: any) => {
    setSelectedMachine(machine);
    setSelectedStatus(machine.status || 'available');
    setMaintenanceNote(machine.maintenanceNote || '');
    setUpdateError(null);
    setIsMachineStatusDialogOpen(true);
  };

  const refreshMachineStatuses = async () => {
    setIsRefreshing(true);
    try {
      // Check server connection
      try {
        const response = await fetch('http://localhost:4000/api/health');
        setIsServerConnected(response.ok);
      } catch (error) {
        console.error("Error checking server connection:", error);
        setIsServerConnected(false);
      }
      
      // Fetch fresh machine statuses
      await fetchMachineStatuses();
      
      toast({
        title: "Refreshed",
        description: "Machine statuses have been refreshed"
      });
    } catch (error) {
      console.error("Error refreshing machine statuses:", error);
      toast({
        title: "Error",
        description: "Failed to refresh machine statuses",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const saveMachineStatus = async () => {
    if (!selectedMachine) return;
    
    setIsLoading(true);
    setUpdateError(null);
    setRateLimitRemaining(null);
    
    try {
      console.log(`Updating machine ${selectedMachine.id || selectedMachine._id} status to ${selectedStatus}`);
      
      const machineId = selectedMachine.id || selectedMachine._id;
      
      // Get auth token from sessionStorage instead of localStorage
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Normalize the status to match server expectations
      let normalizedStatus = selectedStatus;
      if (selectedStatus === 'available') {
        normalizedStatus = 'Available';
      } else if (selectedStatus === 'maintenance') {
        normalizedStatus = 'Maintenance';
      } else if (selectedStatus === 'in-use') {
        normalizedStatus = 'In Use';
      }
      
      // Use direct fetch to update machine status
      const response = await fetch(`http://localhost:4000/api/machines/${machineId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: normalizedStatus,
          maintenanceNote: maintenanceNote
        }),
      });
      
      if (response.ok) {
        const responseText = await response.text();
        let responseData;
        try {
          responseData = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.warn('Unable to parse response as JSON:', responseText);
          responseData = { message: responseText };
        }
        console.log('Update result:', responseData);
        
        // Update the machine statuses and notes
        setMachineStatuses(prev => ({
          ...prev,
          [machineId]: selectedStatus // Keep the frontend status lowercase
        }));
        
        setMachineNotes(prev => ({
          ...prev,
          [machineId]: maintenanceNote
        }));
        
        // Update the machine data in state
        setMachineData(machineData.map(machine => 
          (machine.id === machineId || machine._id === machineId)
            ? { 
                ...machine, 
                status: selectedStatus, // Keep the frontend status lowercase
                maintenanceNote: maintenanceNote 
              } 
            : machine
        ));
        
        toast({
          title: "Status Updated",
          description: `${selectedMachine.name} status has been updated to ${selectedStatus}`
        });
        
        setIsMachineStatusDialogOpen(false);
      } else {
        const statusCode = response.status;
        let errorMessage = `Request failed with status: ${statusCode}`;
        let retryAfter = null;
        
        // For rate limit errors, show a specific message
        if (statusCode === 429) {
          try {
            const responseText = await response.text();
            if (responseText) {
              try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || "Rate limit exceeded. Please wait before trying again.";
                if (errorData.retryAfter) {
                  retryAfter = parseInt(errorData.retryAfter);
                  setRateLimitRemaining(retryAfter);
                }
              } catch (parseError) {
                errorMessage = responseText;
              }
            }
          } catch (e) {
            console.error("Error reading response:", e);
            errorMessage = "Rate limit exceeded. Please wait before trying again.";
          }
        } else {
          try {
            const responseText = await response.text();
            if (responseText) {
              try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorMessage;
              } catch (parseError) {
                errorMessage = responseText;
              }
            }
          } catch (e) {
            console.error("Error reading response:", e);
          }
        }
        
        console.error('Update failed:', errorMessage);
        setUpdateError(`Failed to update machine status: ${errorMessage}`);
        
        toast({
          title: "Update Failed",
          description: "Server reported an error while updating machine status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating machine status:", error);
      setUpdateError("Connection error while updating the machine status");
      
      toast({
        title: "Error",
        description: "Connection error occurred while updating machine status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to correctly display machine status
  const getStatusDisplay = (machine: any) => {
    // Regular machine status display
    const status = machine.status?.toLowerCase() || 'available';
    
    if (status === 'available') {
      return {
        text: 'Available',
        className: 'bg-green-100 text-green-800'
      };
    } else if (status === 'maintenance') {
      return {
        text: 'Maintenance',
        className: 'bg-red-100 text-red-800'
      };
    } else {
      return {
        text: 'In Use',
        className: 'bg-yellow-100 text-yellow-800'
      };
    }
  };

  const getRateLimitMessage = () => {
    if (rateLimitRemaining === null) return null;
    
    const minutes = rateLimitRemaining === 1 ? 'minute' : 'minutes';
    return `Rate limit exceeded. Please wait ${rateLimitRemaining} ${minutes} before trying again.`;
  };

  return (
    <>
      <Card className="border-purple-100">
        <CardHeader className="p-4 md:p-6">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              Machine Status
            </CardTitle>
            <div className="flex items-center gap-2">
              {isServerConnected ? (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Server: Connected
                </span>
              ) : (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded flex items-center">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Server: Disconnected
                </span>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshMachineStatuses}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''} mr-2`} />
                Refresh
              </Button>
            </div>
          </div>
          <CardDescription>Current status of all machines</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          {isLoading && !initialLoadDone ? (
            <div className="flex justify-center items-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin text-purple-600 mr-2" />
              <span>Loading machine statuses...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMachineData.length > 0 ? (
                filteredMachineData.map((machine) => {
                  const statusDisplay = getStatusDisplay(machine);
                  
                  return (
                    <div key={machine.id || machine._id} className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-3 last:border-0 gap-2">
                      <div>
                        <div className="font-medium text-sm">
                          {machine.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Type: {machine.type || "Machine"}
                          {machine.maintenanceNote ? ` - Note: ${machine.maintenanceNote}` : ''}
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${statusDisplay.className}`}>
                          {statusDisplay.text}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-purple-200 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs w-full md:w-auto"
                          onClick={() => handleUpdateMachineStatus(machine)}
                          disabled={rateLimitRemaining !== null}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No machines available yet.</p>
                </div>
              )}
            </div>
          )}
          
          {rateLimitRemaining !== null && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                Rate Limit Exceeded <Clock className="h-4 w-4" />
              </AlertTitle>
              <AlertDescription>
                Please wait {rateLimitRemaining} {rateLimitRemaining === 1 ? 'minute' : 'minutes'} before making more updates.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Dialog open={isMachineStatusDialogOpen} onOpenChange={setIsMachineStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Update Machine Status</DialogTitle>
            <DialogDescription>
              Change the current status of {selectedMachine?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="machine-status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="machine-status" className="bg-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="available">
                    <span className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      Available
                    </span>
                  </SelectItem>
                  <SelectItem value="maintenance">
                    <span className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                      Maintenance
                    </span>
                  </SelectItem>
                  <SelectItem value="in-use">
                    <span className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                      In Use
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedStatus === 'maintenance' && (
              <div className="space-y-2">
                <Label htmlFor="maintenance-note">Maintenance Note</Label>
                <Input
                  id="maintenance-note"
                  value={maintenanceNote}
                  onChange={(e) => setMaintenanceNote(e.target.value)}
                  placeholder="Optional: Describe the maintenance issue"
                />
              </div>
            )}
            
            {updateError && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{updateError}</span>
              </div>
            )}
            
            {getRateLimitMessage() && (
              <Alert variant="destructive">
                <Clock className="h-4 w-4" />
                <AlertDescription>{getRateLimitMessage()}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMachineStatusDialogOpen(false)} className="border-purple-200 bg-purple-50 hover:bg-purple-100">
              Cancel
            </Button>
            <Button 
              onClick={saveMachineStatus} 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isLoading || rateLimitRemaining !== null}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
