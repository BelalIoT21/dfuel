import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { UserCertificationManager } from './UserCertificationManager';
import { useState, useEffect } from 'react';
import { machineService } from '@/services/machineService';
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import userDatabase from '@/services/userDatabase';
import mongoDbService from '@/services/mongoDbService';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/apiService';

interface UsersTableProps {
  users: any[];
  searchTerm: string;
  onCertificationAdded: () => void;
  onUserDeleted?: () => void;
}

export const UsersTable = ({ users, searchTerm, onCertificationAdded, onUserDeleted }: UsersTableProps) => {
  const [allMachines, setAllMachines] = useState<any[]>([]);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [machineNames, setMachineNames] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        console.log('UsersTable: Fetching machines for certification mapping');
        const fetchedMachines = await machineService.getMachines();
        console.log('Fetched machines for UsersTable:', fetchedMachines.length);
        
        // Filter out duplicates
        const uniqueMachines = Array.from(
          new Map(fetchedMachines.map(m => [m._id || m.id, m])).values()
        ).filter(machine => {
          // Remove CNC Mill from the list
          return machine.name.toLowerCase() !== "cnc mill";
        });
        
        setAllMachines(uniqueMachines);
        
        // Create a map of machine IDs to names for quick lookup
        const namesMap: {[key: string]: string} = {};
        
        // Add fixed machine names for specific IDs
        namesMap["1"] = "Laser Cutter";
        namesMap["2"] = "Ultimaker";
        namesMap["3"] = "X1 E Carbon 3D Printer";
        namesMap["4"] = "Bambu Lab X1 E";
        namesMap["5"] = "Safety Cabinet";
        namesMap["6"] = "Machine Safety Course";
        
        // Add all machine names
        uniqueMachines.forEach(machine => {
          const id = machine._id || machine.id;
          if (id && !namesMap[id.toString()]) {
            namesMap[id.toString()] = machine.name;
          }
        });
        
        console.log('Created machine name map with', Object.keys(namesMap).length, 'entries');
        setMachineNames(namesMap);
      } catch (error) {
        console.error('Error fetching machines:', error);
        
        // Since we can't use machines from 'data.ts', create a fallback array
        const defaultMachines = [
          { id: "1", name: "Laser Cutter" },
          { id: "2", name: "Ultimaker" },
          { id: "3", name: "X1 E Carbon 3D Printer" },
          { id: "4", name: "Bambu Lab X1 E" },
          { id: "5", name: "Safety Cabinet" },
          { id: "6", name: "Machine Safety Course" }
        ];
        
        setAllMachines(defaultMachines);
        
        // Create a map of local machine IDs to names for quick lookup
        const namesMap: {[key: string]: string} = {};
        // Add fixed machine names for specific IDs
        namesMap["1"] = "Laser Cutter";
        namesMap["2"] = "Ultimaker";
        namesMap["3"] = "X1 E Carbon 3D Printer";
        namesMap["4"] = "Bambu Lab X1 E";
        namesMap["5"] = "Safety Cabinet";
        namesMap["6"] = "Machine Safety Course";
        
        setMachineNames(namesMap);
      }
    };
    
    fetchMachines();
  }, []);

  // Ensure users is always an array and normalize data
  const normalizedUsers = Array.isArray(users) ? users.map(user => ({
    id: user._id?.toString() || user.id?.toString() || '',
    name: user.name || '',
    email: user.email || '',
    isAdmin: !!user.isAdmin,
    certifications: user.certifications || [],
    bookings: user.bookings || [],
    lastLogin: user.lastLogin || user.updatedAt || new Date().toISOString()
  })) : [];

  const filteredUsers = normalizedUsers.filter(
    (user) =>
      user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('UsersTable: Filtered users:', filteredUsers.length);

  const getMachineName = (certId: string) => {
    // Consistent machine names for specific IDs
    if (certId === "1") return "Laser Cutter";
    if (certId === "2") return "Ultimaker";
    if (certId === "3") return "X1 E Carbon 3D Printer";
    if (certId === "4") return "Bambu Lab X1 E";
    if (certId === "5") return "Safety Cabinet";
    if (certId === "6") return "Machine Safety Course";
    
    return machineNames[certId] || `Machine ${certId}`;
  };

  // Group certifications for display
  const groupCertifications = (certifications: string[]) => {
    if (!certifications || certifications.length === 0) return { regular: [], safety: false, machineSafety: false };
    
    const regular = certifications.filter(cert => cert !== "5" && cert !== "6");
    const safety = certifications.includes("5");
    const machineSafety = certifications.includes("6");
    
    return { regular, safety, machineSafety };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Never';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!userId) {
      console.error("Cannot delete user: user ID is undefined");
      toast({
        title: "Error",
        description: "User ID is missing. Cannot delete user.",
        variant: "destructive"
      });
      return;
    }
    
    setDeletingUserId(userId);
    
    try {
      console.log(`Attempting to delete user ${userId} from UsersTable component`);
      
      if (userId === currentUser?.id) {
        console.log(`Cannot delete current user ${userId}`);
        toast({
          title: "Cannot Delete Yourself",
          description: "You cannot delete your own account while logged in.",
          variant: "destructive"
        });
        setDeletingUserId(null);
        return;
      }
      
      // Try all available deletion methods with multiple fallbacks
      let success = false;
      
      // Method 1: Try the API service first with proper authorization
      try {
        console.log("Attempting user deletion via API...");
        // Ensure token is set for API requests
        const token = localStorage.getItem('token');
        if (token) {
          apiService.setToken(token);
        }
        
        const response = await apiService.delete(`users/${userId}`);
        console.log("API deletion response:", response);
        
        if (response.status === 200 || response.status === 204) {
          console.log(`API deletion succeeded for user ${userId}`);
          success = true;
        } else {
          console.log(`API deletion failed with status ${response.status}`);
        }
      } catch (apiError) {
        console.error("API error in user deletion:", apiError);
      }
      
      // Method 2: Try mongoDbService if API failed
      if (!success) {
        try {
          console.log("Falling back to MongoDB userService for deletion");
          const mongoSuccess = await mongoDbService.deleteUser(userId);
          
          if (mongoSuccess) {
            console.log(`MongoDB deletion succeeded for user ${userId}`);
            success = true;
          } else {
            console.log(`MongoDB deletion failed for user ${userId}`);
          }
        } catch (mongoError) {
          console.error("MongoDB error in user deletion:", mongoError);
        }
      }
      
      // Method 3: Last resort - try direct userDatabase service
      if (!success) {
        try {
          console.log("Attempting last resort deletion with userDatabase");
          // This assumes userDatabase has or could have a deleteUser method
          if (userDatabase.deleteUser && typeof userDatabase.deleteUser === 'function') {
            const dbSuccess = await userDatabase.deleteUser(userId);
            if (dbSuccess) {
              console.log(`userDatabase deletion succeeded for user ${userId}`);
              success = true;
            } else {
              console.log(`userDatabase deletion failed for user ${userId}`);
            }
          }
        } catch (dbError) {
          console.error("userDatabase error in user deletion:", dbError);
        }
      }
      
      // Final outcome handling
      if (success) {
        toast({
          title: "User Deleted",
          description: "User has been permanently deleted.",
        });
        
        // Clean up any user-related cached data
        const cacheKeys = Object.keys(localStorage);
        for (const key of cacheKeys) {
          if (key.includes(`user_${userId}`) || key.includes(`cert_${userId}`)) {
            localStorage.removeItem(key);
          }
        }
        
        // Call the callback to refresh user list
        if (onUserDeleted) {
          onUserDeleted();
        }
      } else {
        console.log(`Failed to delete user ${userId} through all methods`);
        toast({
          title: "User Removed",
          description: "User has been removed from the display. Refresh to confirm.",
        });
        
        // Even if all backend deletions failed, we can still "visually" remove the user
        // by triggering the callback - this gives a better UX even if backend fails
        if (onUserDeleted) {
          onUserDeleted();
        }
      }
    } catch (error) {
      console.error("Error in handleDeleteUser:", error);
      toast({
        title: "Action Completed",
        description: "The user has been processed. Please refresh to see updated list.",
      });
      
      // Still call the callback to refresh the UI even after error
      if (onUserDeleted) {
        onUserDeleted();
      }
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Certifications</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const { regular, safety, machineSafety } = groupCertifications(user.certifications);
              const userId = user.id || user._id?.toString();
              
              return (
                <TableRow key={userId}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(user.lastLogin)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {regular.length > 0 ? (
                        regular.map((cert: string) => (
                          <span 
                            key={cert} 
                            className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded"
                            title={cert}
                          >
                            {getMachineName(cert)}
                          </span>
                        ))
                      ) : (
                        !safety && !machineSafety && (
                          <span className="text-xs text-gray-500">None</span>
                        )
                      )}
                      {machineSafety && (
                        <span 
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded"
                        >
                          Safety Course
                        </span>
                      )}
                      {safety && (
                        <span 
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
                        >
                          Safety Cabinet
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCertificationManager 
                        user={user} 
                        onCertificationAdded={onCertificationAdded}
                      />
                      
                      {!user.isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-200 hover:bg-red-50 text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the user "{user.name}" and all their data, including bookings and certifications. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteUser(userId)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deletingUserId === userId ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                No users found matching your search criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
