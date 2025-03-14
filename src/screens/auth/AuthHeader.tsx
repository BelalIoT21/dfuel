
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7c3aed', // purple-800
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280', // gray-600
    marginTop: 5,
  },
});

export default AuthHeader;
