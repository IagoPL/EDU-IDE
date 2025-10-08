import { Router } from 'express';
import { TestRunnerService } from '../services/TestRunnerService';
import { FileSystemService } from '../services/FileSystemService';

const router = Router();
const fileSystemService = new FileSystemService();
const testRunnerService = new TestRunnerService(fileSystemService.getWorkspacePath());

// Detectar framework de testing
router.get('/detect-framework', async (req, res) => {
  try {
    const framework = await testRunnerService.detectTestFramework();
    
    res.json({
      success: true,
      data: { framework }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Descubrir archivos de test
router.get('/discover', async (req, res) => {
  try {
    const { framework } = req.query;
    
    const testFiles = await testRunnerService.discoverTests(
      framework as 'jest' | 'mocha' | 'pytest' | undefined
    );
    
    res.json({
      success: true,
      data: { testFiles }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Ejecutar todos los tests
router.post('/run', async (req, res) => {
  try {
    const { framework, coverage = false, watch = false } = req.body;
    
    const result = await testRunnerService.runAllTests({
      framework,
      coverage,
      watch
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Ejecutar test de un archivo específico
router.post('/run-file', async (req, res) => {
  try {
    const { file, framework } = req.body;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'File is required'
      });
    }
    
    const result = await testRunnerService.runTestFile(file, framework);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obtener coverage report
router.get('/coverage', async (req, res) => {
  try {
    const coverage = await testRunnerService.getCoverage();
    
    if (!coverage) {
      return res.json({
        success: true,
        data: null,
        message: 'No coverage data available. Run tests with --coverage flag.'
      });
    }
    
    res.json({
      success: true,
      data: coverage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Actualizar workspace del test runner
router.post('/workspace', (req, res) => {
  try {
    const { path } = req.body;
    
    if (!path) {
      return res.status(400).json({
        success: false,
        error: 'Path is required'
      });
    }
    
    testRunnerService.setWorkspace(path);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

