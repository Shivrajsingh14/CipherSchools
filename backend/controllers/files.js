const Project = require('../models/Project');
const File = require('../models/File');

// @desc    Get all files for a project
// @route   GET /api/files/project/:projectId
// @access  Private
exports.getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if project exists and belongs to the user
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this project' });
    }

    // Get all files for the project
    const files = await File.find({ projectId });

    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get files by parent folder
// @route   GET /api/files/:projectId/:parentId
// @access  Private
exports.getFilesByParent = async (req, res) => {
  try {
    const { projectId, parentId } = req.params;
    
    // Check if project exists and belongs to the user
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this project' });
    }

    // If parentId is 'root', get files with no parent
    const query = parentId === 'root' 
      ? { projectId, parentId: null } 
      : { projectId, parentId };

    const files = await File.find(query);

    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get a single file
// @route   GET /api/files/:id
// @access  Private
exports.getFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // Check if the user owns the project this file belongs to
    const project = await Project.findById(file.projectId);
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this file' });
    }

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new file or folder
// @route   POST /api/files
// @access  Private
exports.createFile = async (req, res) => {
  try {
    const { name, type, content, parentId, projectId } = req.body;

    // Check if project exists and belongs to the user
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to modify this project' });
    }

    // Check if parent exists if parentId is provided
    if (parentId) {
      const parentFile = await File.findById(parentId);
      if (!parentFile) {
        return res.status(404).json({ success: false, error: 'Parent folder not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ success: false, error: 'Parent must be a folder' });
      }
    }

    // Check if a file/folder with the same name already exists in the same location
    const existingFile = await File.findOne({
      name,
      parentId: parentId || null,
      projectId,
    });

    if (existingFile) {
      return res.status(400).json({ success: false, error: 'A file or folder with this name already exists in this location' });
    }

    // Create the file or folder
    const file = await File.create({
      name,
      type,
      content: type === 'file' ? content : undefined,
      parentId: parentId || null,
      projectId,
    });

    // Update the project's lastModified timestamp
    await Project.findByIdAndUpdate(projectId, { lastModified: Date.now() });

    res.status(201).json({
      success: true,
      data: file,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a file
// @route   PUT /api/files/:id
// @access  Private
exports.updateFile = async (req, res) => {
  try {
    let file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // Check if the user owns the project this file belongs to
    const project = await Project.findById(file.projectId);
    if (!project || project.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this file' });
    }

    // If trying to rename, check for duplicate names
    if (req.body.name && req.body.name !== file.name) {
      const existingFile = await File.findOne({
        name: req.body.name,
        parentId: file.parentId,
        projectId: file.projectId,
      });

      if (existingFile) {
        return res.status(400).json({ success: false, error: 'A file or folder with this name already exists in this location' });
      }
    }

    // Update lastModified timestamp
    req.body.lastModified = Date.now();

    // Update the file
    file = await File.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Update the project's lastModified timestamp
    await Project.findByIdAndUpdate(file.projectId, { lastModified: Date.now() });

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a file or folder
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // Check if the user owns the project this file belongs to
    const project = await Project.findById(file.projectId);
    if (!project || project.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this file' });
    }

    // If it's a folder, recursively delete all child files and folders
    if (file.type === 'folder') {
      await deleteFolder(file._id);
    }

    // Delete the file or folder
    await file.deleteOne();

    // Update the project's lastModified timestamp
    await Project.findByIdAndUpdate(file.projectId, { lastModified: Date.now() });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to recursively delete a folder and its contents
const deleteFolder = async (folderId) => {
  try {
    // Get all files and subfolders in this folder
    const children = await File.find({ parentId: folderId });

    // Recursively delete subfolders and their contents
    for (const child of children) {
      if (child.type === 'folder') {
        await deleteFolder(child._id);
      }
      await child.deleteOne();
    }
  } catch (error) {
    console.error('Error deleting folder contents:', error);
    throw error;
  }
};