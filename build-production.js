
const { execSync } = require('child_process');

try {
  // Set production mode
  console.log('Building for production...');
  
  // Build the web app
  execSync('vite build --mode production', { stdio: 'inherit' });
  
  console.log('Building server...');
  execSync('cd server && npm run build', { stdio: 'inherit' });
  
  console.log('Production build completed!');
  console.log('To deploy:');
  console.log('1. Copy the "dist" folder to your web server');
  console.log('2. Copy the server/dist folder to your API server');
  console.log('3. Set up environment with: server/setup-production.sh');
  console.log('4. Run the server with: NODE_ENV=production node server/dist/server.js');
} catch (error) {
  console.error('Error building for production:', error);
  process.exit(1);
}
