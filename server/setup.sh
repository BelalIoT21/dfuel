
#!/bin/bash
# Install all dependencies for the server
npm install

# Create logs directory if it doesn't exist
mkdir -p logs

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating default .env file..."
  cp .env.example .env 2>/dev/null || echo "PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dfuel
MONGODB_DB_NAME=dfuel
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@dfuel.com
ADMIN_PASSWORD=Admin123
FORCE_ADMIN_PASSWORD_UPDATE=false" > .env
fi

echo "Server dependencies installed successfully!"
echo "Starting server..."
npm run dev
