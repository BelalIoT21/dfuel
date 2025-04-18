
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from '@/components/profile/ProfileHeader';
import PersonalInfoCard from '@/components/profile/PersonalInfoCard';
import CertificationsCard from '@/components/profile/CertificationsCard';
import BookingsCard from '@/components/profile/BookingsCard';
import { Loader2 } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Always call useAuth - don't conditionally wrap it in try/catch
  const auth = useAuth();

  // Set default tab based on URL parameter
  const defaultTab = tabParam && ['profile', 'certifications', 'bookings'].includes(tabParam) 
    ? tabParam 
    : 'profile';
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  useEffect(() => {
    // Extract user from auth context
    try {
      if (auth && auth.user) {
        setUser(auth.user);
      }
    } catch (error) {
      console.error('Error using Auth context:', error);
    }
    
    // Add a small delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [auth]);

  // Redirect if user is not logged in - this useEffect will always run
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('No user found, redirecting to home page');
      navigate('/');
    }
  }, [isLoading, user, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show not logged in state - this will be visible briefly before the redirect
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center">
          <p className="text-purple-600 mb-2">Please log in to view your profile</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto page-transition">
        <ProfileHeader />
        
        <h1 className="text-3xl font-bold mb-6 text-purple-800">Your Profile</h1>
        
        <Tabs value={defaultTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="w-full mb-2 grid grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <PersonalInfoCard />
          </TabsContent>
          
          <TabsContent value="certifications">
            <CertificationsCard />
          </TabsContent>
          
          <TabsContent value="bookings">
            <BookingsCard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
