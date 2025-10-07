import { Router } from 'express';
import { ProjectService } from '../services/ProjectService';

const router = Router();
const projectService = new ProjectService();

// Obtener todos los proyectos
router.get('/', async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Obtener un proyecto específico
router.get('/:id', async (req, res) => {
  try {
    const project = await projectService.getProject(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Crear un nuevo proyecto
router.post('/', async (req, res) => {
  try {
    const { name, type, language, description } = req.body;
    
    if (!name || !type || !language) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, type, and language are required' 
      });
    }

    const project = await projectService.createProject(name, type, language, description);
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Actualizar un proyecto
router.put('/:id', async (req, res) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Eliminar un proyecto
router.delete('/:id', async (req, res) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Obtener plantillas disponibles
router.get('/templates/list', (req, res) => {
  const templates = projectService.getTemplates();
  res.json({ success: true, data: templates });
});

export default router;


