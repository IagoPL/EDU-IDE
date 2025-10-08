import { Router } from 'express';
import { SnippetsService } from '../services/SnippetsService';

const router = Router();
const snippetsService = new SnippetsService();

// Obtener snippets por lenguaje
router.get('/language/:language', (req, res) => {
  try {
    const { language } = req.params;
    const snippets = snippetsService.getSnippetsByLanguage(language);
    
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

// Obtener snippets por categoría
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const snippets = snippetsService.getSnippetsByCategory(category);
    
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

// Obtener snippets por nivel
router.get('/level/:level', (req, res) => {
  try {
    const { level } = req.params as { level: 'beginner' | 'intermediate' | 'advanced' };
    const snippets = snippetsService.getSnippetsByLevel(level);
    
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

// Buscar snippets
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }
    
    const snippets = snippetsService.searchSnippets(q);
    
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

// Obtener todos los snippets por categoría
router.get('/categories', (req, res) => {
  try {
    const categories = snippetsService.getAllSnippetsByCategory();
    
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

// Obtener snippets recomendados
router.get('/recommend', (req, res) => {
  try {
    const { file } = req.query;
    
    if (!file || typeof file !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'File parameter is required'
      });
    }
    
    const snippets = snippetsService.getRecommendedSnippets(file);
    
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

// Obtener snippet por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const snippet = snippetsService.getSnippetById(id);
    
    if (!snippet) {
      return res.status(404).json({
        success: false,
        error: 'Snippet not found'
      });
    }
    
    res.json({
      success: true,
      data: { snippet }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

