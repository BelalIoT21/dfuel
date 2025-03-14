
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

interface RegisterFormProps {
  onSubmit: (email: string, password: string, name: string) => Promise<void>;
  loading: boolean;
}

const RegisterForm = ({ onSubmit, loading }: RegisterFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password || !name) {
      setError('Please fill out all fields');
      return;
    }
    
    setError('');
    try {
      await onSubmit(email, password, name);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during registration');
      }
    }
  };

  return (
    <View>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Register
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#7c3aed', // purple-600
    paddingVertical: 8,
  },
  errorText: {
    color: '#ef4444', // red-500
    marginBottom: 10,
  },
});

export default RegisterForm;
