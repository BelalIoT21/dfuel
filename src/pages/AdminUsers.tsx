import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { UserSearch } from '../components/admin/users/UserSearch';
import { UsersTable } from '../components/admin/users/UsersTable';
import { UserWithoutSensitiveInfo } from '../types/database';
import { BackToAdminButton } from '@/components/BackToAdminButton';
import { StatsOverview } from '@/components/admin/StatsOverview';
import { machines } from '@/utils/data';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/apiService';

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
      
      // Try API first
      const response = await apiService.getAllUsers();
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log(`API returned ${response.data.length} users`);
        
        // Convert API response to client format
        const formattedUsers = response.data.map(user => ({
          id: user._id?.toString() || user.id?.toString() || '',
          name: user.name || '',
          email: user.email || '',
          isAdmin: user.isAdmin || false,
          certifications: user.certifications || [],
          bookings: user.bookings || [],
          lastLogin: user.lastLogin || user.updatedAt || new Date().toISOString()
        }));
        
        setUsers(formattedUsers);
        console.log(`Processed ${formattedUsers.length} users from MongoDB API`);
        return;
      }
      
      console.log("API failed to return users, trying alternative method");
      // If no users from API, try to get at least the current user
      if (user) {
        setUsers([{
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          certifications: user.certifications || [],
          bookings: user.bookings || [],
          lastLogin: new Date().toISOString()
        }]);
        console.log("Set at least current user in users list");
      } else {
        console.log("No users available");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users from MongoDB",
        variant: "destructive"
      });
      
      // Fallback to at least show current user
      if (user) {
        console.log("Fallback: Using current user only");
        setUsers([{
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          certifications: user.certifications || [],
          bookings: user.bookings || [],
          lastLogin: new Date().toISOString()
        }]);
      } else {
        setUsers([]);
      }
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

  const handleUserAdded = (data: any) => {
    console.log("User added, refreshing user list");
    
    // Immediate fetch to get the latest data from MongoDB
    fetchUsers();
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
