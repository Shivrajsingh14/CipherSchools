import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

const ProjectDialog = ({ open, onClose, onSubmit, title, initialName = '', initialDescription = '' }) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [nameError, setNameError] = useState('');

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (nameError) setNameError('');
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = () => {
    // Validate name
    if (!name.trim()) {
      setNameError('Name cannot be empty');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
    });

    // Reset form
    setName('');
    setDescription('');
    setNameError('');
  };

  const handleClose = () => {
    setName(initialName);
    setDescription(initialDescription);
    setNameError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Project Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={handleNameChange}
          error={!!nameError}
          helperText={nameError}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Description (optional)"
          type="text"
          fullWidth
          variant="outlined"
          value={description}
          onChange={handleDescriptionChange}
          multiline
          rows={4}
        />
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

export default ProjectDialog;