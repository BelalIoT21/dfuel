import { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { isWeb } from '@/utils/platform';

export const useProfileNavigation = (navigation) => {
  const { user } = useAuth();
  
  console.log("useProfileNavigation - current user:", user?.name || "not logged in");

  useEffect(() => {
    if (!user && navigation && navigation.replace) {
      console.log('No user found, redirecting to login');
      navigation.replace('Login');
    }
  }, [user, navigation]);

  const handleBackToDashboard = () => {
    console.log('Navigating back to dashboard. User is admin:', user?.isAdmin);
    
    if (!navigation) {
      console.warn('Navigation object is not available');
      return;
    }
    
    if (isWeb) {
      // Web environment
      if (user?.isAdmin) {
        console.log('Navigating admin to dashboard');
        navigation.navigate('AdminDashboard');
      } else {
        console.log('Navigating user to home');
        navigation.navigate('Home');
      }
    } else {
      // Native environment - keep original behavior
      navigation.navigate('Home');
    }
  };

  return {
    user,
    handleBackToDashboard
  };
};
