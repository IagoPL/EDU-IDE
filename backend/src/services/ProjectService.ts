import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export interface Project {
  id: string;
  name: string;
  path: string;
  type: 'react' | 'nodejs' | 'python' | 'java' | 'cpp' | 'html' | 'other';
  language: string;
  createdAt: Date;
  lastModified: Date;
  description?: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: Project['type'];
  language: string;
  files: {
    path: string;
    content: string;
  }[];
}

export class ProjectService {
  private projectsDir: string;
  private configFile: string;

  constructor() {
    this.projectsDir = path.join(process.cwd(), 'projects');
    this.configFile = path.join(this.projectsDir, '.projects.json');
    this.ensureProjectsDirExists();
  }

  private async ensureProjectsDirExists() {
    if (!existsSync(this.projectsDir)) {
      await fs.mkdir(this.projectsDir, { recursive: true });
    }
    if (!existsSync(this.configFile)) {
      await fs.writeFile(this.configFile, JSON.stringify({ projects: [] }, null, 2));
    }
  }

  private async loadProjects(): Promise<Project[]> {
    try {
      const data = await fs.readFile(this.configFile, 'utf-8');
      const config = JSON.parse(data);
      return config.projects || [];
    } catch {
      return [];
    }
  }

  private async saveProjects(projects: Project[]): Promise<void> {
    await fs.writeFile(
      this.configFile,
      JSON.stringify({ projects }, null, 2),
      'utf-8'
    );
  }

  async getAllProjects(): Promise<Project[]> {
    return await this.loadProjects();
  }

  async getProject(id: string): Promise<Project | null> {
    const projects = await this.loadProjects();
    return projects.find(p => p.id === id) || null;
  }

  async createProject(
    name: string,
    type: Project['type'],
    language: string,
    description?: string
  ): Promise<Project> {
    const projects = await this.loadProjects();
    
    const id = `project-${Date.now()}`;
    const projectPath = path.join(this.projectsDir, id);

    // Crear directorio del proyecto
    await fs.mkdir(projectPath, { recursive: true });

    const project: Project = {
      id,
      name,
      path: projectPath,
      type,
      language,
      createdAt: new Date(),
      lastModified: new Date(),
      description,
    };

    projects.push(project);
    await this.saveProjects(projects);

    // Aplicar plantilla según el tipo
    await this.applyTemplate(project);

    return project;
  }

  async deleteProject(id: string): Promise<void> {
    const projects = await this.loadProjects();
    const project = projects.find(p => p.id === id);

    if (!project) {
      throw new Error('Project not found');
    }

    // Eliminar directorio del proyecto
    if (existsSync(project.path)) {
      await fs.rm(project.path, { recursive: true, force: true });
    }

    // Actualizar lista de proyectos
    const updatedProjects = projects.filter(p => p.id !== id);
    await this.saveProjects(updatedProjects);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const projects = await this.loadProjects();
    const index = projects.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error('Project not found');
    }

    projects[index] = {
      ...projects[index],
      ...updates,
      lastModified: new Date(),
    };

    await this.saveProjects(projects);
    return projects[index];
  }

  private async applyTemplate(project: Project): Promise<void> {
    const templates = this.getTemplates();
    const template = templates.find(t => t.type === project.type);

    if (template) {
      for (const file of template.files) {
        const filePath = path.join(project.path, file.path);
        const fileDir = path.dirname(filePath);

        if (!existsSync(fileDir)) {
          await fs.mkdir(fileDir, { recursive: true });
        }

        await fs.writeFile(filePath, file.content, 'utf-8');
      }
    }
  }

  getTemplates(): ProjectTemplate[] {
    return [
      {
        id: 'react-app',
        name: 'React Application',
        description: 'Una aplicación React básica',
        type: 'react',
        language: 'JavaScript',
        files: [
          {
            path: 'src/App.jsx',
            content: `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>¡Hola desde React!</h1>
      <p>Bienvenido a tu aplicación React</p>
    </div>
  );
}

export default App;
`,
          },
          {
            path: 'src/index.jsx',
            content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
`,
          },
          {
            path: 'public/index.html',
            content: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi App React</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`,
          },
          {
            path: 'package.json',
            content: JSON.stringify({
              name: 'my-react-app',
              version: '1.0.0',
              dependencies: {
                react: '^18.2.0',
                'react-dom': '^18.2.0',
              },
            }, null, 2),
          },
        ],
      },
      {
        id: 'nodejs-api',
        name: 'Node.js API',
        description: 'API REST con Express',
        type: 'nodejs',
        language: 'JavaScript',
        files: [
          {
            path: 'src/index.js',
            content: `const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: '¡Hola desde la API!' });
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Usuario 1' },
    { id: 2, name: 'Usuario 2' },
  ]);
});

app.listen(PORT, () => {
  console.log(\`🚀 Servidor corriendo en http://localhost:\${PORT}\`);
});
`,
          },
          {
            path: 'package.json',
            content: JSON.stringify({
              name: 'my-nodejs-api',
              version: '1.0.0',
              main: 'src/index.js',
              scripts: {
                start: 'node src/index.js',
              },
              dependencies: {
                express: '^4.18.0',
              },
            }, null, 2),
          },
        ],
      },
      {
        id: 'python-app',
        name: 'Python Application',
        description: 'Aplicación Python básica',
        type: 'python',
        language: 'Python',
        files: [
          {
            path: 'main.py',
            content: `# Aplicación Python

def saludar(nombre):
    """Función que saluda al usuario"""
    return f"¡Hola, {nombre}!"

if __name__ == "__main__":
    nombre = input("¿Cómo te llamas? ")
    mensaje = saludar(nombre)
    print(mensaje)
`,
          },
          {
            path: 'README.md',
            content: `# Mi Aplicación Python

## Ejecución

\`\`\`bash
python main.py
\`\`\`
`,
          },
        ],
      },
      {
        id: 'html-site',
        name: 'HTML Website',
        description: 'Sitio web HTML estático',
        type: 'html',
        language: 'HTML',
        files: [
          {
            path: 'index.html',
            content: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi Sitio Web</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>¡Bienvenido a mi sitio web!</h1>
  <p>Este es un sitio web creado con EduIDE</p>
  <script src="script.js"></script>
</body>
</html>
`,
          },
          {
            path: 'styles.css',
            content: `body {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
}

h1 {
  color: #333;
}
`,
          },
          {
            path: 'script.js',
            content: `console.log('¡Sitio web cargado!');

// Tu código JavaScript aquí
`,
          },
        ],
      },
    ];
  }
}


