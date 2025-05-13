# Marquee API Documentation

This document provides a comprehensive reference for all available API endpoints in the Marquee application.

## Base URL

All API endpoints are prefixed with: `/api`

## Table of Contents

1. [Health Check](#health-check)
2. [Settings](#settings)
3. [Categories](#categories)
4. [Performers](#performers)
5. [Display](#display)

## Health Check

### Check API Health Status

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

## Settings

Settings that control the application's appearance and behavior.

### Get All Settings

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

### Update Setting

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

### Reset Settings to Default

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

## Categories

Categories are used to organize performers into groups.

### Get All Categories

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

### Get Category by ID

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

### Create Category

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

### Delete Category

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

## Performers

Performers are the individuals participating in the event.

### Get All Performers

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

### Get Performer by ID

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

### Create Performer

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

### Update Performer

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

### Delete Performer

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

## Display

Endpoints for controlling what is displayed on the marquee.

### Get Display Settings

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

### Advance to Next Performer

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

### Change Current Category

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