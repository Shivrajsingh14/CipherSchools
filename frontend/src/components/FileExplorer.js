import React, { useState, useRef, useEffect } from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { useTheme } from '../context/ThemeContext';

  const FileTreeItem = ({
  file,
  depth = 0,
  onSelect,
  currentFileId,
  activeFolderId,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  newItemData,
  onNewItemCreate,
  onNewItemCancel,
  fileBeingRenamed,
  onRenameSubmit,
  onRenameCancel,
}) => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(file._id === activeFolderId);
  const [anchorEl, setAnchorEl] = useState(null);
  const isFolder = file.type === 'folder';
  const isSelected = currentFileId === file._id;
  const isActiveFolder = activeFolderId === file._id;
  const hasChildren = isFolder && file.children && file.children.length > 0;
  const isNewItemParent = newItemData && newItemData.parentId === file._id;
  const isBeingRenamed = fileBeingRenamed === file._id;
  
  // Auto-open folder when it becomes active
  useEffect(() => {
    if (isActiveFolder && isFolder) {
      setOpen(true);
    }
  }, [isActiveFolder, isFolder]);  const handleClick = () => {
    if (isFolder) {
      setOpen(!open);
    }
    onSelect(file);
  };

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  const handleCreateFile = (type) => (event) => {
    event.stopPropagation();
    handleMenuClose();
    onCreateFile(file._id, type);
    if (isFolder && !open) {
      setOpen(true); // Open the folder when creating a new item inside it
    }
  };

  const handleRenameFile = (event) => {
    event.stopPropagation();
    handleMenuClose();
    onRenameFile(file._id);
  };

  const handleDeleteFile = (event) => {
    event.stopPropagation();
    handleMenuClose();
    onDeleteFile(file);
  };

  return (
    <>
      {isBeingRenamed ? (
        <Box 
          sx={{ 
            pl: depth * 2 + 1, 
            pr: 1,
            py: 0.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {isFolder ? <FolderIcon color="primary" /> : <InsertDriveFileIcon />}
          </ListItemIcon>
          <NewItemInput
            depth={0}
            type={file.type}
            initialValue={file.name}
            onSubmit={(name) => onRenameSubmit(file._id, name)}
            onCancel={onRenameCancel}
          />
        </Box>
      ) : (
        <ListItemButton
          onClick={handleClick}
          sx={{
            pl: depth * 2 + 1,
            backgroundColor: isSelected || (isActiveFolder && isFolder)
              ? theme === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.05)'
              : 'transparent',
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {isFolder ? <FolderIcon color="primary" /> : <InsertDriveFileIcon />}
          </ListItemIcon>
          <ListItemText primary={file.name} />
          {isFolder && hasChildren && (open ? <ExpandLess /> : <ExpandMore />)}
          <Box onClick={(e) => e.stopPropagation()}>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </ListItemButton>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {isFolder && (
          [
            <MenuItem key="new-file" onClick={handleCreateFile('file')}>
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>New File</ListItemText>
            </MenuItem>,
            <MenuItem key="new-folder" onClick={handleCreateFile('folder')}>
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>New Folder</ListItemText>
            </MenuItem>
          ]
        )}
        <MenuItem onClick={handleRenameFile}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteFile}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {isFolder && (open || isNewItemParent) && (
        <Collapse in={true} timeout="auto">
          <List component="div" disablePadding>
            {hasChildren && file.children.map((childFile) => (
              <FileTreeItem
                key={childFile._id}
                file={childFile}
                depth={depth + 1}
                onSelect={onSelect}
                currentFileId={currentFileId}
                activeFolderId={activeFolderId}
                onCreateFile={onCreateFile}
                onRenameFile={onRenameFile}
                onDeleteFile={onDeleteFile}
                newItemData={newItemData}
                onNewItemCreate={onNewItemCreate}
                onNewItemCancel={onNewItemCancel}
                fileBeingRenamed={fileBeingRenamed}
                onRenameSubmit={onRenameSubmit}
                onRenameCancel={onRenameCancel}
              />
            ))}
            
            {isNewItemParent && (
              <NewItemInput 
                depth={depth + 1} 
                type={newItemData.type} 
                onSubmit={(name) => onNewItemCreate(file._id, newItemData.type, name)}
                onCancel={onNewItemCancel}
              />
            )}
          </List>
        </Collapse>
      )}
    </>
  );
};

// Component for creating new files/folders
const NewItemInput = ({ depth, type, initialValue = '', onSubmit, onCancel }) => {
  const { theme } = useTheme();
  const [name, setName] = useState(initialValue);
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && name.trim()) {
      onSubmit(name.trim());
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <Box 
      sx={{ 
        pl: depth * 2 + 1, 
        pr: 1, 
        py: 0.5,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <ListItemIcon sx={{ minWidth: 36 }}>
        {type === 'folder' ? <FolderIcon color="primary" /> : <InsertDriveFileIcon />}
      </ListItemIcon>
      <TextField
        inputRef={inputRef}
        size="small"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Enter ${type} name...`}
        sx={{ 
          '& .MuiOutlinedInput-root': {
            fontSize: '0.875rem',
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton 
                size="small" 
                onClick={handleSubmit}
                disabled={!name.trim()}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={onCancel}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

const FileExplorer = ({
  files,
  currentFileId,
  activeFolderId,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
}) => {
  const { theme } = useTheme();
  const [newItemData, setNewItemData] = useState(null);
  const [fileBeingRenamed, setFileBeingRenamed] = useState(null);

  const handleCreateFile = (parentId, type) => {
    // If creating from the top toolbar and an active folder is selected, use that folder
    if (parentId === null && activeFolderId) {
      parentId = activeFolderId;
    }
    
    setNewItemData({
      parentId,
      type,
    });
  };

  const handleNewItemCreate = async (parentId, type, name) => {
    // Call the actual creation function
    await onCreateFile(parentId, type, name);
    setNewItemData(null); // Clear new item data
  };

  const handleNewItemCancel = () => {
    setNewItemData(null);
  };
  
  const handleStartRenaming = (fileId) => {
    setFileBeingRenamed(fileId);
  };
  
  const handleRenameSubmit = (fileId, newName) => {
    onRenameFile(fileId, newName);
    setFileBeingRenamed(null);
  };
  
  const handleRenameCancel = () => {
    setFileBeingRenamed(null);
  };

  return (
    <Box className="file-explorer">
      <Box sx={{ 
        p: 1, 
        borderBottom: 1, 
        borderColor: 'divider', 
        bgcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 'medium',
            fontSize: '0.875rem'
          }}
        >
          Files
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton
            size="small"
            onClick={() => handleCreateFile(null, 'file')}
            title="New File"
          >
            <InsertDriveFileIcon fontSize="small" />
            <AddIcon fontSize="small" sx={{ position: 'absolute', right: -4, bottom: -4 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleCreateFile(null, 'folder')}
            title="New Folder"
          >
            <FolderIcon fontSize="small" />
            <AddIcon fontSize="small" sx={{ position: 'absolute', right: -4, bottom: -4 }} />
          </IconButton>
        </Box>
      </Box>
      <List component="nav" aria-label="file explorer">
        {files.map((file) => (
          <FileTreeItem
            key={file._id}
            file={file}
            onSelect={onSelectFile}
            currentFileId={currentFileId}
            activeFolderId={activeFolderId}
            onCreateFile={handleCreateFile}
            onRenameFile={handleStartRenaming}
            onDeleteFile={onDeleteFile}
            newItemData={newItemData}
            onNewItemCreate={handleNewItemCreate}
            onNewItemCancel={handleNewItemCancel}
            fileBeingRenamed={fileBeingRenamed}
            onRenameSubmit={handleRenameSubmit}
            onRenameCancel={handleRenameCancel}
          />
        ))}
        {newItemData && newItemData.parentId === null && (
          <NewItemInput 
            depth={0} 
            type={newItemData.type} 
            onSubmit={(name) => handleNewItemCreate(null, newItemData.type, name)}
            onCancel={handleNewItemCancel}
          />
        )}
      </List>
    </Box>
  );
};

export default FileExplorer;