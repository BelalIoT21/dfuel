
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react';
import './index.css'
import { isWeb, isPlatformNative } from './utils/platform';
import { loadEnv } from './utils/env';

// Add console log for debugging
console.log("Initializing application");
console.log("Is web environment:", isWeb);
console.log("Is native platform:", isPlatformNative());

// For web environment, use the normal React app
if (isWeb) {
  // Load environment variables
  loadEnv();
  
  // Import the web version of the app
  import('./App.tsx').then(({ default: App }) => {
    const rootElement = document.getElementById("root");

    if (!rootElement) {
      console.error("Failed to find the root element");
    } else {
      const root = createRoot(rootElement);
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );
      console.log("App rendered successfully");
    }
  }).catch(err => {
    console.error("Error loading App:", err);
  });
} else {
  // For React Native, this file is not the entry point
  // The entry point is App.native.tsx which is handled by Expo
  console.log("React Native environment detected");
}
