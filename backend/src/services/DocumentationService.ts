export interface DocResource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'official' | 'tutorial' | 'reference' | 'course' | 'community';
  language?: string;
  framework?: string;
  tags: string[];
  icon?: string;
}

export interface DocCategory {
  id: string;
  name: string;
  icon: string;
  resources: DocResource[];
}

export class DocumentationService {
  private resources: Map<string, DocResource[]> = new Map();

  constructor() {
    this.initializeResources();
  }

  /**
   * Inicializa la base de recursos de documentación
   */
  private initializeResources() {
    // JavaScript
    this.addResource('javascript', {
      id: 'mdn-js',
      title: 'MDN Web Docs - JavaScript',
      description: 'Documentación oficial completa de JavaScript',
      url: 'https://developer.mozilla.org/es/docs/Web/JavaScript',
      category: 'official',
      language: 'javascript',
      tags: ['javascript', 'fundamentos', 'referencia'],
      icon: '📘'
    });

    this.addResource('javascript', {
      id: 'javascript-info',
      title: 'JavaScript.info',
      description: 'Tutorial moderno de JavaScript desde básico hasta avanzado',
      url: 'https://javascript.info/',
      category: 'tutorial',
      language: 'javascript',
      tags: ['javascript', 'tutorial', 'completo'],
      icon: '📚'
    });

    // TypeScript
    this.addResource('typescript', {
      id: 'ts-handbook',
      title: 'TypeScript Handbook',
      description: 'Documentación oficial de TypeScript',
      url: 'https://www.typescriptlang.org/docs/',
      category: 'official',
      language: 'typescript',
      tags: ['typescript', 'tipos', 'referencia'],
      icon: '📘'
    });

    // React
    this.addResource('react', {
      id: 'react-docs',
      title: 'React Documentation',
      description: 'Documentación oficial de React',
      url: 'https://react.dev/',
      category: 'official',
      framework: 'react',
      tags: ['react', 'componentes', 'hooks'],
      icon: '⚛️'
    });

    // Node.js
    this.addResource('nodejs', {
      id: 'nodejs-docs',
      title: 'Node.js Documentation',
      description: 'Documentación oficial de Node.js',
      url: 'https://nodejs.org/docs/latest/api/',
      category: 'official',
      language: 'javascript',
      framework: 'nodejs',
      tags: ['nodejs', 'backend', 'api'],
      icon: '🟢'
    });

    // Python
    this.addResource('python', {
      id: 'python-docs',
      title: 'Python Documentation',
      description: 'Documentación oficial de Python',
      url: 'https://docs.python.org/3/',
      category: 'official',
      language: 'python',
      tags: ['python', 'referencia', 'stdlib'],
      icon: '🐍'
    });

    this.addResource('python', {
      id: 'python-tutorial',
      title: 'Python Tutorial',
      description: 'Tutorial oficial de Python para principiantes',
      url: 'https://docs.python.org/3/tutorial/',
      category: 'tutorial',
      language: 'python',
      tags: ['python', 'tutorial', 'principiantes'],
      icon: '📗'
    });

    // HTML/CSS
    this.addResource('html', {
      id: 'mdn-html',
      title: 'MDN - HTML',
      description: 'Referencia completa de HTML',
      url: 'https://developer.mozilla.org/es/docs/Web/HTML',
      category: 'official',
      language: 'html',
      tags: ['html', 'web', 'estructura'],
      icon: '🌐'
    });

    this.addResource('css', {
      id: 'mdn-css',
      title: 'MDN - CSS',
      description: 'Referencia completa de CSS',
      url: 'https://developer.mozilla.org/es/docs/Web/CSS',
      category: 'official',
      language: 'css',
      tags: ['css', 'estilos', 'diseño'],
      icon: '🎨'
    });

    // Git
    this.addResource('git', {
      id: 'git-docs',
      title: 'Git Documentation',
      description: 'Documentación oficial de Git',
      url: 'https://git-scm.com/doc',
      category: 'official',
      tags: ['git', 'control-versiones', 'comandos'],
      icon: '📦'
    });

    this.addResource('git', {
      id: 'git-book',
      title: 'Pro Git Book',
      description: 'Libro completo y gratuito sobre Git',
      url: 'https://git-scm.com/book/es/v2',
      category: 'tutorial',
      tags: ['git', 'libro', 'guía-completa'],
      icon: '📖'
    });

    // Vue.js
    this.addResource('vue', {
      id: 'vue-docs',
      title: 'Vue.js Documentation',
      description: 'Documentación oficial de Vue.js',
      url: 'https://vuejs.org/guide/introduction.html',
      category: 'official',
      framework: 'vue',
      tags: ['vue', 'frontend', 'framework'],
      icon: '💚'
    });

    // Angular
    this.addResource('angular', {
      id: 'angular-docs',
      title: 'Angular Documentation',
      description: 'Documentación oficial de Angular',
      url: 'https://angular.io/docs',
      category: 'official',
      framework: 'angular',
      tags: ['angular', 'typescript', 'frontend'],
      icon: '🅰️'
    });

    // Express
    this.addResource('express', {
      id: 'express-docs',
      title: 'Express Documentation',
      description: 'Documentación oficial de Express.js',
      url: 'https://expressjs.com/',
      category: 'official',
      framework: 'express',
      tags: ['express', 'nodejs', 'backend'],
      icon: '🚂'
    });

    // Next.js
    this.addResource('nextjs', {
      id: 'nextjs-docs',
      title: 'Next.js Documentation',
      description: 'Documentación oficial de Next.js',
      url: 'https://nextjs.org/docs',
      category: 'official',
      framework: 'nextjs',
      tags: ['nextjs', 'react', 'fullstack'],
      icon: '▲'
    });

    // Django
    this.addResource('django', {
      id: 'django-docs',
      title: 'Django Documentation',
      description: 'Documentación oficial de Django',
      url: 'https://docs.djangoproject.com/',
      category: 'official',
      framework: 'django',
      language: 'python',
      tags: ['django', 'python', 'web'],
      icon: '🎸'
    });

    // Java
    this.addResource('java', {
      id: 'java-docs',
      title: 'Java Documentation',
      description: 'Documentación oficial de Java',
      url: 'https://docs.oracle.com/en/java/',
      category: 'official',
      language: 'java',
      tags: ['java', 'jdk', 'api'],
      icon: '☕'
    });

    // C/C++
    this.addResource('cpp', {
      id: 'cppreference',
      title: 'C++ Reference',
      description: 'Referencia completa de C++',
      url: 'https://en.cppreference.com/',
      category: 'reference',
      language: 'cpp',
      tags: ['c++', 'stl', 'referencia'],
      icon: '⚙️'
    });

    // Recursos generales
    this.addResource('general', {
      id: 'stackoverflow',
      title: 'Stack Overflow',
      description: 'Comunidad de preguntas y respuestas',
      url: 'https://stackoverflow.com/',
      category: 'community',
      tags: ['comunidad', 'qa', 'ayuda'],
      icon: '💬'
    });

    this.addResource('general', {
      id: 'github',
      title: 'GitHub',
      description: 'Plataforma de control de versiones y colaboración',
      url: 'https://github.com/',
      category: 'community',
      tags: ['git', 'opensource', 'colaboración'],
      icon: '🐙'
    });
  }

