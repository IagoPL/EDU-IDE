import { Router } from 'express';
import { DocumentationService } from '../services/DocumentationService';

const router = Router();
const documentationService = new DocumentationService();

// Obtener recursos por lenguaje
router.get('/language/:language', (req, res) => {
  try {
    const { language } = req.params;
    const resources = documentationService.getResourcesByLanguage(language);
    
    res.json({
      success: true,
      data: { resources }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obtener recursos por framework
router.get('/framework/:framework', (req, res) => {
  try {
    const { framework } = req.params;
    const resources = documentationService.getResourcesByFramework(framework);
    
    res.json({
      success: true,
      data: { resources }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obtener recursos recomendados para un archivo
router.get('/recommend', (req, res) => {
  try {
    const { file } = req.query;
    
    if (!file || typeof file !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'File parameter is required'
      });
    }
    
    const resources = documentationService.getRecommendedResources(file);
    
    res.json({
      success: true,
      data: { resources }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obtener todos los recursos agrupados por categoría
router.get('/categories', (req, res) => {
  try {
    const categories = documentationService.getAllResourcesByCategory();
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obtener recursos generales
router.get('/general', (req, res) => {
  try {
    const resources = documentationService.getGeneralResources();
    
    res.json({
      success: true,
      data: { resources }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Buscar recursos por tags
router.get('/search', (req, res) => {
  try {
    const { tags } = req.query;
    
    if (!tags || typeof tags !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Tags parameter is required'
      });
    }
    
    const tagArray = tags.split(',').map(t => t.trim());
    const resources = documentationService.getResourcesByTags(tagArray);
    
    res.json({
      success: true,
      data: { resources }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

