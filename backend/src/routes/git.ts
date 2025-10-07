import { Router, Request, Response } from 'express';
import { GitService } from '../services/GitService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Path al workspace (puede ser configurado)
const WORKSPACE_PATH = path.join(__dirname, '../../workspace');

/**
 * @route GET /api/git/status
 * @desc Obtiene el estado actual del repositorio Git
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const gitService = new GitService(WORKSPACE_PATH);
    
    const isRepo = await gitService.isGitRepository();
    if (!isRepo) {
      return res.status(400).json({ 
        error: 'Not a Git repository',
        message: 'El directorio actual no es un repositorio Git' 
      });
    }

    const status = await gitService.getStatus();
    res.json({
      success: true,
      files: status
    });
  } catch (error) {
    console.error('Error getting Git status:', error);
    res.status(500).json({ 
      error: 'Failed to get Git status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/git/init
 * @desc Inicializa un nuevo repositorio Git
 */
router.post('/init', async (req: Request, res: Response) => {
  try {
    const gitService = new GitService(WORKSPACE_PATH);
    await gitService.init();
    
    res.json({
      success: true,
      message: 'Repositorio Git inicializado correctamente'
    });
  } catch (error) {
    console.error('Error initializing Git:', error);
    res.status(500).json({ 
      error: 'Failed to initialize Git',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/git/add
 * @desc Agrega archivos al staging area
 * @body { files: string[] } - Array de rutas de archivos
 */
router.post('/add', async (req: Request, res: Response) => {
  try {
    const { files } = req.body;
    
    if (!Array.isArray(files)) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'files debe ser un array' 
      });
    }

    const gitService = new GitService(WORKSPACE_PATH);
    await gitService.add(files);
    
    res.json({
      success: true,
      message: `${files.length === 0 || files.includes('.') ? 'Todos los archivos agregados' : `${files.length} archivo(s) agregado(s)`}`
    });
  } catch (error) {
    console.error('Error adding files:', error);
    res.status(500).json({ 
      error: 'Failed to add files',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/git/commit
 * @desc Crea un commit
 * @body { message: string } - Mensaje del commit
 */
router.post('/commit', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Se requiere un mensaje para el commit' 
      });
    }

    const gitService = new GitService(WORKSPACE_PATH);
    const commitHash = await gitService.commit(message);
    
    res.json({
      success: true,
      commit: commitHash,
      message: 'Commit creado correctamente'
    });
  } catch (error) {
    console.error('Error creating commit:', error);
    res.status(500).json({ 
      error: 'Failed to create commit',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/git/push
 * @desc Hace push de los cambios
 * @body { remote?: string, branch?: string }
 */
router.post('/push', async (req: Request, res: Response) => {
  try {
    const { remote = 'origin', branch } = req.body;

    const gitService = new GitService(WORKSPACE_PATH);
    await gitService.push(remote, branch);
    
    res.json({
      success: true,
      message: 'Push realizado correctamente'
    });
  } catch (error) {
    console.error('Error pushing:', error);
    res.status(500).json({ 
      error: 'Failed to push',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/git/pull
 * @desc Hace pull de los cambios
 * @body { remote?: string, branch?: string }
 */
router.post('/pull', async (req: Request, res: Response) => {
  try {
    const { remote = 'origin', branch } = req.body;

    const gitService = new GitService(WORKSPACE_PATH);
    await gitService.pull(remote, branch);
    
    res.json({
      success: true,
      message: 'Pull realizado correctamente'
    });
  } catch (error) {
    console.error('Error pulling:', error);
    res.status(500).json({ 
      error: 'Failed to pull',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/git/log
 * @desc Obtiene el historial de commits
 * @query { limit?: number }
 */
router.get('/log', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const gitService = new GitService(WORKSPACE_PATH);
    const commits = await gitService.getLog(limit);
    
    res.json({
      success: true,
      commits
    });
  } catch (error) {
    console.error('Error getting log:', error);
    res.status(500).json({ 
      error: 'Failed to get log',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/git/branches
 * @desc Obtiene la lista de branches
 */
router.get('/branches', async (req: Request, res: Response) => {
  try {
    const gitService = new GitService(WORKSPACE_PATH);
    const branches = await gitService.getBranches();
    
    res.json({
      success: true,
      branches
    });
  } catch (error) {
    console.error('Error getting branches:', error);
    res.status(500).json({ 
      error: 'Failed to get branches',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/git/branch/create
 * @desc Crea un nuevo branch
 * @body { name: string }
 */
router.post('/branch/create', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Se requiere un nombre para el branch' 
      });
    }

    const gitService = new GitService(WORKSPACE_PATH);
    await gitService.createBranch(name);
    
    res.json({
      success: true,
      message: `Branch '${name}' creado correctamente`
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ 
      error: 'Failed to create branch',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/git/checkout
 * @desc Cambia a un branch existente
 * @body { branch: string }
 */
router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const { branch } = req.body;
    
    if (!branch || typeof branch !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Se requiere el nombre del branch' 
      });
    }

    const gitService = new GitService(WORKSPACE_PATH);
    await gitService.checkout(branch);
    
    res.json({
      success: true,
      message: `Cambiado a branch '${branch}'`
    });
  } catch (error) {
    console.error('Error checking out branch:', error);
    res.status(500).json({ 
      error: 'Failed to checkout branch',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route DELETE /api/git/branch/:name
 * @desc Elimina un branch
 * @params { name: string }
 * @query { force?: boolean }
 */
router.delete('/branch/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const force = req.query.force === 'true';

    const gitService = new GitService(WORKSPACE_PATH);
    await gitService.deleteBranch(name, force);
    
    res.json({
      success: true,
      message: `Branch '${name}' eliminado`
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ 
      error: 'Failed to delete branch',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/git/diff
 * @desc Obtiene el diff de cambios
 * @query { file?: string, staged?: boolean }
 */
router.get('/diff', async (req: Request, res: Response) => {
  try {
    const file = req.query.file as string | undefined;
    const staged = req.query.staged === 'true';

    const gitService = new GitService(WORKSPACE_PATH);
    const diff = staged 
      ? await gitService.getStagedDiff(file)
      : await gitService.getDiff(file);
    
    res.json({
      success: true,
      diff
    });
  } catch (error) {
    console.error('Error getting diff:', error);
    res.status(500).json({ 
      error: 'Failed to get diff',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/git/discard
 * @desc Descarta cambios en un archivo
 * @body { file: string }
 */
router.post('/discard', async (req: Request, res: Response) => {
  try {
    const { file } = req.body;
    
    if (!file || typeof file !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Se requiere la ruta del archivo' 
      });
    }

    const gitService = new GitService(WORKSPACE_PATH);
    await gitService.discardChanges(file);
    
    res.json({
      success: true,
      message: `Cambios descartados en '${file}'`
    });
  } catch (error) {
    console.error('Error discarding changes:', error);
    res.status(500).json({ 
      error: 'Failed to discard changes',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/git/unstage
 * @desc Quita un archivo del staging area
 * @body { file: string }
 */
router.post('/unstage', async (req: Request, res: Response) => {
  try {
    const { file } = req.body;
    
    if (!file || typeof file !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Se requiere la ruta del archivo' 
      });
    }

    const gitService = new GitService(WORKSPACE_PATH);
    await gitService.unstage(file);
    
    res.json({
      success: true,
      message: `Archivo '${file}' quitado del staging`
    });
  } catch (error) {
    console.error('Error unstaging file:', error);
    res.status(500).json({ 
      error: 'Failed to unstage file',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/git/remotes
 * @desc Obtiene los repositorios remotos configurados
 */
router.get('/remotes', async (req: Request, res: Response) => {
  try {
    const gitService = new GitService(WORKSPACE_PATH);
    const remotes = await gitService.getRemotes();
    
    res.json({
      success: true,
      remotes
    });
  } catch (error) {
    console.error('Error getting remotes:', error);
    res.status(500).json({ 
      error: 'Failed to get remotes',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/git/config
 * @desc Obtiene la configuración de Git
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    const gitService = new GitService(WORKSPACE_PATH);
    const config = await gitService.getConfig();
    
    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error getting config:', error);
    res.status(500).json({ 
      error: 'Failed to get config',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/git/config
 * @desc Configura el usuario de Git
 * @body { name: string, email: string }
 */
router.post('/config', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Se requieren name y email' 
      });
    }

    const gitService = new GitService(WORKSPACE_PATH);
    await gitService.setConfig(name, email);
    
    res.json({
      success: true,
      message: 'Configuración actualizada correctamente'
    });
  } catch (error) {
    console.error('Error setting config:', error);
    res.status(500).json({ 
      error: 'Failed to set config',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

