
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useProfileNavigation } from './hooks/useProfileNavigation';

// Import the component sections
import ProfileHeader from './ProfileHeader';
import ProfileInfoSection from './ProfileInfoSection';
import SecuritySection from './SecuritySection';
import CertificationsSection from './CertificationsSection';
import LogoutButton from './LogoutButton';
import { isWeb } from '@/utils/platform';

const ProfileScreen = ({ navigation }) => {
  console.log("Rendering ProfileScreen component");
  
  let auth = null;
  let error = null;

  try {
    auth = useAuth();
    console.log("Auth context loaded successfully", auth ? "with user data" : "without user data");
  } catch (err) {
    console.error('Error using auth context:', err);
    error = err;
  }

  const { user, updateProfile, changePassword } = auth || {};
  
  // In web environment, handle navigation differently
  let handleBackToDashboard;
  try {
    const navigationUtils = useProfileNavigation(navigation);
    handleBackToDashboard = navigationUtils.handleBackToDashboard;
    console.log("Navigation utils loaded successfully");
  } catch (err) {
    console.error('Error with profile navigation:', err);
    // Fallback for web environment
    handleBackToDashboard = () => {
      console.log('Fallback navigation: going back to dashboard');
      if (isWeb && navigation && navigation.navigate) {
        navigation.navigate('Home');
      }
    };
  }

  // If there was an error initializing the auth context
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load profile. Please try again later.</Text>
      </View>
    );
  }

  // If user is null, navigation is handled in the hook
  if (!user) {
    console.log("No user found in ProfileScreen");
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Please log in to view your profile.</Text>
      </View>
    );
  }

  console.log("Rendering profile content for user:", user.name);
  
  return (
    <View style={styles.container}>
      <ProfileHeader 
        user={user} 
        onBackToDashboard={handleBackToDashboard}
      />

      <ProfileInfoSection 
        user={user}
        updateProfile={updateProfile}
      />

      <Divider />

      <SecuritySection 
        user={user}
        changePassword={changePassword}
      />

      <Divider />

      <CertificationsSection user={user} />

      <LogoutButton 
        onLogout={async () => {
          try {
            console.log("Attempting logout");
            await auth?.logout();
          } catch (error) {
            console.error('Error during logout:', error);
          }
        }}
        onNavigateToLogin={() => {
          console.log("Navigating to login screen");
          if (navigation && navigation.replace) {
            navigation.replace('Login');
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f3ff',
  },
  errorText: {
    fontSize: 16,
    color: '#6b21a8',
    textAlign: 'center',
  },
});

export default ProfileScreen;
