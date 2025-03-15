
import { createRoot } from 'react-dom/client'
import { StrictMode, Suspense } from 'react';
import './index.css'
import { isWeb, isPlatformNative } from './utils/platform';
import { loadEnv, setEnv } from './utils/env';
import App from './App'; // Move the import to the top level

// Add console log for debugging
console.log("Initializing application");
console.log("Is web environment:", isWeb);
console.log("Is native platform:", isPlatformNative());

// Load environment variables immediately
loadEnv();

// Create a fallback component to show while loading
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column',
    backgroundColor: '#f5f3ff'
  }}>
    <div style={{ fontSize: '24px', color: '#7c3aed', marginBottom: '16px' }}>
      Loading Learnit Academy...
    </div>
    <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// For web environment, use the normal React app
if (isWeb) {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error("Failed to find the root element");
  } else {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <Suspense fallback={<LoadingFallback />}>
          <App />
        </Suspense>
      </StrictMode>
    );
    console.log("App rendered successfully");
  }
} else {
  // For React Native, this file is not the entry point
  // The entry point is App.native.tsx which is handled by Expo
  console.log("React Native environment detected");
}
