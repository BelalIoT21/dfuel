
import 'expo-dev-client';
import { registerRootComponent } from 'expo';
import App from './src/App.native';

// Register the app component as the root component
registerRootComponent(App);

// This exports the native app component for Expo
export default App;