  /**
   * Agrega un recurso de documentación
   */
  private addResource(key: string, resource: DocResource) {
    if (!this.resources.has(key)) {
      this.resources.set(key, []);
    }
    this.resources.get(key)!.push(resource);
  }

  /**
   * Obtiene recursos por lenguaje
   */
  getResourcesByLanguage(language: string): DocResource[] {
    return this.resources.get(language.toLowerCase()) || [];
  }

  /**
   * Obtiene recursos por framework
   */
  getResourcesByFramework(framework: string): DocResource[] {
    const allResources: DocResource[] = [];
    
    this.resources.forEach((resources) => {
      resources.forEach((resource) => {
        if (resource.framework?.toLowerCase() === framework.toLowerCase()) {
          allResources.push(resource);
        }
      });
    });

    return allResources;
  }

  /**
   * Obtiene recursos por tags
   */
  getResourcesByTags(tags: string[]): DocResource[] {
    const allResources: DocResource[] = [];
    
    this.resources.forEach((resources) => {
      resources.forEach((resource) => {
        if (tags.some(tag => resource.tags.includes(tag.toLowerCase()))) {
          allResources.push(resource);
        }
      });
    });

    return allResources;
  }

  /**
   * Obtiene recursos recomendados según el archivo actual
   */
  getRecommendedResources(filePath: string): DocResource[] {
    const extension = filePath.split('.').pop()?.toLowerCase() || '';
    const recommendations: DocResource[] = [];

    // Mapear extensiones a lenguajes/frameworks
    const languageMap: { [key: string]: string[] } = {
      'js': ['javascript', 'nodejs'],
      'jsx': ['javascript', 'react'],
      'ts': ['typescript', 'nodejs'],
      'tsx': ['typescript', 'react'],
      'py': ['python'],
      'html': ['html'],
      'css': ['css'],
      'scss': ['css'],
      'java': ['java'],
      'c': ['cpp'],
      'cpp': ['cpp'],
      'vue': ['vue'],
      'go': ['go'],
      'rs': ['rust']
    };

    const keys = languageMap[extension] || [];
    
    keys.forEach(key => {
      const resources = this.getResourcesByLanguage(key);
      recommendations.push(...resources);
    });

    // Detectar frameworks en el nombre del archivo
    if (filePath.includes('test') || filePath.includes('spec')) {
      recommendations.push(...this.getResourcesByTags(['testing']));
    }

    // Eliminar duplicados
    return Array.from(new Map(recommendations.map(r => [r.id, r])).values());
  }

  /**
   * Obtiene todos los recursos agrupados por categoría
   */
  getAllResourcesByCategory(): DocCategory[] {
    const categories: DocCategory[] = [
      { id: 'languages', name: 'Lenguajes de Programación', icon: '💻', resources: [] },
      { id: 'frameworks', name: 'Frameworks y Librerías', icon: '🔧', resources: [] },
      { id: 'tools', name: 'Herramientas y Utilidades', icon: '🛠️', resources: [] },
      { id: 'community', name: 'Comunidad y Recursos', icon: '👥', resources: [] }
    ];

    this.resources.forEach((resources) => {
      resources.forEach((resource) => {
        if (resource.language && !resource.framework) {
          categories[0].resources.push(resource);
        } else if (resource.framework) {
          categories[1].resources.push(resource);
        } else if (resource.tags.includes('git') || resource.tags.includes('comandos')) {
          categories[2].resources.push(resource);
        } else {
          categories[3].resources.push(resource);
        }
      });
    });

    // Eliminar duplicados y ordenar
    categories.forEach(cat => {
      cat.resources = Array.from(new Map(cat.resources.map(r => [r.id, r])).values())
        .sort((a, b) => a.title.localeCompare(b.title));
    });

    return categories.filter(cat => cat.resources.length > 0);
  }

  /**
   * Obtiene recursos generales
   */
  getGeneralResources(): DocResource[] {
    return this.resources.get('general') || [];
  }
}

