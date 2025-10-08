export interface Snippet {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  category: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  author?: string;
}

export interface SnippetCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  snippets: Snippet[];
}

export class SnippetsService {
  private snippets: Map<string, Snippet[]> = new Map();

  constructor() {
    this.initializeSnippets();
  }

  private initializeSnippets() {
    // JavaScript - Fundamentos
    this.addSnippet('javascript', {
      id: 'js-array-map',
      title: 'Array Map - Transformar Arrays',
      description: 'Transforma cada elemento de un array',
      language: 'javascript',
      code: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8, 10]`,
      category: 'arrays',
      tags: ['array', 'map', 'transformacion'],
      level: 'beginner'
    });

    this.addSnippet('javascript', {
      id: 'js-array-filter',
      title: 'Array Filter - Filtrar Arrays',
      description: 'Filtra elementos que cumplen una condición',
      language: 'javascript',
      code: `const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens); // [2, 4]`,
      category: 'arrays',
      tags: ['array', 'filter', 'condicion'],
      level: 'beginner'
    });

    this.addSnippet('javascript', {
      id: 'js-async-await',
      title: 'Async/Await - Manejo de Promesas',
      description: 'Forma moderna de manejar código asíncrono',
      language: 'javascript',
      code: `async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}`,
      category: 'async',
      tags: ['async', 'await', 'promises', 'fetch'],
      level: 'intermediate'
    });

    // React
    this.addSnippet('react', {
      id: 'react-useState',
      title: 'useState Hook',
      description: 'Agregar estado a componentes funcionales',
      language: 'typescript',
      code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`,
      category: 'hooks',
      tags: ['react', 'hooks', 'useState', 'state'],
      level: 'beginner'
    });

    this.addSnippet('react', {
      id: 'react-useEffect',
      title: 'useEffect Hook',
      description: 'Efectos secundarios en componentes',
      language: 'typescript',
      code: `import { useState, useEffect } from 'react';

function DataFetcher({ userId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(\`/api/users/\${userId}\`);
      const result = await response.json();
      setData(result);
    }

    fetchData();
  }, [userId]); // Se ejecuta cuando userId cambia

  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
}`,
      category: 'hooks',
      tags: ['react', 'hooks', 'useEffect', 'lifecycle'],
      level: 'intermediate'
    });

    // Python
    this.addSnippet('python', {
      id: 'py-list-comprehension',
      title: 'List Comprehension',
      description: 'Forma concisa de crear listas',
      language: 'python',
      code: `# Tradicional
squares = []
for i in range(10):
    squares.append(i ** 2)

# List comprehension
squares = [i ** 2 for i in range(10)]

# Con condición
evens = [i for i in range(10) if i % 2 == 0]`,
      category: 'listas',
      tags: ['python', 'listas', 'comprension'],
      level: 'intermediate'
    });

    this.addSnippet('python', {
      id: 'py-decorators',
      title: 'Decoradores',
      description: 'Modificar comportamiento de funciones',
      language: 'python',
      code: `def timer_decorator(func):
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.2f}s")
        return result
    return wrapper

@timer_decorator
def slow_function():
    time.sleep(1)
    return "Done"`,
      category: 'avanzado',
      tags: ['python', 'decoradores', 'funciones'],
      level: 'advanced'
    });

    // Node.js
    this.addSnippet('nodejs', {
      id: 'node-express-server',
      title: 'Express Server Básico',
      description: 'Servidor HTTP con Express',
      language: 'javascript',
      code: `const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.post('/api/users', (req, res) => {
  const user = req.body;
  res.status(201).json({ id: 1, ...user });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
      category: 'backend',
      tags: ['nodejs', 'express', 'server', 'api'],
      level: 'beginner'
    });

    // Git
    this.addSnippet('git', {
      id: 'git-workflow',
      title: 'Git Workflow Básico',
      description: 'Flujo de trabajo típico con Git',
      language: 'bash',
      code: `# 1. Clonar repositorio
git clone https://github.com/usuario/repo.git

# 2. Crear nueva rama
git checkout -b feature/nueva-funcionalidad

# 3. Hacer cambios y commit
git add .
git commit -m "Agregar nueva funcionalidad"

# 4. Subir cambios
git push origin feature/nueva-funcionalidad

# 5. Actualizar desde main
git checkout main
git pull origin main`,
      category: 'workflow',
      tags: ['git', 'workflow', 'comandos'],
      level: 'beginner'
    });

    // TypeScript
    this.addSnippet('typescript', {
      id: 'ts-interface',
      title: 'Interfaces en TypeScript',
      description: 'Definir tipos de objetos',
      language: 'typescript',
      code: `interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // Opcional
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}

const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com"
};

console.log(greetUser(user));`,
      category: 'tipos',
      tags: ['typescript', 'interface', 'tipos'],
      level: 'beginner'
    });

    // HTML
    this.addSnippet('html', {
      id: 'html-form',
      title: 'Formulario HTML',
      description: 'Estructura básica de un formulario',
      language: 'html',
      code: `<form action="/submit" method="POST">
  <div>
    <label for="name">Nombre:</label>
    <input type="text" id="name" name="name" required>
  </div>
  
  <div>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <div>
    <label for="message">Mensaje:</label>
    <textarea id="message" name="message"></textarea>
  </div>
  
  <button type="submit">Enviar</button>
</form>`,
      category: 'formularios',
      tags: ['html', 'form', 'input'],
      level: 'beginner'
    });

    // CSS
    this.addSnippet('css', {
      id: 'css-flexbox',
      title: 'Flexbox Layout',
      description: 'Layout flexible con Flexbox',
      language: 'css',
      code: `.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.item {
  flex: 1;
  padding: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}`,
      category: 'layout',
      tags: ['css', 'flexbox', 'layout', 'responsive'],
      level: 'intermediate'
    });
  }

  private addSnippet(key: string, snippet: Snippet) {
    if (!this.snippets.has(key)) {
      this.snippets.set(key, []);
    }
    this.snippets.get(key)!.push(snippet);
  }

  /**
   * Obtiene snippets por lenguaje
   */
  getSnippetsByLanguage(language: string): Snippet[] {
    return this.snippets.get(language.toLowerCase()) || [];
  }

  /**
   * Obtiene snippets por categoría
   */
  getSnippetsByCategory(category: string): Snippet[] {
    const result: Snippet[] = [];
    
    this.snippets.forEach((snippets) => {
      snippets.forEach((snippet) => {
        if (snippet.category.toLowerCase() === category.toLowerCase()) {
          result.push(snippet);
        }
      });
    });

    return result;
  }

  /**
   * Obtiene snippets por nivel
   */
  getSnippetsByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Snippet[] {
    const result: Snippet[] = [];
    
    this.snippets.forEach((snippets) => {
      snippets.forEach((snippet) => {
        if (snippet.level === level) {
          result.push(snippet);
        }
      });
    });

    return result;
  }

  /**
   * Busca snippets por tags
   */
  searchSnippets(query: string): Snippet[] {
    const result: Snippet[] = [];
    const lowerQuery = query.toLowerCase();
    
    this.snippets.forEach((snippets) => {
      snippets.forEach((snippet) => {
        const matchesTitle = snippet.title.toLowerCase().includes(lowerQuery);
        const matchesDescription = snippet.description.toLowerCase().includes(lowerQuery);
        const matchesTags = snippet.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
        
        if (matchesTitle || matchesDescription || matchesTags) {
          result.push(snippet);
        }
      });
    });

    return result;
  }

  /**
   * Obtiene todos los snippets agrupados por categoría
   */
  getAllSnippetsByCategory(): SnippetCategory[] {
    const categoriesMap = new Map<string, Snippet[]>();

    this.snippets.forEach((snippets) => {
      snippets.forEach((snippet) => {
        const catKey = `${snippet.language}-${snippet.category}`;
        if (!categoriesMap.has(catKey)) {
          categoriesMap.set(catKey, []);
        }
        categoriesMap.get(catKey)!.push(snippet);
      });
    });

    const categories: SnippetCategory[] = [];
    
    categoriesMap.forEach((snippets, key) => {
      const [language, category] = key.split('-');
      categories.push({
        id: key,
        name: `${language.toUpperCase()} - ${category}`,
        description: `Snippets de ${category} en ${language}`,
        icon: this.getLanguageIcon(language),
        snippets
      });
    });

    return categories.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Obtiene snippets recomendados según el archivo actual
   */
  getRecommendedSnippets(filePath: string): Snippet[] {
    const extension = filePath.split('.').pop()?.toLowerCase() || '';
    const recommendations: Snippet[] = [];

    const languageMap: { [key: string]: string[] } = {
      'js': ['javascript', 'nodejs'],
      'jsx': ['javascript', 'react'],
      'ts': ['typescript', 'nodejs'],
      'tsx': ['typescript', 'react'],
      'py': ['python'],
      'html': ['html'],
      'css': ['css'],
      'java': ['java'],
      'sh': ['git'],
      'bash': ['git']
    };

    const languages = languageMap[extension] || [];
    
    languages.forEach(lang => {
      const snippets = this.getSnippetsByLanguage(lang);
      recommendations.push(...snippets);
    });

    return recommendations.slice(0, 10); // Limitar a 10 recomendaciones
  }

  private getLanguageIcon(language: string): string {
    const icons: { [key: string]: string } = {
      'javascript': '📜',
      'typescript': '📘',
      'python': '🐍',
      'react': '⚛️',
      'nodejs': '🟢',
      'html': '🌐',
      'css': '🎨',
      'git': '📦',
      'java': '☕'
    };

    return icons[language.toLowerCase()] || '📄';
  }

  /**
   * Obtiene un snippet por ID
   */
  getSnippetById(id: string): Snippet | null {
    let found: Snippet | null = null;
    
    this.snippets.forEach((snippets) => {
      const snippet = snippets.find(s => s.id === id);
      if (snippet) {
        found = snippet;
      }
    });

    return found;
  }
}

