
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity 
} from 'react-native';
import { Surface, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import AuthHeader from './auth/AuthHeader';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import SocialSignIn from './auth/SocialSignIn';

const LoginScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, login, googleLogin, register } = useAuth();

  useEffect(() => {
    if (user) {
      navigation.replace(user.isAdmin ? 'AdminDashboard' : 'Home');
    }
  }, [user, navigation]);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError('');
    
    try {
      await register(email, password, name);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // For mobile we'd use the Google Sign-In native SDK
    // This is just a placeholder for now
    setError('Google login is currently only available on the web version');
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
        <AuthHeader
          title="Learnit"
          subtitle={isLogin ? 'Welcome back!' : 'Create your account'}
        />

        <Surface style={styles.formContainer} elevation={2}>
          {isLogin ? (
            <LoginForm onSubmit={handleLogin} loading={loading} />
          ) : (
            <RegisterForm onSubmit={handleRegister} loading={loading} />
          )}
          
          <SocialSignIn onGoogleLogin={handleGoogleLogin} />

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
  formContainer: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  toggleButton: {
    marginTop: 16,
  },
});

export default LoginScreen;
