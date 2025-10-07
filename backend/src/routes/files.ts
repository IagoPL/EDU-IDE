import { Router } from 'express';
import { FileSystemService } from '../services/FileSystemService';
import path from 'path';
import { existsSync } from 'fs';

const router = Router();
const fileSystemService = new FileSystemService();

// Obtener el árbol de archivos
router.get('/tree', async (req, res) => {
  try {
    const tree = await fileSystemService.getFileTree();
    res.json({ success: true, data: tree });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Leer un directorio específico
router.get('/directory', async (req, res) => {
  try {
    const dirPath = req.query.path as string || '';
    const files = await fileSystemService.readDirectory(dirPath);
    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Leer contenido de un archivo
router.get('/read', async (req, res) => {
  try {
    const filePath = req.query.path as string;
    
    if (!filePath) {
      return res.status(400).json({ success: false, error: 'File path is required' });
    }

    const content = await fileSystemService.readFile(filePath);
    res.json({ success: true, data: { path: filePath, content } });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Escribir contenido en un archivo
router.post('/write', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ success: false, error: 'File path is required' });
    }

    await fileSystemService.writeFile(filePath, content || '');
    res.json({ success: true, message: 'File saved successfully' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Crear un nuevo archivo
router.post('/create', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ success: false, error: 'File path is required' });
    }

    await fileSystemService.createFile(filePath, content || '');
    res.json({ success: true, message: 'File created successfully' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Crear un nuevo directorio
router.post('/create-directory', async (req, res) => {
  try {
    const { path: dirPath } = req.body;
    
    if (!dirPath) {
      return res.status(400).json({ success: false, error: 'Directory path is required' });
    }

    await fileSystemService.createDirectory(dirPath);
    res.json({ success: true, message: 'Directory created successfully' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Eliminar un archivo
router.delete('/delete', async (req, res) => {
  try {
    const filePath = req.query.path as string;
    
    if (!filePath) {
      return res.status(400).json({ success: false, error: 'File path is required' });
    }

    await fileSystemService.deleteFile(filePath);
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Eliminar un directorio
router.delete('/delete-directory', async (req, res) => {
  try {
    const dirPath = req.query.path as string;
    
    if (!dirPath) {
      return res.status(400).json({ success: false, error: 'Directory path is required' });
    }

    await fileSystemService.deleteDirectory(dirPath);
    res.json({ success: true, message: 'Directory deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Renombrar archivo o directorio
router.put('/rename', async (req, res) => {
  try {
    const { oldPath, newPath } = req.body;
    
    if (!oldPath || !newPath) {
      return res.status(400).json({ success: false, error: 'Both oldPath and newPath are required' });
    }

    await fileSystemService.renameFile(oldPath, newPath);
    res.json({ success: true, message: 'Renamed successfully' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Configurar workspace
router.post('/set-workspace', async (req, res) => {
  try {
    const { path: workspacePath } = req.body;
    
    if (!workspacePath) {
      return res.status(400).json({ success: false, error: 'Workspace path is required' });
    }

    fileSystemService.setWorkspace(workspacePath);
    res.json({ success: true, message: 'Workspace set successfully', path: workspacePath });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Obtener workspace actual
router.get('/workspace', (req, res) => {
  res.json({ success: true, data: { path: fileSystemService.getWorkspacePath() } });
});

// Cambiar workspace
router.post('/workspace', async (req, res) => {
  try {
    const { path: workspacePath } = req.body;
    
    if (!workspacePath) {
      return res.status(400).json({ success: false, error: 'Workspace path is required' });
    }

    // Verificar que la ruta existe
    if (!existsSync(workspacePath)) {
      return res.status(400).json({ success: false, error: 'Workspace path does not exist' });
    }

    // Verificar que es un directorio
    const stats = await import('fs/promises').then(fs => fs.stat(workspacePath));
    if (!stats.isDirectory()) {
      return res.status(400).json({ success: false, error: 'Path is not a directory' });
    }

    // Cambiar el workspace
    fileSystemService.setWorkspace(workspacePath);
    
    res.json({ 
      success: true, 
      data: { path: fileSystemService.getWorkspacePath() } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Validar si una ruta existe y es un directorio
router.post('/validate-path', async (req, res) => {
  try {
    const { path: dirPath } = req.body;
    
    if (!dirPath) {
      return res.status(400).json({ success: false, error: 'Path is required' });
    }

    if (!existsSync(dirPath)) {
      return res.json({ success: true, data: { valid: false, reason: 'Path does not exist' } });
    }

    const stats = await import('fs/promises').then(fs => fs.stat(dirPath));
    if (!stats.isDirectory()) {
      return res.json({ success: true, data: { valid: false, reason: 'Path is not a directory' } });
    }

    res.json({ success: true, data: { valid: true } });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;


