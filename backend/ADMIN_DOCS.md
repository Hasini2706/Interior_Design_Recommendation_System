# Aura Admin Module Documentation

## Overview
The admin module allows administrators to create, read, update, and delete interior design combinations. Each design can be configured with multiple compatible options including rooms, styles, color moods, budget ranges, priorities, and sizes.

## Access Admin Panel
1. **Sign in with admin account:**
   - Email: `admin@aura.com`
   - Password: Any password (authentication is simulated in demo mode)

2. **Admin Settings button** will appear in the top-right navigation (gear icon)

## Creating a Design

### Fields:
- **Design Name** (required) - e.g., "Modern Living Room"
- **Image URL** (required) - URL to a design image
- **Description** (required) - Detailed description of the design
- **Room Type** (required) - Select one: Living Room, Bedroom, Kitchen, Bathroom, Office, Dining Room

### Design Combinations:
- **Styles** - Select multiple: Modern, Minimalist, Scandinavian, Bohemian
- **Color Moods** - Select multiple: Warm Neutrals, Cool Tones, Earth Tones, Monochrome
- **Priorities** - Select multiple: Comfort, Aesthetics, Functionality, Budget
- **Room Sizes** - Select multiple: Small, Medium, Large
- **Budget Range** - Set min and max budget
- **Features** - Comma-separated list (e.g., "LED lighting, spacious, minimal furniture")

## Backend API Endpoints

### Get All Designs
```
GET /api/admin/designs
```
Returns all interior designs in the database.

### Get Single Design
```
GET /api/admin/designs/:id
```
Returns a specific design by ID.

### Create New Design
```
POST /api/admin/designs
Content-Type: application/json

{
  "name": "Modern Living Room",
  "description": "Clean lines with contemporary aesthetics",
  "imageUrl": "https://...",
  "room": "Living Room",
  "styles": ["Modern", "Minimalist"],
  "moods": ["Cool Tones"],
  "budgetRange": { "min": 5000, "max": 15000 },
  "priority": ["Aesthetics", "Comfort"],
  "size": ["Medium", "Large"],
  "features": ["LED lighting", "spacious", "minimal"]
}
```

### Update Design
```
PUT /api/admin/designs/:id
Content-Type: application/json

{
  "name": "Updated Design Name",
  ... (same fields as create)
}
```

### Delete Design
```
DELETE /api/admin/designs/:id
```

### Filter Designs by Combinations
```
POST /api/admin/designs/filter
Content-Type: application/json

{
  "room": "Living Room",
  "styles": ["Modern"],
  "moods": ["Cool Tones"],
  "budgetMin": 5000,
  "budgetMax": 15000,
  "priority": ["Comfort"],
  "size": ["Medium"]
}
```

## Database Schema

### InteriorDesign Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  imageUrl: String,
  room: String,                    // Single room type
  styles: [String],               // Array of style strings
  moods: [String],               // Array of color mood strings
  budgetRange: {
    min: Number,
    max: Number
  },
  priority: [String],            // Array of priority strings
  size: [String],               // Array of size strings
  features: [String],           // Array of feature strings
  createdAt: Date,
  createdBy: String             // Admin email
}
```

## Features
- ✅ Create multi-combination designs
- ✅ Edit existing designs
- ✅ Delete designs
- ✅ View all admin-managed designs
- ✅ Filter designs by any combination of parameters
- ✅ Track design creation metadata

## Demo Admin Account
```
Email: admin@aura.com
Password: (any password - demo mode)
```

## Future Enhancements
- Real authentication and authorization
- Upload images directly instead of URLs
- Bulk import/export designs
- Design popularity analytics
- User recommendations based on filters
