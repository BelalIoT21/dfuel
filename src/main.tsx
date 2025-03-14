
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react';
import './index.css'

// Add console log for debugging
console.log("Initializing application");

// Determine if we're running in a web or native environment
const isWeb = typeof document !== 'undefined';

// For web environment, use the normal React app
if (isWeb) {
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
  });
} else {
  // For React Native, this file is not the entry point
  // The entry point is App.native.tsx which is handled by Expo
  console.log("React Native environment detected");
}
