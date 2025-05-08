# Marquee Display System - Deployment Package

This package contains a production-ready build of the Marquee Display System for Raspberry Pi.

## Installation

1. Copy this entire directory to your Raspberry Pi.
2. Navigate to the directory on your Raspberry Pi.
3. Run the setup script with sudo permissions:

```bash
sudo ./setup.sh
```

## Manual Installation

If you prefer to install manually:

1. Install Node.js 18 or later
2. Run `npm install --production` to install dependencies
3. Run `node dist/index.js` to start the application

## Accessing the Application

Once running, access the application at:
- http://your-raspberry-pi-ip:3000

## Data Location

All data is stored in the `data` directory using SQLite.

## Starting/Stopping the Service

- Start: `sudo systemctl start marquee.service`
- Stop: `sudo systemctl stop marquee.service`
- Restart: `sudo systemctl restart marquee.service`
- Check status: `sudo systemctl status marquee.service`

## Troubleshooting

Check logs with:
```
journalctl -u marquee.service
```
