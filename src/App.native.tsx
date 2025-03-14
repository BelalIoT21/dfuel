
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, LogBox } from 'react-native';

// Import screens directly from their locations
import HomeScreen from './screens/home/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import MachineDetailScreen from './screens/machine/MachineDetailScreen';

// Ignore specific warnings that might be noise
LogBox.ignoreLogs([
  'ReactNativeFiberHostComponent: Calling getNode() on the ref of an Animated component',
  'Non-serializable values were found in the navigation state',
]);

// Theme
const theme = {
  colors: {
    primary: '#7c3aed', // purple-600
    accent: '#a78bfa',  // purple-400
    background: '#ffffff',
    text: '#1f2937',    // gray-800
    error: '#ef4444',   // red-500
  }
};

// Stack navigator
const Stack = createNativeStackNavigator();

// Error boundary component
const ErrorBoundary = ({ children }) => {
  try {
    return children;
  } catch (error) {
    console.error('App render error:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ef4444', marginBottom: 10 }}>
          Something went wrong
        </Text>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          {error?.message || 'Unknown error occurred'}
        </Text>
      </View>
    );
  }
};

export default function App() {
  console.log("Starting Learnit Mobile App");

  // Add more detailed logging
  useEffect(() => {
    console.log("App component mounted");
    // Log all available screen components
    console.log("Available screens:", {
      HomeScreen: !!HomeScreen,
      LoginScreen: !!LoginScreen,
      ProfileScreen: !!ProfileScreen,
      AdminDashboardScreen: !!AdminDashboardScreen,
      MachineDetailScreen: !!MachineDetailScreen
    });
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <NavigationContainer>
              <Stack.Navigator 
                initialRouteName="Login"
                screenOptions={{
                  headerStyle: {
                    backgroundColor: '#7c3aed', // purple-600
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              >
                <Stack.Screen 
                  name="Login" 
                  component={LoginScreen} 
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="Home" 
                  component={HomeScreen} 
                  options={{ title: 'Dashboard' }}
                />
                <Stack.Screen 
                  name="Profile" 
                  component={ProfileScreen} 
                  options={{ title: 'My Profile' }}
                />
                <Stack.Screen 
                  name="AdminDashboard" 
                  component={AdminDashboardScreen} 
                  options={{ title: 'Admin Dashboard' }}
                />
                <Stack.Screen 
                  name="MachineDetail" 
                  component={MachineDetailScreen} 
                  options={({ route }) => ({ 
                    title: route.params?.name || 'Machine Details' 
                  })}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
