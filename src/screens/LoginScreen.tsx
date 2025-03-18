
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Surface, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { user, login, register } = useAuth();

  useEffect(() => {
    if (user) {
      navigation.replace(user.isAdmin ? 'AdminDashboard' : 'Home');
    }
  }, [user, navigation]);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await register(email, password, name);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>Learnit</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </Text>
        </View>

        <Surface style={styles.formContainer} elevation={2}>
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
            secureTextEntry={!showPassword}
            style={styles.input}
            mode="outlined"
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          {!isLogin && (
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
            />
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            {isLogin ? 'Login' : 'Register'}
          </Button>

          <Button
            mode="text"
            onPress={toggleMode}
            style={styles.toggleButton}
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff', // purple-50
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
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
  formContainer: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#7c3aed', // purple-600
    paddingVertical: 8,
  },
  toggleButton: {
    marginTop: 16,
  },
  errorText: {
    color: '#ef4444', // red-500
    marginBottom: 10,
  },
});

export default LoginScreen;
