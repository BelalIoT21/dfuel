
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { UserCertificationManager } from './UserCertificationManager';
import { machines } from '../../../utils/data';
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
  
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const fetchedMachines = await machineService.getMachines();
        setAllMachines(fetchedMachines);
      } catch (error) {
        console.error('Error fetching machines:', error);
        setAllMachines(machines); // Fallback to local data
      }
    };
    
    fetchMachines();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get machine name by ID
  const getMachineName = (certId: string) => {
    // Special case for Machine Safety Course
    if (certId === "6") return "Machine Safety Course";
    // Special case for Bambu Lab X1 E
    if (certId === "5") return "Bambu Lab X1 E";
    // Special case for Safety Cabinet
    if (certId === "3") return "Safety Cabinet";
    
    // First try to find from fetched machines
    const machine = allMachines.find(m => m.id === certId);
    if (machine) return machine.name;
    
    // Fallback to local data
    const localMachine = machines.find(m => m.id === certId);
    return localMachine ? localMachine.name : `Machine ${certId}`;
  };
  
  // Delete user
  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    
    try {
      // Try MongoDB first
      let success = false;
      try {
        success = await mongoDbService.deleteUser(userId);
        console.log(`MongoDB deleteUser result: ${success}`);
      } catch (mongoError) {
        console.error("MongoDB error deleting user:", mongoError);
      }
      
      // If MongoDB fails, use user database service
      if (!success) {
        success = await userDatabase.deleteUser(userId);
      }
      
      if (success) {
        toast({
          title: "User Deleted",
          description: "User has been permanently deleted.",
        });
        
        // Refresh the user list
        if (onUserDeleted) {
          onUserDeleted();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting user.",
        variant: "destructive"
      });
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
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded ${
                    user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </TableCell>
                <TableCell>{new Date(user.lastLogin).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.certifications && user.certifications.length > 0 ? (
                      user.certifications
                        .filter((cert: string) => cert !== "6") // Hide Machine Safety Course from the list
                        .map((cert: string) => (
                          <span 
                            key={cert} 
                            className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded"
                          >
                            {getMachineName(cert)}
                          </span>
                        ))
                    ) : (
                      <span className="text-xs text-gray-500">None</span>
                    )}
                    {user.certifications?.includes("6") && (
                      <span 
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded"
                      >
                        Safety Course
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
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deletingUserId === user.id ? (
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
            ))
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
