import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Header from '../components/Header';
import ProjectDialog from '../components/ProjectDialog';
import { useProjects } from '../context/ProjectContext';
import { ProjectProvider } from '../context/ProjectContext';

const Dashboard = () => {
  const {
    projects,
    loading,
    error,
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    clearError,
  } = useProjects();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [alertMessage, setAlertMessage] = useState({ message: '', severity: 'success' });
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    getProjects();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (error) {
      setAlertMessage({ message: error, severity: 'error' });
      setShowAlert(true);
      clearError();
    }
  }, [error, clearError]);

  const handleCreateDialogOpen = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
  };

  const handleEditDialogOpen = (project) => {
    setCurrentProject(project);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setCurrentProject(null);
    setEditDialogOpen(false);
  };

  const handleCreateProject = async (projectData) => {
    const result = await createProject(projectData);
    if (result.success) {
      setAlertMessage({
        message: 'Project created successfully!',
        severity: 'success',
      });
      setShowAlert(true);
    }
    handleCreateDialogClose();
  };

  const handleUpdateProject = async (projectData) => {
    if (!currentProject) return;
    
    const result = await updateProject(currentProject._id, projectData);
    if (result.success) {
      setAlertMessage({
        message: 'Project updated successfully!',
        severity: 'success',
      });
      setShowAlert(true);
    }
    handleEditDialogClose();
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const result = await deleteProject(projectId);
      if (result.success) {
        setAlertMessage({
          message: 'Project deleted successfully!',
          severity: 'success',
        });
        setShowAlert(true);
      }
    }
  };

  return (
    <Box className="app-container">
      <Header />
      
      {/* Background Watermark */}
      <div className="dashboard-watermark">
        CipherStudio
      </div>
      
      <Box className="dashboard-container" sx={{ p: 3 }}>
        {showAlert && (
          <Alert
            severity={alertMessage.severity}
            sx={{ mb: 2 }}
            onClose={() => setShowAlert(false)}
          >
            {alertMessage.message}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Projects
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
          >
            New Project
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : projects.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '50vh',
            }}
          >
            <Typography variant="h6" gutterBottom>
              No projects yet
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateDialogOpen}
            >
              Create your first project
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2">
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.description || 'No description'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last modified:{' '}
                      {new Date(project.lastModified).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={Link}
                      to={`/project/${project._id}`}
                    >
                      Open
                    </Button>
                    <Box sx={{ ml: 'auto' }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditDialogOpen(project)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteProject(project._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <ProjectDialog
        open={createDialogOpen}
        onClose={handleCreateDialogClose}
        onSubmit={handleCreateProject}
        title="Create New Project"
      />

      <ProjectDialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        onSubmit={handleUpdateProject}
        title="Edit Project"
        initialName={currentProject?.name || ''}
        initialDescription={currentProject?.description || ''}
      />
    </Box>
  );
};

const DashboardWithProvider = () => (
  <ProjectProvider>
    <Dashboard />
  </ProjectProvider>
);

export default DashboardWithProvider;