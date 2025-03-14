
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

interface ErrorStateProps {
  onGoBack: () => void;
}

const ErrorState = ({ onGoBack }: ErrorStateProps) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Machine not found</Text>
      <Button mode="contained" onPress={onGoBack}>Go Back</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
  },
});

export default ErrorState;
