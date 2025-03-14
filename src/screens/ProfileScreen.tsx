
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Divider } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

// Import the component sections
import ProfileHeader from './profile/ProfileHeader';
import ProfileInfoSection from './profile/ProfileInfoSection';
import SecuritySection from './profile/SecuritySection';
import CertificationsSection from './profile/CertificationsSection';
import LogoutButton from './profile/LogoutButton';

const ProfileScreen = ({ navigation }) => {
  const { user, updateProfile, logout, changePassword } = useAuth();

  if (!user) {
    navigation.replace('Login');
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <ProfileHeader user={user} />

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
        onLogout={logout}
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
