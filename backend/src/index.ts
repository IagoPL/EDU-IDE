import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import filesRouter from './routes/files';
import projectsRouter from './routes/projects';
import terminalRouter from './routes/terminal';
import gitRouter from './routes/git';
import debugRouter from './routes/debug';
import testingRouter from './routes/testing';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'EduIDE Backend is running' });
});

app.get('/api', (req, res) => {
  res.json({ 
    name: 'EduIDE API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      files: '/api/files',
      projects: '/api/projects',
      terminal: '/api/terminal',
      git: '/api/git',
      debug: '/api/debug',
      testing: '/api/testing',
      ai: '/api/ai'
    }
  });
});

// API Routes
app.use('/api/files', filesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/terminal', terminalRouter);
app.use('/api/git', gitRouter);
app.use('/api/debug', debugRouter);
app.use('/api/testing', testingRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EduIDE Backend running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
  console.log(`   - API Info: http://localhost:${PORT}/api`);
  console.log(`   - Projects: http://localhost:${PORT}/api/projects`);
  console.log(`   - Files: http://localhost:${PORT}/api/files`);
  console.log(`   - Terminal: http://localhost:${PORT}/api/terminal`);
  console.log(`   - Git: http://localhost:${PORT}/api/git`);
  console.log(`   - Debug: http://localhost:${PORT}/api/debug`);
  console.log(`   - Testing: http://localhost:${PORT}/api/testing`);
});


