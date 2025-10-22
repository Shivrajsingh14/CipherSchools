import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';

const FileDialog = ({
  open,
  onClose,
  onSubmit,
  title,
  type,
  initialName = '',
  allowTypeChange = false,
}) => {
  const [name, setName] = useState(initialName);
  const [fileType, setFileType] = useState(type || 'file');
  const [error, setError] = useState('');

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (error) setError('');
  };

  const handleTypeChange = (e) => {
    setFileType(e.target.value);
  };

  const handleSubmit = () => {
    // Validate name
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    // For files, enforce file extension
    if (fileType === 'file' && !name.includes('.')) {
      setName(`${name}.js`);
    }

    onSubmit({
      name: fileType === 'file' && !name.includes('.') ? `${name}.js` : name,
      type: fileType,
    });

    // Reset form
    setName('');
    setError('');
  };

  const handleClose = () => {
    setName(initialName);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={handleNameChange}
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
        />
        
        {allowTypeChange && (
          <FormControl component="fieldset">
            <FormLabel component="legend">Type</FormLabel>
            <RadioGroup
              row
              name="type"
              value={fileType}
              onChange={handleTypeChange}
            >
              <FormControlLabel value="file" control={<Radio />} label="File" />
              <FormControlLabel value="folder" control={<Radio />} label="Folder" />
            </RadioGroup>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileDialog;