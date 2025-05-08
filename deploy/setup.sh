#!/bin/bash
# Marquee installation script for Raspberry Pi

# Make sure we're running as root
if [ "$(id -u)" != "0" ]; then
  echo "This script must be run as root" 1>&2
  exit 1
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
fi

# Install PM2 for process management
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  npm install -g pm2
fi

# Install production dependencies
echo "Installing dependencies..."
npm install --production

# Setup systemd service
cat > /etc/systemd/system/marquee.service << EOL
[Unit]
Description=Marquee Display System
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=$(pwd)
ExecStart=$(which pm2) start npm --name "marquee" -- start
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOL

# Enable and start the service
systemctl enable marquee.service
systemctl start marquee.service

echo "Marquee application has been installed and started."
echo "You can access it at http://localhost:3000"
echo "To check status: systemctl status marquee.service"
