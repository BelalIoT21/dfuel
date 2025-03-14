
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
    // Allow admin users to access the Home screen for booking machines
    // instead of only redirecting to AdminDashboard
    navigation.navigate('Home');
  };

  return {
    user,
    handleBackToDashboard
  };
};
