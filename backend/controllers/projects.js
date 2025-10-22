const Project = require('../models/Project');
const File = require('../models/File');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({ lastModified: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Make sure user owns the project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this project' });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const project = await Project.create(req.body);

    // Create default project files structure
    await createDefaultProjectStructure(project._id);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Make sure user owns the project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this project' });
    }

    // Update lastModified timestamp
    req.body.lastModified = Date.now();

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Make sure user owns the project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this project' });
    }

    // Delete associated files
    await File.deleteMany({ projectId: project._id });

    await project.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to create default project structure
const createDefaultProjectStructure = async (projectId) => {
  try {
    // Create root folder (public)
    const publicFolder = await File.create({
      name: 'public',
      type: 'folder',
      projectId,
      parentId: null,
    });

    // Create index.html in public folder
    await File.create({
      name: 'index.html',
      type: 'file',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using CipherStudio"
    />
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`,
      projectId,
      parentId: publicFolder._id,
    });

    // Create src folder
    const srcFolder = await File.create({
      name: 'src',
      type: 'folder',
      projectId,
      parentId: null,
    });

    // Create App.js
    await File.create({
      name: 'App.js',
      type: 'file',
      content: `import React from 'react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to CipherStudio</h1>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <button onClick={() => alert('Hello, CipherStudio!')}>Click Me</button>
      </header>
    </div>
  );
}

export default App;`,
      projectId,
      parentId: srcFolder._id,
    });

    // Create index.js
    await File.create({
      name: 'index.js',
      type: 'file',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      projectId,
      parentId: srcFolder._id,
    });

    // Create package.json at root level
    await File.create({
      name: 'package.json',
      type: 'file',
      content: `{
  "name": "react-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,
      projectId,
      parentId: null,
    });
  } catch (error) {
    console.error('Error creating default project structure:', error);
    throw error;
  }
};