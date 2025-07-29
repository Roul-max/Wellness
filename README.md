# Wellness Session Platform

A full-stack wellness session platform built with React, Node.js, Express, and MongoDB. Users can register, create wellness sessions (yoga, meditation, etc.), save drafts, and publish sessions with auto-save functionality.

## 🚀 Features

### 🔐 Authentication
- Secure user registration and login with JWT tokens
- Password hashing using bcrypt (12 rounds)
- Protected routes and middleware
- Automatic token validation and refresh

### 📚 Session Management
- Browse published wellness sessions from the community
- Create, edit, and delete personal wellness sessions
- Draft and publish workflow
- **Auto-save functionality** (saves after 5 seconds of inactivity)
- Tag-based categorization and filtering
- JSON file URL integration for session data
- Search functionality with tag filters

### 🎨 User Interface
- Responsive design for mobile, tablet, and desktop
- Modern wellness-focused design with emerald green theme
- Real-time feedback with toast notifications
- Loading states and comprehensive error handling
- Smooth animations and hover effects
- Auto-save indicators and status updates

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB Atlas** with Mongoose ODM
- **JWT** authentication with bcryptjs
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Morgan** for request logging
- **Rate limiting** for API protection

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for fast development and building

## 📁 Project Structure

```
/
├── backend/                 # Node.js + Express backend
│   ├── models/             # MongoDB models
│   │   ├── User.js         # User model with auth
│   │   └── Session.js      # Session model
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication routes
│   │   └── sessions.js     # Session management routes
│   ├── middleware/         # Custom middleware
│   │   └── auth.js         # JWT authentication middleware
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server setup
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions (API client)
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # React entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── .env.example            # Environment variables template
└── README.md              # This file
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account (or local MongoDB installation)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd wellness-platform
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp ../.env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Environment Configuration
Create a `.env` file in the root directory with:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wellness-platform?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend Configuration (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 5. Start Development Servers

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to view the application.

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "last_login": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/auth/me`
Get current user information (protected).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### Session Endpoints

#### GET `/api/sessions`
Get all published wellness sessions (public).

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of sessions per page
- `tags` (optional): Comma-separated tags for filtering
- `search` (optional): Search term for session titles

**Response:**
```json
{
  "sessions": [
    {
      "_id": "session-id",
      "user_id": {
        "email": "creator@example.com"
      },
      "title": "Morning Yoga Flow",
      "tags": ["yoga", "morning", "flexibility"],
      "json_file_url": "https://example.com/session.json",
      "status": "published",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalSessions": 50,
    "hasNextPage": true
  }
}
```

#### GET `/api/my-sessions`
Get current user's sessions (protected).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `status` (optional): Filter by 'draft' or 'published'
- `page`, `limit`: Pagination parameters

#### GET `/api/my-sessions/:id`
Get a specific user session (protected).

#### POST `/api/my-sessions/save-draft`
Save or update a session as draft (protected).

**Request Body:**
```json
{
  "id": "session-id-if-updating",
  "title": "My Wellness Session",
  "tags": ["meditation", "relaxation"],
  "json_file_url": "https://example.com/session-data.json"
}
```

#### POST `/api/my-sessions/publish`
Publish a session (protected).

**Request Body:**
```json
{
  "id": "session-id-if-updating",
  "title": "My Wellness Session",
  "tags": ["meditation", "relaxation"],
  "json_file_url": "https://example.com/session-data.json"
}
```

#### DELETE `/api/my-sessions/:id`
Delete a user's session (protected).

## 🏗 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password_hash: String (required),
  created_at: Date,
  last_login: Date
}
```

### Session Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User, required),
  title: String (required, max 200 chars),
  tags: [String] (lowercase, max 50 chars each),
  json_file_url: String (required, valid URL),
  status: String (enum: ['draft', 'published']),
  created_at: Date,
  updated_at: Date
}
```

### Database Indexes
- `users.email`: Unique index for faster email lookups
- `sessions.user_id`: Index for user session queries
- `sessions.status`: Index for published session queries
- `sessions.user_id + sessions.status`: Compound index
- `sessions.tags + sessions.status`: Compound index for tag filtering

## ✨ Key Features Explained

### Auto-Save Functionality
- Automatically saves drafts after 5 seconds of inactivity
- Visual feedback with saving indicators
- Toast notifications for successful auto-saves
- Prevents data loss during editing

### Security Features
- JWT token authentication with 7-day expiration
- Password hashing with bcrypt (12 rounds)
- Rate limiting (100 requests per 15 minutes)
- Helmet.js for security headers
- Input validation and sanitization
- Protected API routes with middleware

### User Experience
- Responsive design for all device sizes
- Loading states and error handling
- Real-time form validation
- Intuitive navigation and status indicators
- Smooth animations and transitions

## 🚀 Deployment

### Backend Deployment (Railway/Render)
1. Push code to GitHub repository
2. Connect to Railway or Render
3. Set environment variables
4. Deploy automatically on push

### Frontend Deployment (Netlify/Vercel)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to Netlify or Vercel
3. Set API URL environment variable

### Environment Variables for Production
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for the Arvyax technical assessment
- Uses modern web development best practices
- Designed with user experience and security in mind