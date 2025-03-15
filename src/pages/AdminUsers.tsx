
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../../server/src/components/ui/card";
import { useToast } from '../hooks/use-toast';
import userDatabase from '../services/userDatabase';
import { UserSearch } from '../../server/src/components/admin/users/UserSearch';
import { UsersTable } from '../../server/src/components/admin/users/UsersTable';
import { UserWithoutSensitiveInfo } from '../types/database';
import { BackToAdminButton } from '../../server/src/components/BackToAdminButton';
import { StatsOverview } from '../../server/src/components/admin/StatsOverview';
import { machines } from '../utils/data';
import { Button } from "../../server/src/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserWithoutSensitiveInfo[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  
  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      console.log("Fetching all users for admin dashboard");
      const allUsers = await userDatabase.getAllUsers();
      console.log(`Fetched ${allUsers.length} users`);
      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Redirect non-authenticated users to login page
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchUsers();
  }, [toast, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const handleUserAdded = (newUser: UserWithoutSensitiveInfo) => {
    // Add the new user to the existing users array and refresh
    setUsers([...users, newUser]);
  };
  
  const handleUserDeleted = () => {
    // Refresh the users list after a user is deleted
    console.log("User deleted, refreshing user list");
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto page-transition">
        <div className="mb-6">
          <BackToAdminButton />
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
        
        {/* Add Stats Overview with user count */}
        <div className="mb-6">
          <StatsOverview allUsers={users} machines={machines} />
        </div>
        
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
              onUserDeleted={handleUserDeleted}
            />
            
            {/* Moved refresh button below the users table */}
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={fetchUsers} 
                variant="outline" 
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Users'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;
