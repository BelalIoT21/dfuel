
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, List, Divider, Avatar } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, updateProfile, logout, changePassword } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigation.replace('Login');
    return null;
  }

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    setLoading(true);
    try {
      const success = await updateProfile(name, email);
      if (success) {
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
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
                  setName(user.name);
                  setEmail(user.email);
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

      <Divider />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        {isChangingPassword ? (
          <View style={styles.formContainer}>
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
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

      <Divider />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        {user.certifications && user.certifications.length > 0 ? (
          <List.Section>
            {user.certifications.map((certId) => (
              <List.Item
                key={certId}
                title={`Machine ${certId}`}
                left={(props) => <List.Icon {...props} icon="certificate" color="#7c3aed" />}
              />
            ))}
          </List.Section>
        ) : (
          <Text style={styles.emptyText}>No certifications yet</Text>
        )}
      </View>

      <View style={styles.section}>
        <Button 
          mode="contained" 
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
  },
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
  logoutButton: {
    backgroundColor: '#ef4444',
  },
  emptyText: {
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default ProfileScreen;
