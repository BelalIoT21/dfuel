
import { createRoot } from 'react-dom/client'
import { StrictMode, Suspense } from 'react';
import './index.css'
import { isWeb, isPlatformNative } from './utils/platform';
import { loadEnv } from './utils/env';
import App from './App';

// Add more debug logs
console.log("Initializing application");
console.log("Is web environment:", isWeb);
console.log("Is native platform:", isPlatformNative());
console.log("Document root element:", document.getElementById("root"));

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
  try {
    const rootElement = document.getElementById("root");

    if (!rootElement) {
      console.error("Failed to find the root element");
      // Create a fallback root element if needed
      const fallbackRoot = document.createElement('div');
      fallbackRoot.id = 'root';
      document.body.appendChild(fallbackRoot);
      console.log("Created fallback root element");
    }
    
    const root = createRoot(rootElement || document.body);
    
    // Add additional console logs for debugging
    console.log("Creating root and rendering app");
    
    root.render(
      <StrictMode>
        <Suspense fallback={<LoadingFallback />}>
          <App />
        </Suspense>
      </StrictMode>
    );
    console.log("App rendered successfully");
  } catch (error) {
    console.error("Error during app rendering:", error);
    // Display error on page
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
        <h1 style="color: red;">Application Error</h1>
        <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    `;
  }
} else {
  // For React Native, this file is not the entry point
  console.log("React Native environment detected - deferring to native entry point");
}
