
import { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from '@/components/profile/ProfileHeader';
import PersonalInfoCard from '@/components/profile/PersonalInfoCard';
import CertificationsCard from '@/components/profile/CertificationsCard';
import BookingsCard from '@/components/profile/BookingsCard';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const defaultTab = tabParam || 'profile';
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // When URL params change, make sure the UI reflects it
  useEffect(() => {
    if (tabParam && ['profile', 'certifications', 'bookings'].includes(tabParam)) {
      // We don't need to do anything here as the Tabs component will handle this
      // through the defaultValue prop
    }
  }, [tabParam]);
  
  // Redirect if user is not logged in
  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto page-transition">
        <ProfileHeader />
        
        <h1 className="text-3xl font-bold mb-6 text-purple-800">Your Profile</h1>
        
        <Tabs defaultValue={defaultTab} onValueChange={handleTabChange} className="space-y-6">
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
