
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
  const [machineNames, setMachineNames] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const fetchedMachines = await machineService.getMachines();
        console.log('Fetched machines for UsersTable:', fetchedMachines.length);
        setAllMachines(fetchedMachines);
        
        // Create a map of machine IDs to names for quick lookup
        const namesMap = {};
        
        // Add special cases with consistent naming
        namesMap["6"] = "Machine Safety Course";
        namesMap["3"] = "Safety Cabinet";
        
        // Add all machine names
        fetchedMachines.forEach(machine => {
          const id = machine._id || machine.id;
          if (id) {
            namesMap[id] = machine.name;
          }
        });
        
        // Add local machines as fallback
        machines.forEach(machine => {
          if (!namesMap[machine.id]) {
            namesMap[machine.id] = machine.name;
          }
        });
        
        console.log('Created machine name map with', Object.keys(namesMap).length, 'entries');
        setMachineNames(namesMap);
      } catch (error) {
        console.error('Error fetching machines:', error);
        setAllMachines(machines); // Fallback to local data
        
        // Create a map of local machine IDs to names for quick lookup
        const namesMap = {};
        machines.forEach(machine => {
          namesMap[machine.id] = machine.name;
        });
        setMachineNames(namesMap);
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
    // Consistent handling of special machines
    if (certId === "6") return "Machine Safety Course";
    if (certId === "3") return "Safety Cabinet";
    
    return machineNames[certId] || `Machine ${certId}`;
  };

  // Group certifications for display
  const groupCertifications = (certifications: string[]) => {
    if (!certifications || certifications.length === 0) return { regular: [], safety: false, machineSafety: false };
    
    const regular = certifications.filter(cert => cert !== "3" && cert !== "6");
    const safety = certifications.includes("3");
    const machineSafety = certifications.includes("6");
    
    return { regular, safety, machineSafety };
  };

  const handleDeleteUser = async (userId: string) => {
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
      
      console.log(`Trying MongoDB deletion for user ${userId}`);
      const success = await mongoDbService.deleteUser(userId);
      console.log(`MongoDB deleteUser result: ${success}`);
      
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
          description: "Failed to delete user. They may have special permissions.",
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
            filteredUsers.map((user) => {
              const { regular, safety, machineSafety } = groupCertifications(user.certifications);
              
              return (
                <TableRow key={user.id || user._id}>
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
