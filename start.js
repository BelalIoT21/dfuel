
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Starting web server...');
  execSync('vite --host', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting web server:', error);
  process.exit(1);
}
