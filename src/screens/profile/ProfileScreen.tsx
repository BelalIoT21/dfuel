
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useProfileNavigation } from './hooks/useProfileNavigation';

// Import the component sections
import ProfileHeader from './ProfileHeader';
import ProfileInfoSection from './ProfileInfoSection';
import SecuritySection from './SecuritySection';
import CertificationsSection from './CertificationsSection';
import LogoutButton from './LogoutButton';

const ProfileScreen = ({ navigation }) => {
  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('Error using auth context:', error);
    // Provide a fallback UI when auth context is not available
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load profile. Please try again later.</Text>
      </View>
    );
  }

  const { user, updateProfile, changePassword } = auth || {};
  const { handleBackToDashboard } = useProfileNavigation(navigation);

  // If user is null, navigation is handled in the hook
  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Please log in to view your profile.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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
            await auth?.logout();
          } catch (error) {
            console.error('Error during logout:', error);
          }
        }}
        onNavigateToLogin={() => navigation.replace('Login')}
      />
    </ScrollView>
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
