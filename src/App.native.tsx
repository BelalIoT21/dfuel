
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens using the barrel file
import { 
  HomeScreen, 
  LoginScreen, 
  ProfileScreen, 
  AdminDashboardScreen, 
  MachineDetailScreen 
} from './screens';

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
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator 
              initialRouteName="Home" // Change initial route to Home instead of Login
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
  );
}
