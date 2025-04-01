
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

interface ErrorStateProps {
  onGoBack: () => void;
  errorMessage?: string;
}

const ErrorState = ({ onGoBack, errorMessage }: ErrorStateProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle}>Error</Text>
      <Text style={styles.errorMessage}>
        {errorMessage || "Unable to load machine information"}
      </Text>
      <Button 
        mode="contained" 
        onPress={onGoBack} 
        style={styles.button}
      >
        Return to Dashboard
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f3ff',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#7c3aed',
  },
});

export default ErrorState;
