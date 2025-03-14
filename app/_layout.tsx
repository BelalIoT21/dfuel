
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  // Log on initialization to verify the app is loading
  useEffect(() => {
    console.log("Layout component mounted - app is initializing");
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack 
        initialRouteName="index"
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
