
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

interface SocialSignInProps {
  onGoogleLogin: () => void;
}

const SocialSignIn = ({ onGoogleLogin }: SocialSignInProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button
        mode="outlined"
        onPress={onGoogleLogin}
        style={styles.googleButton}
        icon="google"
      >
        Continue with Google
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  googleButton: {
    marginTop: 10,
    borderColor: '#7c3aed',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb', // gray-200
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#6b7280', // gray-500
    fontSize: 12,
  },
});

export default SocialSignIn;
