
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';

interface LogoutButtonProps {
  onLogout: () => Promise<void>;
  onNavigateToLogin: () => void;
}

const LogoutButton = ({ onLogout, onNavigateToLogin }: LogoutButtonProps) => {
  const handleLogout = () => {
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
            await onLogout();
            onNavigateToLogin();
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
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
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
});

export default LogoutButton;
