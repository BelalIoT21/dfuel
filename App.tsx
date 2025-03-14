
// This must be the first import
import 'expo-router/entry';
import React from 'react';
import { View, Text } from 'react-native';

// The App component will never be rendered when using expo-router
// It must export a default function for compatibility
export default function App() {
  console.log("App component initialized");
  // This return is not used by expo-router but needed for type checking
  return null;
}
