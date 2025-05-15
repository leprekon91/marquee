# Marquee - Competition Display System

Marquee is a simple and lightweight web application designed to display performances during rhythmic gymnastics competitions. It allows organizers to manage competitors, categories, and control what is displayed on a public screen in real-time.

## Features

- Display current performer or competition title
- Organize performers by categories
- Real-time control panel for advancing through performers
- Customizable display settings (colors, fonts, logos)
- Import/export performer data via CSV
- Responsive design works on multiple screen sizes

## Table of Contents

1. [Installation](#installation)
2. [Development](#development)
3. [Production Deployment](#production-deployment)
4. [Usage Guide](#usage-guide)
5. [API Documentation](#api-documentation)
   - [Health Check](#health-check)
   - [Settings](#settings)
   - [Categories](#categories)
   - [Performers](#performers)
   - [Display](#display)
6. [Troubleshooting](#troubleshooting)
7. [License](#license)
8. [Contributing](#contributing)

## Installation

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)

### Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/marquee.git
   cd marquee
   ```

2. Install server dependencies:
   ```bash
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

4. Create a `.env` file in the project root (optional):
   ```
   NODE_ENV=development
   PORT=3001
   DB_PATH=./data
   ```

## Development

### Running in Development Mode

1. Start the backend server (from project root):
   ```bash
   npm run dev
   ```

2. In a separate terminal, start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

3. Access the application:
   - Admin panel: [http://localhost:5173](http://localhost:5173)
   - Display view: [http://localhost:5173/display](http://localhost:5173/display)

### Building the Project

To build both frontend and backend:
```bash
npm run build:full
```

To build just the backend:
```bash
npm run build
```

To build just the frontend:
```bash
npm run build:client
```

### Project Structure

```
marquee/
├── client/              # Vue.js frontend
│   ├── src/             # Frontend source files
│   │   ├── components/  # Vue components
│   │   ├── services/    # API services
│   │   ├── router/      # Vue Router configuration
│   │   └── types/       # TypeScript type definitions
│   └── public/          # Static assets
├── src/                 # Backend source files
│   ├── controllers/     # API endpoint controllers
│   ├── services/        # Business logic services
│   ├── routes/          # API route definitions
│   ├── db/              # Database configuration
│   └── types/           # TypeScript type definitions
├── data/                # SQLite database files
├── uploads/             # Uploaded files (logos, etc.)
├── scripts/             # Utility scripts
└── deploy/              # Deployment package files
```

## Production Deployment

### Building for Production

1. Create a production build:
   ```bash
   npm run prepare-deploy
   ```
   This will:
   - Build the frontend and backend
   - Create a deployment package in the `deploy` directory
   - Create a tarball archive `marquee-deploy.tar.gz`

2. The deployment package includes:
   - Compiled backend code
   - Built frontend files
   - Production dependencies
   - Setup scripts for Raspberry Pi
   - SQLite database files

### Deploying to Raspberry Pi

1. Transfer the deployment package to your Raspberry Pi:
   ```bash
   scp marquee-deploy.tar.gz pi@your-raspberry-pi-ip:~
   ```

2. SSH into your Raspberry Pi:
   ```bash
   ssh pi@your-raspberry-pi-ip
   ```

3. Extract the package:
   ```bash
   mkdir marquee
   tar -xzf marquee-deploy.tar.gz -C marquee
   cd marquee
   ```

4. Run the setup script:
   ```bash
   sudo ./setup.sh
   ```
   This script will:
   - Install Node.js (if not present)
   - Install PM2 process manager
   - Install dependencies
   - Create and enable a systemd service

5. Access the application at:
   ```
   http://your-raspberry-pi-ip:3000
   ```

### Managing the Service

- Start: `sudo systemctl start marquee.service`
- Stop: `sudo systemctl stop marquee.service`
- Restart: `sudo systemctl restart marquee.service`
- Check status: `sudo systemctl status marquee.service`
- View logs: `journalctl -u marquee.service`

## Usage Guide

### Navigation

The Marquee app has four main sections, accessible from the navigation menu:

1. **Admin** - The main control panel to manage the display
2. **Settings** - Customize the appearance and behavior
3. **Data** - Import/export performer data
4. **Display** - The public display view

### Admin Panel

The admin panel allows you to:

- View and manage performers by category
- Advance to the next performer
- Switch between title and performer display modes
- Override the current performer
- Change the current category

### Display Control

1. **Title Mode**: Shows the competition title and subtitle
   - Configure the title and subtitle in Settings

2. **Performer Mode**: Shows the current performer details
   - Name, club, routine, and optional description
   - The current category is shown above the performer details

### Managing Performers

1. **Adding Performers**:
   - Use the "Add Performer" button in the Admin panel
   - Fill in name, club, and routine information
   - Select a category
   - Set the performance order

2. **Editing Performers**:
   - Click the edit icon next to a performer in the list
   - Update information as needed
   - Save changes

3. **Deleting Performers**:
   - Click the delete icon next to a performer
   - Confirm deletion in the prompt

### Managing Categories

1. **Adding Categories**:
   - Use the "Add Category" button in the Admin panel
   - Enter a category name
   
2. **Deleting Categories**:
   - Click the delete icon next to a category
   - Note: Deleting a category will not delete its performers

### Customizing the Display

In the Settings section, you can customize:

- Background color
- Text color
- Font size
- Font family
- Logos (left, center, right)
- Title and subtitle text

### Data Import/Export

In the Data section, you can:

1. **Import Performers**:
   - Prepare a CSV file with columns: order, name, club, category_id, routine
   - Upload the CSV file using the Import button
   - Review and confirm the data

2. **Export Performers**:
   - Download current performers as a CSV file
   - Use for backup or editing in spreadsheet software

## API Documentation

The Marquee application includes a RESTful API that can be used to integrate with other systems or build custom interfaces. All API endpoints are prefixed with `/api`.

### Base URL

- Development: `http://localhost:3001/api`
- Production: `http://your-server-address/api`

### Health Check

#### Check API Health Status

```
GET /api/health
```

Returns the health status of the API.

**Response**:
```json
{
  "status": "ok"
}
```

### Settings

Settings that control the application's appearance and behavior.

#### Get All Settings

```
GET /api/settings
```

Returns all application settings.

**Response**:
```json
[
  {
    "id": "1",
    "key": "bg_color",
    "value": "#000000"
  },
  {
    "id": "2",
    "key": "text_color",
    "value": "#FFFFFF"
  },
  ...
]
```

#### Update Setting

```
POST /api/settings
```

Updates a single setting.

**Request Body**:
```json
{
  "key": "bg_color",
  "value": "#FFFFFF"
}
```

**Response**:
```json
{
  "message": "Setting updated successfully"
}
```

#### Reset Settings to Default

```
POST /api/settings/reset
```

Resets all settings to their default values.

**Response**:
```json
{
  "message": "Settings reset to default values"
}
```

### Categories

Categories are used to organize performers into groups.

#### Get All Categories

```
GET /api/categories
```

Returns all categories.

**Response**:
```json
[
  {
    "id": "1",
    "name": "Junior"
  },
  {
    "id": "2",
    "name": "Senior"
  },
  ...
]
```

#### Get Category by ID

```
GET /api/categories/:id
```

Returns a single category by ID.

**Parameters**:
- `id`: The ID of the category to retrieve

**Response**:
```json
{
  "id": "1",
  "name": "Junior"
}
```

#### Create Category

```
POST /api/categories
```

Creates a new category.

**Request Body**:
```json
{
  "name": "Intermediate"
}
```

**Response**:
```json
{
  "id": "3",
  "name": "Intermediate"
}
```

#### Delete Category

```
DELETE /api/categories/:id
```

Deletes a category by ID.

**Parameters**:
- `id`: The ID of the category to delete

**Response**:
```json
{
  "message": "Category deleted successfully"
}
```

### Performers

Performers are the individuals participating in the event.

#### Get All Performers

```
GET /api/performers
```

Returns all performers.

**Query Parameters** (optional):
- `categoryId`: Filter performers by category ID

**Response**:
```json
[
  {
    "id": "1",
    "order": "1",
    "name": "John Smith",
    "club": "Gymnastics Club",
    "category_id": "1",
    "routine": "Floor Exercise"
  },
  ...
]
```

#### Get Performer by ID

```
GET /api/performers/:id
```

Returns a single performer by ID.

**Parameters**:
- `id`: The ID of the performer to retrieve

**Response**:
```json
{
  "id": "1",
  "order": "1",
  "name": "John Smith",
  "club": "Gymnastics Club",
  "category_id": "1",
  "routine": "Floor Exercise"
}
```

#### Create Performer

```
POST /api/performers
```

Creates a new performer.

**Request Body**:
```json
{
  "order": "3",
  "name": "Jane Doe",
  "club": "Dance Academy",
  "category_id": "2",
  "routine": "Ballet"
}
```

**Response**:
```json
{
  "id": "3",
  "order": "3",
  "name": "Jane Doe",
  "club": "Dance Academy",
  "category_id": "2",
  "routine": "Ballet"
}
```

#### Update Performer

```
PATCH /api/performers/:id
```

Updates an existing performer.

**Parameters**:
- `id`: The ID of the performer to update

**Request Body**:
```json
{
  "order": "3",
  "name": "Jane Doe",
  "club": "Modern Dance Academy",
  "category_id": "2",
  "routine": "Contemporary"
}
```

**Response**:
```json
{
  "id": "3",
  "order": "3",
  "name": "Jane Doe",
  "club": "Modern Dance Academy",
  "category_id": "2",
  "routine": "Contemporary"
}
```

#### Delete Performer

```
DELETE /api/performers/:id
```

Deletes a performer by ID.

**Parameters**:
- `id`: The ID of the performer to delete

**Response**:
```json
{
  "message": "Performer deleted successfully"
}
```

### Display

Endpoints for controlling what is displayed on the marquee.

#### Get Display Settings

```
GET /api/display
```

Returns the current display settings and data.

**Response** (when display type is "title"):
```json
{
  "title": "Competition Title",
  "subtitle": "Competition Subtitle",
  "settings": {
    "bgColor": "#000000",
    "textColor": "#FFFFFF",
    "fontSize": "16px",
    "fontFamily": "Arial, sans-serif",
    "displayType": "title"
  }
}
```

**Response** (when display type is "performer"):
```json
{
  "performer": {
    "id": "1",
    "order": "1",
    "name": "John Smith",
    "club": "Gymnastics Club",
    "category_id": "1",
    "routine": "Floor Exercise"
  },
  "category": {
    "id": "1",
    "name": "Junior"
  },
  "settings": {
    "bgColor": "#000000",
    "textColor": "#FFFFFF",
    "fontSize": "16px",
    "fontFamily": "Arial, sans-serif",
    "displayType": "performer"
  }
}
```

#### Advance to Next Performer

```
POST /api/display/next-performer
```

Moves to the next performer within the current category.

**Response**:
```json
{
  "performer": {
    "id": "2",
    "order": "2",
    "name": "Emily Johnson",
    "club": "Gymnastics Club",
    "category_id": "1",
    "routine": "Vault"
  },
  "category": {
    "id": "1",
    "name": "Junior"
  }
}
```

#### Change Current Category

```
POST /api/display/category/:categoryId
```

Changes the current category and sets the first performer from that category as current.

**Parameters**:
- `categoryId`: The ID of the category to display

**Response**:
```json
{
  "success": true,
  "message": "Category updated successfully"
}
```

### Change Display Type

```
POST /api/display/type
```

Changes the display type between "performer" and "title".

**Request Body**:
```json
{
  "displayType": "performer"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Display type changed to performer"
}
```

## Error Responses

The API returns appropriate HTTP status codes and JSON error messages:

- `400 Bad Request` - Invalid input (missing or invalid parameters)
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side error

Error response example:
```json
{
  "error": "Category not found"
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Ensure the data directory exists and is writable
   - Check the DB_PATH setting in your .env file

2. **Client Cannot Connect to API**:
   - Verify the server is running on the correct port
   - Check for CORS issues in development

3. **Display Not Updating**:
   - Refresh the display page
   - Check browser console for errors
   - Verify the display type setting

### Development Tips

- Use the browser's developer tools to debug client-side issues
- Server logs will show API request details and errors
- The SQLite database can be examined directly with a tool like SQLite Browser

## License

ISC License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request