
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { UserCertificationManager } from './UserCertificationManager';
import { machines } from '../../../utils/data';
import { useState, useEffect } from 'react';
import { machineService } from '@/services/machineService';

interface UsersTableProps {
  users: any[];
  searchTerm: string;
  onCertificationAdded: () => void;
}

export const UsersTable = ({ users, searchTerm, onCertificationAdded }: UsersTableProps) => {
  const [allMachines, setAllMachines] = useState<any[]>([]);
  
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
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get machine name by ID
  const getMachineName = (certId: string) => {
    // Special case for Machine Safety Course
    if (certId === "6") return "Machine Safety Course";
    
    // First try to find from fetched machines
    const machine = allMachines.find(m => m.id === certId);
    if (machine) return machine.name;
    
    // Fallback to local data
    const localMachine = machines.find(m => m.id === certId);
    return localMachine ? localMachine.name : `Machine ${certId}`;
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
                      // Filter out machine safety course (ID: "6") from visible certifications
                      user.certifications
                        .filter((cert: string) => cert !== "6")
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
                  </div>
                </TableCell>
                <TableCell>
                  <UserCertificationManager 
                    user={user} 
                    onCertificationAdded={onCertificationAdded}
                  />
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

