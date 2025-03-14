
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

const LoadingState = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#7c3aed" />
      <Text style={styles.loadingText}>Loading machine details...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
  },
  loadingText: {
    marginTop: 10,
    color: '#7c3aed',
  },
});

export default LoadingState;
