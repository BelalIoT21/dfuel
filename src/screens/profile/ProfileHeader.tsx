
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import { User } from '@/types/database';

interface ProfileHeaderProps {
  user: User;
}

const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  return (
    <View style={styles.header}>
      <Avatar.Text 
        size={80} 
        label={user.name.substr(0, 2).toUpperCase()} 
        backgroundColor="#7c3aed"
      />
      <Text style={styles.headerTitle}>{user.name}</Text>
      <Text style={styles.headerSubtitle}>{user.email}</Text>
      {user.isAdmin && (
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>Administrator</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  adminBadge: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#7c3aed',
    borderRadius: 16,
  },
  adminBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ProfileHeader;
