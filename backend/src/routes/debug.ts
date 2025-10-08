import { Router } from 'express';
import { DebugService } from '../services/DebugService';

const router = Router();
const debugService = new DebugService();

// Iniciar sesión de debug
router.post('/start', async (req, res) => {
  try {
    const { file, args = [] } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, error: 'File is required' });
    }

    const session = await debugService.startDebugSession(file, args);

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        file: session.file,
        state: session.state,
        debuggerUrl: session.debuggerUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Detener sesión de debug
router.post('/stop', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID is required' });
    }

    await debugService.stopDebugSession(sessionId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Establecer breakpoint
router.post('/breakpoint/set', async (req, res) => {
  try {
    const { sessionId, file, line, condition } = req.body;

    if (!sessionId || !file || line === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Session ID, file, and line are required'
      });
    }

    const breakpoint = await debugService.setBreakpoint(sessionId, file, line, condition);

    res.json({
      success: true,
      data: breakpoint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Eliminar breakpoint
router.post('/breakpoint/remove', async (req, res) => {
  try {
    const { sessionId, breakpointId } = req.body;

    if (!sessionId || !breakpointId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and breakpoint ID are required'
      });
    }

    await debugService.removeBreakpoint(sessionId, breakpointId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Toggle breakpoint
router.post('/breakpoint/toggle', async (req, res) => {
  try {
    const { sessionId, breakpointId } = req.body;

    if (!sessionId || !breakpointId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and breakpoint ID are required'
      });
    }

    await debugService.toggleBreakpoint(sessionId, breakpointId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Continue
router.post('/continue', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID is required' });
    }

    await debugService.continue(sessionId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Pause
router.post('/pause', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID is required' });
    }

    await debugService.pause(sessionId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Step Over
router.post('/step/over', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID is required' });
    }

    await debugService.stepOver(sessionId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Step Into
router.post('/step/into', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID is required' });
    }

    await debugService.stepInto(sessionId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Step Out
router.post('/step/out', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID is required' });
    }

    await debugService.stepOut(sessionId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obtener sesión actual
router.get('/session/current', (req, res) => {
  try {
    const session = debugService.getCurrentSession();

    if (!session) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        file: session.file,
        state: session.state,
        breakpoints: Array.from(session.breakpoints.entries()).map(([file, bps]) => ({
          file,
          breakpoints: bps
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obtener todas las sesiones
router.get('/sessions', (req, res) => {
  try {
    const sessions = debugService.getAllSessions();

    res.json({
      success: true,
      data: sessions.map(s => ({
        sessionId: s.id,
        file: s.file,
        state: s.state
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

