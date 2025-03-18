
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Text } from 'react-native';
import { User } from '@/types/database';

interface SecuritySectionProps {
  user: User;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const SecuritySection = ({ user, changePassword }: SecuritySectionProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting to change password via SecuritySection");
      const success = await changePassword(currentPassword, newPassword);
      if (success) {
        Alert.alert('Success', 'Password changed successfully');
        setIsChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', 'Failed to change password');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Security</Text>
      
      {isChangingPassword ? (
        <View style={styles.formContainer}>
          <TextInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={true}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={true}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            mode="outlined"
            style={styles.input}
          />
          <View style={styles.buttonRow}>
            <Button 
              mode="outlined"
              onPress={() => {
                setIsChangingPassword(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              style={styles.buttonCancel}
            >
              Cancel
            </Button>
            <Button 
              mode="contained"
              onPress={handleChangePassword}
              loading={loading}
              disabled={loading}
              style={styles.buttonSave}
            >
              Change Password
            </Button>
          </View>
        </View>
      ) : (
        <Button 
          mode="outlined"
          onPress={() => setIsChangingPassword(true)}
          style={styles.editButton}
          icon="lock-reset"
        >
          Change Password
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

export default SecuritySection;
