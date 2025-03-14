
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
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
  const { user, updateProfile, changePassword } = useAuth();
  const { handleBackToDashboard } = useProfileNavigation(navigation);

  // If user is null, navigation is handled in the hook
  if (!user) {
    return null;
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
        onLogout={async () => await useAuth().logout()}
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
});

export default ProfileScreen;
