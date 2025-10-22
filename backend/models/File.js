const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a file name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  type: {
    type: String,
    enum: ['file', 'folder'],
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  parentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'File',
    default: null,
  },
  projectId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

// Create index to efficiently query files by project and parent
FileSchema.index({ projectId: 1, parentId: 1 });

module.exports = mongoose.model('File', FileSchema);