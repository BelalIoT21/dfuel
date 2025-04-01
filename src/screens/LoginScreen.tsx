
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { TextInput, Button, Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, login, register } = useAuth();
  
  // Get screen dimensions
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  
  // Calculate if we're on a small device
  const isSmallDevice = screenHeight < 700;

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
  
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView 
            contentContainerStyle={[
              styles.scrollContainer,
              { paddingTop: isSmallDevice ? screenHeight * 0.05 : screenHeight * 0.15 }
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.title}>Dfuel</Text>
              <Text style={styles.subtitle}>
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </Text>
            </View>

            <Surface style={[
              styles.formContainer,
              { width: screenWidth > 400 ? 380 : screenWidth * 0.9 }
            ]} elevation={2}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.input, isSmallDevice && styles.smallInput]}
                mode="outlined"
                dense={isSmallDevice}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={[styles.input, isSmallDevice && styles.smallInput]}
                mode="outlined"
                dense={isSmallDevice}
              />

              {!isLogin && (
                <TextInput
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, isSmallDevice && styles.smallInput]}
                  mode="outlined"
                  dense={isSmallDevice}
                />
              )}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={[styles.button, isSmallDevice && styles.smallButton]}
                loading={loading}
                disabled={loading}
              >
                {isLogin ? 'Login' : 'Register'}
              </Button>

              <Button
                mode="text"
                onPress={toggleMode}
                style={styles.toggleButton}
                labelStyle={isSmallDevice ? { fontSize: 13 } : undefined}
              >
                {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
              </Button>
            </Surface>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f3ff', // purple-50
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7c3aed', // purple-800
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280', // gray-600
    marginTop: 2,
  },
  formContainer: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  input: {
    marginBottom: 16,
  },
  smallInput: {
    marginBottom: 12,
    height: 50,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#7c3aed', // purple-600
    paddingVertical: 8,
  },
  smallButton: {
    paddingVertical: 4,
    marginTop: 8,
  },
  toggleButton: {
    marginTop: 12,
  },
  errorText: {
    color: '#ef4444', // red-500
    marginBottom: 10,
    fontSize: 13,
    textAlign: 'center',
  },
});

export default LoginScreen;
