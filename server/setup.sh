
#!/bin/bash
# Install all dependencies for the server
npm install

# Create log directory if it doesn't exist
mkdir -p logs

# Ensure MongoDB is running
echo "Checking if MongoDB is running..."
if command -v mongod &> /dev/null; then
  if ! pgrep -x "mongod" > /dev/null; then
    echo "MongoDB is not running. Attempting to start..."
    if [ -d "/data/db" ]; then
      mongod --dbpath /data/db &
    else
      echo "MongoDB data directory not found. Please ensure MongoDB is installed correctly."
    fi
  else
    echo "MongoDB is already running."
  fi
else
  echo "MongoDB not found. Please ensure MongoDB is installed."
fi

echo "Server dependencies installed successfully!"
echo "Log directory created at ./logs"
echo "Run 'npm run dev' to start the server"
