import React, { useCallback, useRef, useState, useEffect } from 'react';
import Editor from "@monaco-editor/react";
import { 
  Box, 
  Paper, 
  IconButton, 
  Chip, 
  CircularProgress,
  Tooltip,
  useTheme as useMuiTheme 
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useTheme } from '../context/ThemeContext';

const CodeEditor = ({ currentFile, onCodeChange }) => {
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const debounceTimeout = useRef(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved', 'error'
  const [pendingContent, setPendingContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Debounce editor changes to avoid too many updates
  const handleEditorChange = useCallback((value) => {
    if (onCodeChange && currentFile) {
      setPendingContent(value);
      setHasUnsavedChanges(true);
      setSaveStatus('unsaved');
      
      // Clear any existing timeout
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      
      // Set a new timeout
      debounceTimeout.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          await onCodeChange(currentFile._id, value);
          setSaveStatus('saved');
          setHasUnsavedChanges(false);
          setTimeout(() => {
            if (saveStatus === 'saved') setSaveStatus('saved');
          }, 2000); // Keep 'saved' status for 2 seconds
        } catch (error) {
          setSaveStatus('error');
          console.error('Auto-save failed:', error);
        }
      }, 500); // 500ms debounce
    }
  }, [currentFile, onCodeChange, saveStatus]);

  // Manual save function
  const handleManualSave = useCallback(async () => {
    if (onCodeChange && currentFile && hasUnsavedChanges) {
      // Clear any pending auto-save
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      
      setSaveStatus('saving');
      try {
        await onCodeChange(currentFile._id, pendingContent);
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveStatus('saved'), 2000);
      } catch (error) {
        setSaveStatus('error');
        console.error('Manual save failed:', error);
      }
    }
  }, [currentFile, onCodeChange, hasUnsavedChanges, pendingContent]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleManualSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave]);

  // Reset save status when file changes
  useEffect(() => {
    setSaveStatus('saved');
    setHasUnsavedChanges(false);
    setPendingContent(currentFile?.content || '');
  }, [currentFile]);

  if (!currentFile) {
    return (
      <Box className="editor-container" sx={{ p: 2 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          Select or create a file to edit
        </Paper>
      </Box>
    );
  }

  // Get save status display
  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <Chip
            icon={<CircularProgress size={16} />}
            label="Saving..."
            size="small"
            color="warning"
            variant="outlined"
          />
        );
      case 'saved':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Saved"
            size="small"
            color="success"
            variant="outlined"
          />
        );
      case 'unsaved':
        return (
          <Chip
            label="Unsaved changes"
            size="small"
            color="warning"
            variant="outlined"
          />
        );
      case 'error':
        return (
          <Chip
            icon={<ErrorIcon />}
            label="Save failed"
            size="small"
            color="error"
            variant="outlined"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box className="editor-container">
      <Box sx={{ 
        p: 1, 
        borderBottom: 1, 
        borderColor: 'divider', 
        bgcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
        fontWeight: 'medium',
        fontSize: '0.875rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{currentFile.name} - Editor</span>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getSaveStatusDisplay()}
          
          <Tooltip title={`Save (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+S)`}>
            <span>
              <IconButton 
                size="small" 
                onClick={handleManualSave}
                disabled={!hasUnsavedChanges || saveStatus === 'saving'}
                sx={{ 
                  opacity: hasUnsavedChanges ? 1 : 0.5,
                  color: hasUnsavedChanges ? 'primary.main' : 'text.secondary'
                }}
              >
                <SaveIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
      {currentFile.type === 'file' && (
        <Box sx={{ flex: 1, height: 'calc(100% - 36px)' }}>
          <Editor
            height="100%"
            width="100%"
            language={getLanguageFromFileName(currentFile.name)}
            value={currentFile.content}
            onChange={handleEditorChange}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        </Box>
      )}
    </Box>
  );
};

// Helper function to determine language from file extension
const getLanguageFromFileName = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
  };
  
  return languageMap[extension] || 'javascript';
};

export default CodeEditor;