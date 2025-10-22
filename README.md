# 🚀 CipherStudio - Browser-Based React IDE

CipherStudio is a modern, full-featured online IDE specifically designed for React development. Build, edit, and preview React applications directly in your browser with real-time feedback and project management capabilities.

![CipherStudio Demo](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)

## ✨ Key Features

### 🎯 Core IDE Functionality
- **Monaco Code Editor** - Professional code editing with syntax highlighting and IntelliSense
- **Live Preview** - Real-time React app rendering with instant updates
- **File Management** - Complete CRUD operations for files and folders
- **Project Organization** - Create and manage multiple React projects

### 🔧 Advanced Features
- **Responsive Preview** - Test your apps on Desktop, Tablet, and Mobile viewports
- **Auto-Save System** - Smart debounced saving with manual save option (Ctrl+S)
- **Theme Support** - Dark/Light mode with system preference detection
- **User Authentication** - Secure JWT-based login and registration
- **Real-time Collaboration Ready** - Architecture supports future collaborative features

### 🎨 User Experience
- **Professional UI** - Clean, intuitive interface built with Material-UI
- **Responsive Design** - Works seamlessly on all devices
- **Visual Feedback** - Save status indicators and loading states
- **Error Handling** - Graceful error recovery and user notifications

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (MongoDB)     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Monaco Editor │    │ • JWT Auth      │    │ • Users         │
│ • Sandpack      │    │ • REST APIs     │    │ • Projects      │
│ • Material-UI   │    │ • File CRUD     │    │ • Files         │
│ • Context API   │    │ • Project CRUD  │    │ • Relationships │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
cipherstudio/
├── README.md
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── CodeEditor.js # Monaco editor wrapper
│   │   │   ├── PreviewPanel.js # Sandpack integration
│   │   │   ├── FileExplorer.js # File tree component
│   │   │   └── ...
│   │   ├── context/          # React Context providers
│   │   │   ├── AuthContext.js
│   │   │   ├── ProjectContext.js
│   │   │   ├── FileContext.js
│   │   │   └── ThemeContext.js
│   │   ├── pages/            # Main application pages
│   │   │   ├── Dashboard.js  # Project management
│   │   │   ├── IDE.js        # Main IDE interface
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   └── services/         # API communication
│   └── package.json
└── backend/                  # Express API server
    ├── config/
    │   └── db.js            # MongoDB connection
    ├── controllers/         # Route handlers
    │   ├── auth.js
    │   ├── projects.js
    │   └── files.js
    ├── middleware/
    │   └── auth.js          # JWT verification
    ├── models/              # Mongoose schemas
    │   ├── User.js
    │   ├── Project.js
    │   └── File.js
    ├── routes/              # API endpoints
    └── server.js            # Express app entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or MongoDB Atlas)
- Modern web browser

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd cipherstudio
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/cipherstudio
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d
```

Start backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env` file in frontend folder:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start frontend development server:
```bash
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **Material-UI** - Professional component library
- **Monaco Editor** - VS Code editor in the browser
- **Sandpack** - CodeSandbox's React execution environment
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication

### Backend
- **Node.js & Express** - Fast, minimal web framework
- **MongoDB & Mongoose** - NoSQL database with elegant modeling
- **JWT** - Secure authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 🎯 Core Functionality Flow

```
User Registration/Login
         ↓
Dashboard (Project Management)
         ↓
Create/Select Project
         ↓
IDE Interface
    ↓         ↓        ↓
File Tree  Code Editor  Live Preview
    ↓         ↓        ↓
   CRUD    Auto-Save   Real-time
Operations  (500ms)    Updates
```

## 🔥 Unique Features

### Smart Auto-Save System
- **Debounced saving** every 500ms while typing
- **Manual save** with Ctrl+S shortcut
- **Visual feedback** showing save status
- **Network error recovery** with retry mechanism

### Responsive Preview Testing
- **Device simulation** - Desktop, Tablet, Mobile views
- **Real device frames** for authentic testing experience
- **Instant switching** between viewport sizes

### Professional File Management
- **Hierarchical structure** with nested folders
- **Drag-and-drop** file organization
- **Context menus** for quick actions
- **Real-time updates** across all components

## 📦 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Files
- `GET /api/files/project/:projectId` - Get project files
- `POST /api/files` - Create file/folder
- `PUT /api/files/:id` - Update file content
- `DELETE /api/files/:id` - Delete file/folder

## 🚀 Deployment Ready

The application is structured for easy deployment:
- **Frontend**: Deploy to Vercel, Netlify, or any static hosting
- **Backend**: Deploy to Render, Railway, or Heroku
- **Database**: MongoDB Atlas for production database

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Monaco Editor** for the excellent code editing experience
- **Sandpack** for seamless React code execution
- **Material-UI** for the beautiful component library
- **CipherSchools** for the inspiring project challenge

---

**Built with ❤️ for developers who love coding in the browser**#   C i p h e r S c h o o l s  
 