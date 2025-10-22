import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const ProjectContext = createContext();

export const useProjects = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get all projects
  const getProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching projects');
      setLoading(false);
    }
  };

  // Get a single project
  const getProject = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      setCurrentProject(res.data.data);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError('Error fetching project');
      setLoading(false);
      return null;
    }
  };

  // Create a new project
  const createProject = async (projectData) => {
    try {
      const res = await api.post('/projects', projectData);
      setProjects([...projects, res.data.data]);
      return { success: true, project: res.data.data };
    } catch (err) {
      setError('Error creating project');
      return { success: false, error: err.response && err.response.data.error };
    }
  };

  // Update a project
  const updateProject = async (id, projectData) => {
    try {
      const res = await api.put(`/projects/${id}`, projectData);
      setProjects(
        projects.map((project) =>
          project._id === id ? res.data.data : project
        )
      );
      return { success: true, project: res.data.data };
    } catch (err) {
      setError('Error updating project');
      return { success: false, error: err.response && err.response.data.error };
    }
  };

  // Delete a project
  const deleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((project) => project._id !== id));
      return { success: true };
    } catch (err) {
      setError('Error deleting project');
      return { success: false, error: err.response && err.response.data.error };
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        loading,
        error,
        getProjects,
        getProject,
        createProject,
        updateProject,
        deleteProject,
        setCurrentProject,
        clearError,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};