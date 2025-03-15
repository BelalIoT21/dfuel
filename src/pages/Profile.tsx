
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PersonalInfoCard from '@/components/profile/PersonalInfoCard';
import CertificationsCard from '@/components/profile/CertificationsCard';
import BookingsCard from '@/components/profile/BookingsCard';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  useEffect(() => {
    console.log("Profile component mounted");
    console.log("Auth state:", { user: user?.name || "null", loading });
    
    // Set page as loaded after a small delay to ensure auth state is processed
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Only check authentication after we've confirmed page is loaded
    // and auth state is no longer loading
    if (isPageLoaded && !loading && !user) {
      console.log("User not authenticated, redirecting to login");
      toast({
        title: "Authentication required",
        description: "Please log in to view your profile",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [user, loading, isPageLoaded, navigate]);

  // Show loading spinner while auth is being checked
  if (loading || !isPageLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // If auth check is complete and no user, render nothing (we'll redirect in useEffect)
  if (!user) {
    return null;
  }

  // If we have a user, render the profile page
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
