import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Button,
} from '@mui/material';
import Header from '../components/Header';
import FileExplorer from '../components/FileExplorer';
import CodeEditor from '../components/CodeEditor';
import PreviewPanel from '../components/PreviewPanel';
import FileDialog from '../components/FileDialog';
import { ProjectProvider, useProjects } from '../context/ProjectContext';
import { FileProvider, useFiles } from '../context/FileContext';

const IDE = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  
  const { getProject, currentProject, loading: projectLoading } = useProjects();
  const {
    files,
    currentFile,
    loading: filesLoading,
    error,
    getProjectFiles,
    getFile,
    createFile,
    updateFile,
    deleteFile,
    organizeFiles,
    clearError,
  } = useFiles();

  const [treeFiles, setTreeFiles] = useState([]);
  const [rootFiles, setRootFiles] = useState([]);
  const [alertMessage, setAlertMessage] = useState({ message: '', severity: 'success' });
  const [showAlert, setShowAlert] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState('file');
  const [fileToRename, setFileToRename] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);

  useEffect(() => {
    if (projectId) {
      getProject(projectId);
      getProjectFiles(projectId).then(fetchedFiles => {
        // Find all root level files/folders
        const roots = fetchedFiles.filter(file => file.parentId === null);
        setRootFiles(roots);
      });
    }
    // eslint-disable-next-line
  }, [projectId]);

  useEffect(() => {
    if (files.length > 0) {
      // Organize files into a tree structure
      const organized = organizeFiles(files);
      setTreeFiles(organized);
      
      // If no file is selected, select the App.js file
      if (!currentFile) {
        const appJsFile = files.find(
          (file) => file.name === 'App.js' && file.type === 'file'
        );
        if (appJsFile) {
          getFile(appJsFile._id);
        }
      }
    }
    // eslint-disable-next-line
  }, [files]);

  useEffect(() => {
    if (error) {
      setAlertMessage({ message: error, severity: 'error' });
      setShowAlert(true);
      clearError();
    }
  }, [error, clearError]);

  const handleSelectFile = (file) => {
    if (file.type === 'file') {
      getFile(file._id);
    } else if (file.type === 'folder') {
      // Remember the selected folder for file creation
      setActiveFolder(file);
    }
  };

  const handleCreateFile = async (parentId, type, name) => {
    // If parentId is null, use the active folder if available
    if (parentId === null && activeFolder) {
      parentId = activeFolder._id;
    }
    
    // If name is provided, create the file directly (inline creation)
    if (name) {
      const result = await createFile({
        name,
        type,
        content: type === 'file' ? '' : undefined,
        parentId,
        projectId,
      });

      if (result.success) {
        // Refresh file list
        getProjectFiles(projectId);
        if (type === 'file') {
          getFile(result.file._id);
        }
        setAlertMessage({
          message: `${type === 'file' ? 'File' : 'Folder'} created successfully!`,
          severity: 'success',
        });
        setShowAlert(true);
      }
      return;
    }
    
    // Otherwise use the dialog approach (for backward compatibility)
    setSelectedParentId(parentId);
    setSelectedFileType(type);
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
  };

  const handleCreateDialogSubmit = async (fileData) => {
    const result = await createFile({
      name: fileData.name,
      type: fileData.type,
      content: fileData.type === 'file' ? '' : undefined,
      parentId: selectedParentId,
      projectId,
    });

    if (result.success) {
      // Refresh file list
      getProjectFiles(projectId);
      if (fileData.type === 'file') {
        getFile(result.file._id);
      }
      setAlertMessage({
        message: `${fileData.type === 'file' ? 'File' : 'Folder'} created successfully!`,
        severity: 'success',
      });
      setShowAlert(true);
    }
    setCreateDialogOpen(false);
  };

  const handleRenameFile = async (fileId, newName) => {
    // If newName is provided, this is coming from inline renaming
    if (newName) {
      const result = await updateFile(fileId, {
        name: newName,
      });

      if (result.success) {
        // Refresh file list
        getProjectFiles(projectId);
        setAlertMessage({
          message: 'Renamed successfully!',
          severity: 'success',
        });
        setShowAlert(true);
      }
      return;
    }

    // Otherwise use the dialog approach (for backward compatibility)
    const fileToRename = files.find(f => f._id === fileId);
    if (fileToRename) {
      setFileToRename(fileToRename);
      setRenameDialogOpen(true);
    }
  };

  const handleRenameDialogClose = () => {
    setRenameDialogOpen(false);
    setFileToRename(null);
  };

  const handleRenameDialogSubmit = async (fileData) => {
    if (!fileToRename) return;

    const result = await updateFile(fileToRename._id, {
      name: fileData.name,
    });

    if (result.success) {
      // Refresh file list
      getProjectFiles(projectId);
      setAlertMessage({
        message: 'Renamed successfully!',
        severity: 'success',
      });
      setShowAlert(true);
    }
    setRenameDialogOpen(false);
    setFileToRename(null);
  };

  const handleDeleteFile = async (file) => {
    if (window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      const result = await deleteFile(file._id);
      if (result.success) {
        // Refresh file list
        getProjectFiles(projectId);
        setAlertMessage({
          message: 'Deleted successfully!',
          severity: 'success',
        });
        setShowAlert(true);
        
        // If the deleted file was the current file, clear the selection
        if (currentFile && currentFile._id === file._id) {
          // Try to select App.js or the first file available
          const appJsFile = files.find(
            (f) => f.name === 'App.js' && f.type === 'file' && f._id !== file._id
          );
          if (appJsFile) {
            getFile(appJsFile._id);
          } else {
            const firstFile = files.find((f) => f.type === 'file' && f._id !== file._id);
            if (firstFile) {
              getFile(firstFile._id);
            }
          }
        }
      }
    }
  };

  const handleCodeChange = async (fileId, newContent) => {
    await updateFile(fileId, { content: newContent });
  };

  if (projectLoading || filesLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentProject) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Paper sx={{ p: 3, maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Project not found
          </Typography>
          <Typography paragraph>
            The project you're looking for doesn't exist or you don't have permission to access it.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="app-container">
      <Header title={`${currentProject.name} - CipherStudio`} />
      
      {showAlert && (
        <Alert
          severity={alertMessage.severity}
          sx={{ mb: 0 }}
          onClose={() => setShowAlert(false)}
        >
          {alertMessage.message}
        </Alert>
      )}
      
      <Box className="ide-container">
        <FileExplorer
          files={treeFiles}
          currentFileId={currentFile?._id}
          activeFolderId={activeFolder?._id}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onRenameFile={handleRenameFile}
          onDeleteFile={handleDeleteFile}
        />
        
        <CodeEditor
          currentFile={currentFile}
          onCodeChange={handleCodeChange}
        />
        
        <PreviewPanel
          files={files}
          rootFiles={rootFiles}
          key={`${files.length}-${currentFile ? currentFile._id : 'none'}-${currentFile ? (currentFile.updatedAt || Date.now()) : Date.now()}`} 
          // Force re-render when files change or current file is updated
        />
      </Box>

      <FileDialog
        open={createDialogOpen}
        onClose={handleCreateDialogClose}
        onSubmit={handleCreateDialogSubmit}
        title={`Create New ${selectedFileType === 'file' ? 'File' : 'Folder'}`}
        type={selectedFileType}
        allowTypeChange={true}
      />

      <FileDialog
        open={renameDialogOpen}
        onClose={handleRenameDialogClose}
        onSubmit={handleRenameDialogSubmit}
        title="Rename"
        type={fileToRename?.type || 'file'}
        initialName={fileToRename?.name || ''}
      />
    </Box>
  );
};

const IDEWithProviders = () => (
  <ProjectProvider>
    <FileProvider>
      <IDE />
    </FileProvider>
  </ProjectProvider>
);

export default IDEWithProviders;