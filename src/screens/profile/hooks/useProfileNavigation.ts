
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
      // For admin users, give them the choice to go to AdminDashboard or Home
      navigation.navigate('AdminDashboard');
    } else {
      // For regular users, go to Home
      navigation.navigate('Home');
    }
  };

  return {
    user,
    handleBackToDashboard
  };
};
