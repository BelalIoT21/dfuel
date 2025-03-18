
const { execSync } = require('child_process');

try {
  // Build the web app
  console.log('Building web app...');
  execSync('vite build', { stdio: 'inherit' });

  // Sync with Android
  console.log('Syncing with Android...');
  execSync('npx cap sync android', { stdio: 'inherit' });

  // Open Android Studio
  console.log('Opening Android Studio...');
  execSync('npx cap open android', { stdio: 'inherit' });
} catch (error) {
  console.error('Error building Android app:', error);
  process.exit(1);
}
