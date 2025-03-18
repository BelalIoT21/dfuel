
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import ProfileHeader from './ProfileHeader';
import ProfileInfoSection from './ProfileInfoSection';
import SecuritySection from './SecuritySection';
import LogoutButton from './LogoutButton';
import { useProfileNavigation } from './hooks/useProfileNavigation';

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  useProfileNavigation(navigation, user);

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <ProfileHeader user={user} />
      
      <View style={styles.contentContainer}>
        <ProfileInfoSection user={user} />
        <SecuritySection />
        <LogoutButton />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
});

export default ProfileScreen;
