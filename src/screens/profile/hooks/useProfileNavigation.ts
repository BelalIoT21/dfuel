
import { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

export const useProfileNavigation = (navigation) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigation.replace('Login');
    }
  }, [user, navigation]);

  const handleBackToDashboard = () => {
    console.log('Navigating back to dashboard. User is admin:', user?.isAdmin);
    if (user?.isAdmin) {
      navigation.navigate('AdminDashboard');
    } else {
      // Ensure we're using the correct screen name for regular users
      navigation.navigate('Home');
    }
  };

  return {
    user,
    handleBackToDashboard
  };
};
