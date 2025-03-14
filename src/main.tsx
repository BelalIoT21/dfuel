
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add console log for debugging
console.log("Initializing application");

// Use strict mode to catch more potential issues during development
import { StrictMode } from 'react';

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
}
