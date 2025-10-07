import { Router } from 'express';
import { TerminalService } from '../services/TerminalService';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();
const terminalService = new TerminalService(path.join(__dirname, '../../workspace'));

// Ejecutar comando
router.post('/execute', async (req, res) => {
  try {
    const { command, sessionId = 'default' } = req.body;

    if (!command) {
      return res.status(400).json({ success: false, error: 'Command is required' });
    }

    const result = await terminalService.executeCommand(sessionId, command);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Ejecutar código
router.post('/execute-code', async (req, res) => {
  try {
    const { code, language, filename } = req.body;

    if (!code || !language) {
      return res.status(400).json({ success: false, error: 'Code and language are required' });
    }

    const result = await terminalService.executeCode(language, code, filename);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Instalar dependencias
router.post('/install-dependencies', async (req, res) => {
  try {
    const { projectPath, packageManager } = req.body;

    if (!projectPath) {
      return res.status(400).json({ success: false, error: 'Project path is required' });
    }

    // Detectar package manager si no se especifica
    let pm = packageManager;
    if (!pm) {
      pm = await terminalService.detectPackageManager(projectPath);
      if (!pm) {
        return res.status(400).json({ success: false, error: 'Could not detect package manager' });
      }
    }

    const result = await terminalService.installDependencies(projectPath, pm);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Detectar package manager
router.get('/detect-package-manager', async (req, res) => {
  try {
    const projectPath = req.query.path as string || path.join(__dirname, '../../workspace');
    const packageManager = await terminalService.detectPackageManager(projectPath);
    
    res.json({ success: true, data: { packageManager } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
