
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LogBox } from "react-native";

// Ignore specific warnings that might appear in development
LogBox.ignoreLogs([
  'Overwriting fontFamily style attribute preprocessor',
]);

export default function Layout() {
  // Log on initialization to verify the app is loading
  useEffect(() => {
    console.log("Layout component mounted - expo-router is initializing");
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack 
        screenOptions={{
          headerStyle: {
            backgroundColor: '#7c3aed', // purple-600
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
    </SafeAreaProvider>
  );
}
