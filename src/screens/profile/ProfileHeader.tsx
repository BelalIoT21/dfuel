
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';
import { User } from '@/types/database';

interface ProfileHeaderProps {
  user: User;
  onBackToDashboard: () => void;
}

const ProfileHeader = ({ user, onBackToDashboard }: ProfileHeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.backButtonContainer}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={onBackToDashboard}
          color="#7c3aed"
        />
        <Text style={styles.backText}>Back to Dashboard</Text>
      </View>

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
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '500',
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
