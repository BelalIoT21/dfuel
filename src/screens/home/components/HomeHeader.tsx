
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeHeader = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Dashboard</Text>
      <Text style={styles.headerSubtitle}>Select a machine to get started</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed', // purple-800
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280', // gray-600
  },
});

export default HomeHeader;
