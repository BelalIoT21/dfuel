
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PersonalInfoCard from '@/components/profile/PersonalInfoCard';
import CertificationsCard from '@/components/profile/CertificationsCard';
import BookingsCard from '@/components/profile/BookingsCard';
import { toast } from '@/components/ui/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use React.useEffect to ensure this runs on the client-side
  React.useEffect(() => {
    console.log("Profile page mounted, user:", user?.name || "not logged in");
    
    if (!user) {
      console.log("No user found, redirecting to login");
      toast({
        title: "Authentication required",
        description: "Please log in to view your profile",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [user, navigate]);

  // Show loading state if still checking user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <ProfileHeader 
          user={user}
          isAdmin={user.isAdmin}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <PersonalInfoCard user={user} />
            <CertificationsCard 
              certifications={user.certifications || []} 
            />
          </div>
          
          <BookingsCard userId={user.id} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
