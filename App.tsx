
// This must be the first import
import 'expo-router/entry';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

// The App component will never be rendered when using expo-router
// It must export a default function for compatibility
export default function App() {
  useEffect(() => {
    console.log("App component registered - but not used by expo-router");
  }, []);
  
  // This return is not used by expo-router but needed for type checking
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading Expo Router...</Text>
    </View>
  );
}
