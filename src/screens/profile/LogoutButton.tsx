
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';

interface LogoutButtonProps {
  onLogout: () => Promise<void>;
  onNavigateToLogin: () => void;
}

const LogoutButton = ({ onLogout, onNavigateToLogin }: LogoutButtonProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
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
            try {
              setIsLoggingOut(true);
              await onLogout();
              onNavigateToLogin();
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Logout Failed', 'An error occurred while logging out. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
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
        loading={isLoggingOut}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
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
