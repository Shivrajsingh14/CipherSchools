import React, { useState } from 'react';
import { Sandpack } from "@codesandbox/sandpack-react";
import { Box, Paper, IconButton, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import TabletIcon from '@mui/icons-material/Tablet';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { useTheme } from '../context/ThemeContext';

function formatFilesForSandpack(allFiles, rootFiles) {
  const sandpackFiles = {};
  
  // Create maps for easier lookups
  const fileMap = {};
  const folderMap = {};
  
  // Separate files and folders
  allFiles.forEach(file => {
    fileMap[file._id] = file;
    if (file.type === 'folder') {
      folderMap[file._id] = file;
    }
  });
  
  // PHASE 1: Build full folder structure first
  const getFolderPath = (folderId) => {
    if (!folderId || !folderMap[folderId]) return '';
    
    const folder = folderMap[folderId];
    if (folder.parentId === null) {
      return `/${folder.name}`;
    } else {
      const parentPath = getFolderPath(folder.parentId);
      return `${parentPath}/${folder.name}`;
    }
  };
  
  // Build a map of folder IDs to their full paths
  const folderPathMap = {};
  Object.keys(folderMap).forEach(folderId => {
    folderPathMap[folderId] = getFolderPath(folderId);
  });
  
  // PHASE 2: Map files to their full paths
  const filePathMap = {};
  allFiles.forEach(file => {
    if (file.type === 'file') {
      if (file.parentId === null) {
        // Root level file
        filePathMap[file._id] = `/${file.name}`;
      } else {
        // File in a folder
        const parentPath = folderPathMap[file.parentId] || '';
        filePathMap[file._id] = `${parentPath}/${file.name}`;
      }
    }
  });
  
  // Find the src folder for correct relative imports
  let srcFolderId = null;
  Object.keys(folderMap).forEach(folderId => {
    const folder = folderMap[folderId];
    if (folder.name === 'src' && (!folder.parentId || folder.parentId === null)) {
      srcFolderId = folderId;
    }
  });
  
  // Find App.js file ID (to set it as active)
  let appJsId = null;
  for (const file of allFiles) {
    if (file.name === 'App.js' && file.type === 'file') {
      // Check if in src folder
      const path = filePathMap[file._id] || '';
      if (path.includes('/src/')) {
        appJsId = file._id;
        break;
      }
    }
  }
  
  // Create essential React files if missing
  let hasIndexHtml = false;
  let hasIndexJs = false;
  
  // Helper for processing imports and adding required files
  const processImports = (fileContent, filePath) => {
    let modifiedContent = fileContent;
    
    // Extract imports
    const importRegex = /import\s+(?:(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(fileContent)) !== null) {
      const importPath = match[1];
      
      // Only process relative imports
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        // Convert relative import path to absolute path based on current file's location
        const currentDir = filePath.substring(0, filePath.lastIndexOf('/'));
        let absoluteImportPath = resolveRelativePath(currentDir, importPath);
        
        // Add .js extension if missing
        if (!absoluteImportPath.endsWith('.js') && !absoluteImportPath.endsWith('.jsx')) {
          absoluteImportPath += '.js';
        }
        
        // Check if the imported file exists in our files
        const importedFileId = Object.keys(filePathMap).find(id => 
          filePathMap[id] === absoluteImportPath
        );
        
        // If the import exists and isn't already in sandpackFiles, add it
        if (importedFileId && !sandpackFiles[absoluteImportPath.slice(1)]) {
          const importedFile = fileMap[importedFileId];
          if (importedFile && importedFile.content) {
            const normalizedPath = absoluteImportPath.startsWith('/') ? 
              absoluteImportPath.slice(1) : absoluteImportPath;
            
            sandpackFiles[normalizedPath] = {
              code: importedFile.content,
              active: false
            };
            
            // Recursively process imports in the imported file
            processImports(importedFile.content, absoluteImportPath);
          }
        }
      }
    }
    
    return modifiedContent;
  };
  
  // Helper to resolve relative paths
  const resolveRelativePath = (base, relative) => {
    const stack = base.split('/');
    stack.pop(); // Remove the file name
    
    const parts = relative.split('/');
    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') stack.pop();
      else stack.push(part);
    }
    
    return '/' + stack.join('/');
  };
  
  // Add essential files first
  allFiles.forEach(file => {
    if (file.type === 'file') {
      const path = filePathMap[file._id];
      
      if (path) {
        const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
        
        // Check if this is one of our essential files
        if (normalizedPath === 'index.html') hasIndexHtml = true;
        if (normalizedPath === 'src/index.js') hasIndexJs = true;
        
        // Add to sandpack files
        sandpackFiles[normalizedPath] = {
          code: file.content || '',
          active: file._id === appJsId
        };
      }
    }
  });
  
  // Process imports for each file to ensure dependencies are included
  Object.keys(sandpackFiles).forEach(path => {
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    processImports(sandpackFiles[path].code, fullPath);
  });
  
  // Add default index.html if missing
  if (!hasIndexHtml) {
    sandpackFiles['index.html'] = {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CipherSchools React App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      active: false
    };
  }
  
  // Add default index.js if missing
  if (!hasIndexJs) {
    sandpackFiles['src/index.js'] = {
      code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      active: false
    };
  }
  
  // Ensure App.js is included
  if (!appJsId && !sandpackFiles['src/App.js']) {
    sandpackFiles['src/App.js'] = {
      code: `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Welcome to CipherSchools</h1>
      <p>Start editing to see some magic happen!</p>
    </div>
  );
}

export default App;`,
      active: true
    };
  }
  
  console.log('File Path Map:', filePathMap);
  return sandpackFiles;
}

