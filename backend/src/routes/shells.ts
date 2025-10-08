import { Router } from 'express';
import { ShellDetectionService } from '../services/ShellDetectionService';

const router = Router();
const shellDetectionService = new ShellDetectionService();

// Detectar shells disponibles
router.get('/available', async (req, res) => {
  try {
    const shells = await shellDetectionService.detectAvailableShells();
    
    res.json({
      success: true,
      data: { shells }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obtener shell por defecto
router.get('/default', (req, res) => {
  try {
    const defaultShell = shellDetectionService.getDefaultShell();
    
    res.json({
      success: true,
      data: { shell: defaultShell }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obtener shell por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const shell = shellDetectionService.getShellById(id);
    
    if (!shell) {
      return res.status(404).json({
        success: false,
        error: 'Shell not found'
      });
    }
    
    res.json({
      success: true,
      data: { shell }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obtener comandos comunes para autocompletado
router.get('/:id/commands', (req, res) => {
  try {
    const { id } = req.params;
    const commands = shellDetectionService.getCommonCommands(id);
    
    res.json({
      success: true,
      data: { commands }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obtener snippets de comandos
router.get('/:id/snippets', (req, res) => {
  try {
    const { id } = req.params;
    const snippets = shellDetectionService.getCommandSnippets(id);
    
    res.json({
      success: true,
      data: { snippets }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

