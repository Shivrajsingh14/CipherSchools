const express = require('express');
const {
  getProjectFiles,
  getFilesByParent,
  getFile,
  createFile,
  updateFile,
  deleteFile,
} = require('../controllers/files');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All file routes are protected

router.get('/project/:projectId', getProjectFiles);
router.get('/:projectId/:parentId', getFilesByParent);
router.get('/:id', getFile);
router.post('/', createFile);
router.put('/:id', updateFile);
router.delete('/:id', deleteFile);

module.exports = router;