
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { UserCertificationManager } from './UserCertificationManager';
import { machines } from '../../../utils/data';
import { useState, useEffect } from 'react';
import { machineService } from '@/services/machineService';
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
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
import { useAuth } from '@/context/AuthContext';

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
  
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const fetchedMachines = await machineService.getMachines();
        setAllMachines([...machines, ...fetchedMachines]);
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

  const getMachineName = (certId: string) => {
    // Known machine IDs mapping with proper names for all machines and safety course
    const knownMachines = {
      "1": "Laser Cutter",
      "2": "Ultimaker",
      "3": "Safety Cabinet",
      "4": "X1 E Carbon 3D Printer",
      "5": "Bambu Lab X1 E",
      "6": "Machine Safety Course",
      "67d5658be9267b302f7aa015": "Laser Cutter",
      "67d5658be9267b302f7aa016": "Ultimaker",
      "67d5658be9267b302f7aa017": "X1 E Carbon 3D Printer",
      "67d5658be9267b302f7aa018": "Safety Cabinet",
      "67d5658be9267b302f7aa019": "Bambu Lab X1 E",
    };
    
    // First check if it's a known ID
    if (knownMachines[certId]) {
      return knownMachines[certId];
    }
    
    // Try to find in allMachines by id or _id
    const machine = allMachines.find(m => 
      m.id === certId || 
      m._id === certId || 
      m.id?.toString() === certId || 
      (m._id && m._id.toString() === certId)
    );
    
    if (machine) {
      return machine.name;
    }
    
    // If we couldn't find a match, return a fallback
    return `Machine ${certId}`;
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    
    try {
      console.log(`Attempting to delete user ${userId} from UsersTable component`);
      
      if (userId === currentUser?.id || userId === currentUser?._id) {
        console.log(`Cannot delete current user ${userId}`);
        toast({
          title: "Cannot Delete Yourself",
          description: "You cannot delete your own account while logged in.",
          variant: "destructive"
        });
        setDeletingUserId(null);
        return;
      }
      
      // Delete user
      const success = await userDatabase.deleteUser(userId);
      console.log(`User deletion result for ${userId}: ${success}`);
      
      if (success) {
        toast({
          title: "User Deleted",
          description: "User has been permanently deleted.",
        });
        
        if (onUserDeleted) {
          onUserDeleted();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user. Please try again.",
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
            <TableHead>ID</TableHead>
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
              <TableRow key={user.id || user._id}>
                <TableCell className="text-xs text-gray-500">{user.id || user._id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded ${
                    user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </TableCell>
                <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.certifications && user.certifications.length > 0 ? (
                      <>
                        {/* Display non-safety-course certifications */}
                        {user.certifications
                          .filter((cert: string | number) => 
                            cert !== "6" && cert !== 6 && 
                            cert !== "3" && cert !== 3)
                          .map((cert: string | number) => (
                            <span 
                              key={cert.toString()} 
                              className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded"
                              title={`Certification ID: ${cert}`}
                            >
                              {getMachineName(cert.toString())}
                            </span>
                          ))
                        }
                        
                        {/* Display Safety Cabinet certification separately */}
                        {(user.certifications?.includes("3") || 
                         user.certifications?.includes(3) || 
                         user.certifications?.some((c: any) => c.toString().includes("67d5658be9267b302f7aa018"))) && (
                          <span 
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
                          >
                            Safety Cabinet
                          </span>
                        )}
                        
                        {/* Display Safety Course certification separately */}
                        {(user.certifications?.includes("6") || 
                         user.certifications?.includes(6)) && (
                          <span 
                            className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded"
                          >
                            Safety Course
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">None</span>
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
                              onClick={() => handleDeleteUser(user.id || user._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deletingUserId === (user.id || user._id) ? (
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
              <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                No users found matching your search criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
