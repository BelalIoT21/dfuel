
import { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

export const useProfileNavigation = (navigation) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // For React Native navigation
      if (navigation.replace) {
        navigation.replace('Login');
      } 
      // For React Router navigation
      else if (navigation.navigate) {
        navigation.navigate('/');
      }
    }
  }, [user, navigation]);

  const handleBackToDashboard = () => {
    console.log('Navigating back to dashboard. User is admin:', user?.isAdmin);
    // Allow admin users to access the Home screen for booking machines
    // instead of only redirecting to AdminDashboard
    
    // For React Native navigation
    if (navigation.navigate) {
      navigation.navigate('Home');
    } 
    // For React Router navigation
    else {
      navigation.navigate('/home');
    }
  };

  return {
    user,
    handleBackToDashboard
  };
};
