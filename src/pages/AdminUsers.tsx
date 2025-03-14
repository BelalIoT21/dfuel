
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import userDatabase from '../services/userDatabase';
import { BackToAdminButton } from '../components/BackToAdminButton';
import { UserSearch } from '../components/admin/users/UserSearch';
import { UsersTable } from '../components/admin/users/UsersTable';
import { AdminAccessRequired } from '../components/admin/users/AdminAccessRequired';
import { UserWithoutSensitiveInfo } from '../types/database';

const AdminUsers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserWithoutSensitiveInfo[]>([]);
  
  const fetchUsers = async () => {
    try {
      const allUsers = await userDatabase.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, [toast]);

  if (!user?.isAdmin) {
    return <AdminAccessRequired />;
  }

  const handleUserAdded = (newUser: UserWithoutSensitiveInfo) => {
    setUsers([...users, newUser]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto page-transition">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/admin" className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to Dashboard
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        
        <UserSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onUserAdded={handleUserAdded}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage and monitor user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable 
              users={users} 
              searchTerm={searchTerm}
              onCertificationAdded={fetchUsers}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;
