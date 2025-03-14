
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from '@/components/profile/ProfileHeader';
import PersonalInfoCard from '@/components/profile/PersonalInfoCard';
import CertificationsCard from '@/components/profile/CertificationsCard';
import BookingsCard from '@/components/profile/BookingsCard';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  
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
        
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="w-full mb-2 flex flex-wrap">
            <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
            <TabsTrigger value="certifications" className="flex-1">Certifications</TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1">Bookings</TabsTrigger>
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
