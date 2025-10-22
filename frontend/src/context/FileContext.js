import React, { createContext, useState, useContext } from 'react';
import api from '../utils/api';

const FileContext = createContext();

export const useFiles = () => useContext(FileContext);

export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all files for a project
  const getProjectFiles = async (projectId) => {
    try {
      setLoading(true);
      const res = await api.get(`/files/project/${projectId}`);
      setFiles(res.data.data);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError('Error fetching files');
      setLoading(false);
      return [];
    }
  };

  // Get files by parent folder
  const getFilesByParent = async (projectId, parentId = 'root') => {
    try {
      setLoading(true);
      const res = await api.get(`/files/${projectId}/${parentId}`);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError('Error fetching folder contents');
      setLoading(false);
      return [];
    }
  };

  // Get a single file
  const getFile = async (fileId) => {
    try {
      setLoading(true);
      const res = await api.get(`/files/${fileId}`);
      setCurrentFile(res.data.data);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError('Error fetching file');
      setLoading(false);
      return null;
    }
  };

  // Create a new file or folder
  const createFile = async (fileData) => {
    try {
      const res = await api.post('/files', fileData);
      setFiles([...files, res.data.data]);
      return { success: true, file: res.data.data };
    } catch (err) {
      setError('Error creating file');
      return { success: false, error: err.response && err.response.data.error };
    }
  };

  // Update a file
  const updateFile = async (id, fileData) => {
    try {
      // Add updatedAt timestamp to track changes for preview refresh
      const fileWithTimestamp = {
        ...fileData,
        updatedAt: new Date().toISOString()
      };
      
      const res = await api.put(`/files/${id}`, fileWithTimestamp);
      
      // Make sure timestamp is included in the updated file
      const updatedFile = {
        ...res.data.data,
        updatedAt: res.data.data.updatedAt || new Date().toISOString()
      };
      
      setFiles(files.map((file) => (file._id === id ? updatedFile : file)));
      if (currentFile && currentFile._id === id) {
        setCurrentFile(updatedFile);
      }
      return { success: true, file: updatedFile };
    } catch (err) {
      setError('Error updating file');
      return { success: false, error: err.response && err.response.data.error };
    }
  };

  // Delete a file or folder
  const deleteFile = async (id) => {
    try {
      await api.delete(`/files/${id}`);
      setFiles(files.filter((file) => file._id !== id));
      if (currentFile && currentFile._id === id) {
        setCurrentFile(null);
      }
      return { success: true };
    } catch (err) {
      setError('Error deleting file');
      return { success: false, error: err.response && err.response.data.error };
    }
  };

  // Organize files into a tree structure
  const organizeFiles = (fileList) => {
    if (!fileList || !fileList.length) return [];

    const fileMap = {};
    const rootFiles = [];

    // First pass: create a map of files by id
    fileList.forEach(file => {
      fileMap[file._id] = {
        ...file,
        children: []
      };
    });

    // Second pass: build the tree
    fileList.forEach(file => {
      if (file.parentId === null) {
        rootFiles.push(fileMap[file._id]);
      } else if (fileMap[file.parentId]) {
        fileMap[file.parentId].children.push(fileMap[file._id]);
      }
    });

    // Sort files: folders first, then alphabetically
    const sortFiles = (files) => {
      return files.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      }).map(file => {
        if (file.children && file.children.length > 0) {
          return {
            ...file,
            children: sortFiles(file.children)
          };
        }
        return file;
      });
    };

    return sortFiles(rootFiles);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <FileContext.Provider
      value={{
        files,
        currentFile,
        loading,
        error,
        getProjectFiles,
        getFilesByParent,
        getFile,
        createFile,
        updateFile,
        deleteFile,
        setCurrentFile,
        organizeFiles,
        clearError,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};