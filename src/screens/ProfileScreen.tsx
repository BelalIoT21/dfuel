
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

  const handleBackToDashboard = () => {
    console.log('Navigating back to dashboard. User is admin:', user.isAdmin);
    if (user.isAdmin) {
      navigation.navigate('AdminDashboard');
    } else {
      // Ensure we're using the correct screen name for regular users
      navigation.navigate('Home');
    }
  };

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
