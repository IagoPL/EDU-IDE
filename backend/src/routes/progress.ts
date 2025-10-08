import { Router } from 'express';
import { ProgressService } from '../services/ProgressService';

const router = Router();
const progressService = new ProgressService();

// Obtener progreso de usuario
router.get('/user/:userId?', (req, res) => {
  try {
    const userId = req.params.userId || 'default';
    const progress = progressService.getUserProgress(userId);
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obtener estadísticas
router.get('/stats/:userId?', (req, res) => {
  try {
    const userId = req.params.userId || 'default';
    const stats = progressService.getStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obtener achievements desbloqueados
router.get('/achievements/unlocked/:userId?', (req, res) => {
  try {
    const userId = req.params.userId || 'default';
    const achievements = progressService.getUnlockedAchievements(userId);
    
    res.json({
      success: true,
      data: { achievements }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obtener achievements pendientes
router.get('/achievements/pending/:userId?', (req, res) => {
  try {
    const userId = req.params.userId || 'default';
    const achievements = progressService.getPendingAchievements(userId);
    
    res.json({
      success: true,
      data: { achievements }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obtener progreso por lenguaje
router.get('/languages/:userId?', (req, res) => {
  try {
    const userId = req.params.userId || 'default';
    const languages = progressService.getLanguageProgress(userId);
    
    res.json({
      success: true,
      data: { languages }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Registrar líneas escritas
router.post('/track/lines', (req, res) => {
  try {
    const { userId = 'default', language, lines } = req.body;
    
    if (!language || lines === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Language and lines are required'
      });
    }
    
    const progress = progressService.trackLinesWritten(userId, language, lines);
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Registrar archivo creado
router.post('/track/file', (req, res) => {
  try {
    const { userId = 'default', language } = req.body;
    
    if (!language) {
      return res.status(400).json({
        success: false,
        error: 'Language is required'
      });
    }
    
    const progress = progressService.trackFileCreated(userId, language);
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Registrar evento (commit, test, debug)
router.post('/track/event', (req, res) => {
  try {
    const { userId = 'default', type, count = 1 } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Event type is required'
      });
    }
    
    const progress = progressService.trackEvent(userId, { type, count });
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

