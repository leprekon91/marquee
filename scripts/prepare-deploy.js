/**
 * Script to create a deployment package for Raspberry Pi
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const projectRoot = path.resolve(__dirname, '..');
const deployDir = path.join(projectRoot, 'deploy');
const requiredDirectories = [
  '',                   // Root deploy directory
  'dist',               // Compiled JavaScript
  'client/dist',        // Vue frontend build
  'data',               // SQLite database directory
];

// Create deployment directory structure
console.log('Creating deployment directory structure...');
requiredDirectories.forEach(dir => {
  const fullPath = path.join(deployDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created: ${fullPath}`);
  }
});

// Copy compiled backend files
console.log('\nCopying compiled backend files...');
execSync(`cp -r ${projectRoot}/dist/* ${deployDir}/dist/`);

// Copy client build
console.log('\nCopying frontend build files...');
execSync(`cp -r ${projectRoot}/client/dist/* ${deployDir}/client/dist/`);

// Copy package.json and create a production-only package.json
console.log('\nCreating production package.json...');
const packageJson = require(path.join(projectRoot, 'package.json'));
const prodPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  main: packageJson.main,
  scripts: {
    start: 'node dist/index.js'
  },
  dependencies: {
    // Only include production dependencies
    ...packageJson.dependencies
  }
};

fs.writeFileSync(
  path.join(deployDir, 'package.json'), 
  JSON.stringify(prodPackageJson, null, 2)
);

// Create a .env file with production settings
console.log('\nCreating production .env file...');
const envContent = `
# Production environment variables
NODE_ENV=production
PORT=3000
DB_PATH=./data
`.trim();

fs.writeFileSync(path.join(deployDir, '.env'), envContent);

// Create installation script for Raspberry Pi
console.log('\nCreating setup script for Raspberry Pi...');
const setupScript = `#!/bin/bash
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
`;

fs.writeFileSync(path.join(deployDir, 'setup.sh'), setupScript);
execSync(`chmod +x ${deployDir}/setup.sh`);

// Create a README file
console.log('\nCreating deployment README...');
const readmeContent = `# Marquee Display System - Deployment Package

This package contains a production-ready build of the Marquee Display System for Raspberry Pi.

## Installation

1. Copy this entire directory to your Raspberry Pi.
2. Navigate to the directory on your Raspberry Pi.
3. Run the setup script with sudo permissions:

\`\`\`bash
sudo ./setup.sh
\`\`\`

## Manual Installation

If you prefer to install manually:

1. Install Node.js 18 or later
2. Run \`npm install --production\` to install dependencies
3. Run \`node dist/index.js\` to start the application

## Accessing the Application

Once running, access the application at:
- http://your-raspberry-pi-ip:3000

## Data Location

All data is stored in the \`data\` directory using SQLite.

## Starting/Stopping the Service

- Start: \`sudo systemctl start marquee.service\`
- Stop: \`sudo systemctl stop marquee.service\`
- Restart: \`sudo systemctl restart marquee.service\`
- Check status: \`sudo systemctl status marquee.service\`

## Troubleshooting

Check logs with:
\`\`\`
journalctl -u marquee.service
\`\`\`
`;

fs.writeFileSync(path.join(deployDir, 'README.md'), readmeContent);

// Create a tar.gz archive for easy transfer
console.log('\nCreating tarball archive...');
execSync(`tar -czf ${projectRoot}/marquee-deploy.tar.gz -C ${deployDir} .`);

console.log('\n✅ Deployment package created successfully!');
console.log(`📦 Deploy directory: ${deployDir}`);
console.log(`📦 Archive: ${projectRoot}/marquee-deploy.tar.gz`);
console.log('\nTo deploy to Raspberry Pi:');
console.log('1. Transfer the marquee-deploy.tar.gz file to your Raspberry Pi');
console.log('2. On the Raspberry Pi, extract with: tar -xzf marquee-deploy.tar.gz -C /path/to/destination');
console.log('3. Navigate to the extraction directory and run: sudo ./setup.sh');