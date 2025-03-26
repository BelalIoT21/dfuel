
#!/bin/bash
# Setup script for production server environment

# Default production port
PROD_PORT=${PORT:-8080}

# Create logs directory if it doesn't exist
mkdir -p logs

# Create production .env file
echo "Creating production .env file..."
echo "PORT=$PROD_PORT
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/dfuel
MONGODB_DB_NAME=dfuel
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@dfuel.com
ADMIN_PASSWORD=Admin123
FORCE_ADMIN_PASSWORD_UPDATE=true" > .env.production

echo "Production environment file created at .env.production"
echo ""
echo "IMPORTANT: Before launching in production:"
echo "1. Set up a secure MongoDB instance (not localhost)"
echo "2. Update MONGODB_URI in .env.production to your production database URL"
echo "3. Change the default ADMIN_EMAIL and ADMIN_PASSWORD"
echo "4. Run: NODE_ENV=production node dist/server.js"
echo ""
echo "To build the server for production:"
echo "npm run build"
