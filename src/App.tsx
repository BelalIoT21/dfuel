
// This is a wrapper component that ensures compatibility with the existing codebase
// while transitioning to expo-router

import React from 'react';
import { View, Text } from 'react-native';

// This component is just a placeholder as we're using expo-router for navigation
export default function AppCompatibilityWrapper() {
  console.log("App compatibility wrapper loaded");
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>App is loading...</Text>
    </View>
  );
}