const PreviewPanel = ({ files, rootFiles }) => {
  const { theme } = useTheme();
  const [refreshKey, setRefreshKey] = useState(0); // To force refresh
  const [error, setError] = useState(null);
  const [deviceView, setDeviceView] = useState('desktop'); // desktop, tablet, mobile

  // Device viewport configurations
  const deviceConfigs = {
    desktop: {
      width: '100%',
      height: '100%',
      label: 'Desktop',
      icon: DesktopWindowsIcon
    },
    tablet: {
      width: '768px',
      height: '1024px',
      label: 'Tablet',
      icon: TabletIcon
    },
    mobile: {
      width: '375px',
      height: '667px',
      label: 'Mobile',
      icon: PhoneAndroidIcon
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setError(null);
    setRefreshKey(prev => prev + 1);
  };

  // Handle device view change
  const handleDeviceChange = (event, newDevice) => {
    if (newDevice !== null) {
      setDeviceView(newDevice);
    }
  };

  if (!files || !rootFiles) {
    return (
      <Box className="preview-container" sx={{ p: 2 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          No files to preview
        </Paper>
      </Box>
    );
  }

  // Format files for Sandpack
  let sandpackFiles = {};
  try {
    sandpackFiles = formatFilesForSandpack(files, rootFiles);
    if (Object.keys(sandpackFiles).length === 0) {
      throw new Error("No valid files found for preview");
    }
  } catch (err) {
    console.error("Error formatting files for preview:", err);
    setError(err.message || "Error preparing files for preview");
    
    // Set default files to show error
    sandpackFiles = {
      "/App.js": {
        code: `export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ color: "red" }}>Preview Error</h1>
      <p>There was an error preparing files for preview.</p>
      <p>Try refreshing the preview or check your file structure.</p>
    </div>
  );
}`,
        active: true
      },
      "/index.js": {
        code: `import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

ReactDOM.render(<App />, document.getElementById("root"));`,
        active: false
      }
    };
  }

  // Add console debug to check files
  console.log('Sandpack Files:', sandpackFiles);
  
  return (
    <Box 
      className="preview-container"
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}
    >
      <Box sx={{ 
        p: 1, 
        borderBottom: 1, 
        borderColor: 'divider', 
        bgcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
        fontWeight: 'medium',
        fontSize: '0.875rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        gap: 1
      }}>
        <span>
          Live Preview
          {error && (
            <span style={{ 
              color: 'red', 
              marginLeft: '8px', 
              fontSize: '0.8rem' 
            }}>
              (Error: {error})
            </span>
          )}
        </span>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ToggleButtonGroup
            value={deviceView}
            exclusive
            onChange={handleDeviceChange}
            aria-label="device view"
            size="small"
          >
            {Object.entries(deviceConfigs).map(([key, config]) => {
              const IconComponent = config.icon;
              return (
                <ToggleButton value={key} key={key} aria-label={config.label}>
                  <Tooltip title={config.label}>
                    <IconComponent fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
          
          <IconButton 
            size="small" 
            onClick={handleRefresh}
            title="Refresh preview"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: deviceView === 'desktop' ? 'stretch' : 'center',
        justifyContent: deviceView === 'desktop' ? 'stretch' : 'flex-start',
        bgcolor: deviceView !== 'desktop' ? (theme === 'dark' ? '#2c2c2c' : '#f5f5f5') : 'transparent',
        p: deviceView !== 'desktop' ? 2 : 0
      }}>
        <Box
          sx={{
            width: deviceConfigs[deviceView].width,
            height: deviceView === 'desktop' ? '100%' : deviceConfigs[deviceView].height,
            maxWidth: deviceView === 'desktop' ? '100%' : deviceConfigs[deviceView].width,
            maxHeight: deviceView === 'desktop' ? '100%' : deviceConfigs[deviceView].height,
            border: deviceView !== 'desktop' ? '8px solid #333' : 'none',
            borderRadius: deviceView === 'mobile' ? '25px' : deviceView === 'tablet' ? '12px' : '0',
            overflow: 'hidden',
            boxShadow: deviceView !== 'desktop' ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
            position: 'relative',
            bgcolor: 'white'
          }}
        >
          <Sandpack
            key={`${refreshKey}-${deviceView}`} // Force re-render on refresh or device change
            template="react"
            files={sandpackFiles}
            theme={theme === 'dark' ? 'dark' : 'light'}
            options={{
              showNavigator: false,
              showTabs: false,
              editorHeight: '100%',
              editorWidthPercentage: 0,
              showLineNumbers: false,
              showInlineErrors: true,
              recompileMode: "immediate",
              recompileDelay: 300,
              autorun: true,
              layout: 'preview',
            }}
            customSetup={{
              dependencies: {
                "react": "^18.2.0",
                "react-dom": "^18.2.0"
              }
            }}
            style={{
              height: '100%',
              width: '100%',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PreviewPanel;