
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Text } from 'react-native';
import { User } from '@/types/database';

interface ProfileInfoSectionProps {
  user: User;
  updateProfile: (details: { name: string; email: string }) => Promise<boolean>;
}

const ProfileInfoSection = ({ user, updateProfile }: ProfileInfoSectionProps) => {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Get token from localStorage before making the request
      const token = localStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const success = await updateProfile({ name: name.trim(), email: email.trim() });
      if (success) {
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Profile Information</Text>
      
      {isEditing ? (
        <View style={styles.formContainer}>
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.buttonRow}>
            <Button 
              mode="outlined"
              onPress={() => {
                setIsEditing(false);
                setName(user.name || '');
                setEmail(user.email || '');
              }}
              style={styles.buttonCancel}
            >
              Cancel
            </Button>
            <Button 
              mode="contained"
              onPress={handleUpdateProfile}
              loading={loading}
              disabled={loading}
              style={styles.buttonSave}
            >
              Save
            </Button>
          </View>
        </View>
      ) : (
        <Button 
          mode="outlined"
          onPress={() => setIsEditing(true)}
          style={styles.editButton}
          icon="account-edit"
        >
          Edit Profile
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  formContainer: {
    marginTop: 10,
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  buttonSave: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#7c3aed',
  },
  buttonCancel: {
    flex: 1,
    marginRight: 8,
    borderColor: '#7c3aed',
  },
  editButton: {
    borderColor: '#7c3aed',
  },
});

export default ProfileInfoSection;
