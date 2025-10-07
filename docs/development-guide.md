# Guía de Desarrollo de EduIDE

## 🚀 Configuración del Entorno de Desarrollo

### Requisitos Previos

#### Software Necesario
- **Node.js 18+**: [Descargar aquí](https://nodejs.org/)
- **npm 9+** o **yarn 1.22+** o **pnpm 8+**
- **Git 2.30+**: [Descargar aquí](https://git-scm.com/)
- **Python 3.8+**: Para algunos plugins nativos
- **Docker** (opcional): Para desarrollo con contenedores

#### Herramientas Recomendadas
- **VS Code**: Editor recomendado
- **GitHub Desktop**: Cliente Git visual
- **Postman**: Testing de APIs
- **Docker Desktop**: Gestión de contenedores

### Instalación Inicial

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/edu-ide.git
cd edu-ide

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Inicializar base de datos (si es necesario)
npm run db:setup

# 5. Iniciar en modo desarrollo
npm run dev
```

### Estructura del Proyecto

```
edu-ide/
├── packages/                    # Monorepo packages
│   ├── core/                   # Core engine compartido
│   │   ├── editor/            # Motor de edición
│   │   ├── project-manager/   # Gestión de proyectos
│   │   ├── ai-system/         # Sistema de IA
│   │   └── language-support/  # Soporte de lenguajes
│   ├── desktop/               # Aplicación desktop (Electron)
│   ├── web/                   # Aplicación web (React)
│   ├── shared/                # Código compartido
│   └── plugins/               # Plugins y extensiones
├── tools/                     # Herramientas de desarrollo
├── docs/                      # Documentación
├── examples/                  # Proyectos de ejemplo
├── tests/                     # Tests del sistema
└── assets/                    # Recursos estáticos
```

## 🛠️ Scripts de Desarrollo

### Scripts Principales

```bash
# Desarrollo
npm run dev              # Iniciar en modo desarrollo
npm run dev:desktop      # Aplicación desktop
npm run dev:web          # Aplicación web
npm run dev:core         # Solo core engine

# Build
npm run build            # Build completo
npm run build:desktop    # Build desktop
npm run build:web        # Build web
npm run build:core       # Build core

# Testing
npm run test             # Tests unitarios
npm run test:e2e         # Tests E2E
npm run test:coverage    # Coverage de tests
npm run test:watch       # Tests en modo watch

# Linting y Formateo
npm run lint             # Linting
npm run lint:fix         # Fix automático
npm run format           # Formateo de código
npm run format:check     # Verificar formateo

# Base de datos
npm run db:migrate       # Migraciones
npm run db:seed          # Datos de prueba
npm run db:reset         # Reset completo

# Release
npm run release          # Crear release
npm run release:patch    # Patch release
npm run release:minor    # Minor release
npm run release:major    # Major release
```

### Scripts de Herramientas

```bash
# Análisis
npm run analyze          # Análisis de bundles
npm run analyze:size     # Análisis de tamaño
npm run analyze:deps     # Análisis de dependencias

# Documentación
npm run docs:build       # Build documentación
npm run docs:serve       # Servir documentación
npm run docs:deploy      # Deploy documentación

# Plugins
npm run plugins:build    # Build plugins
npm run plugins:test     # Test plugins
npm run plugins:lint     # Lint plugins
```

## 🏗️ Arquitectura de Desarrollo

### Monorepo Structure

El proyecto utiliza un monorepo con las siguientes características:

- **Lerna**: Gestión del monorepo
- **Yarn Workspaces**: Gestión de dependencias
- **Shared Dependencies**: Dependencias compartidas
- **Independent Versioning**: Versionado independiente

### Core Engine

El core engine es la base compartida entre desktop y web:

```typescript
// packages/core/index.ts
export { EditorEngine } from './editor';
export { ProjectManager } from './project-manager';
export { AISystem } from './ai-system';
export { LanguageSupport } from './language-support';
```

### Desktop App (Electron)

```typescript
// packages/desktop/main.ts
import { app, BrowserWindow } from 'electron';
import { CoreEngine } from '@edu-ide/core';

class DesktopApp {
  private core: CoreEngine;
  
  constructor() {
    this.core = new CoreEngine();
  }
  
  createWindow() {
    // Crear ventana principal
  }
}
```

### Web App (React)

```typescript
// packages/web/src/App.tsx
import React from 'react';
import { CoreEngine } from '@edu-ide/core';

const App: React.FC = () => {
  const core = useMemo(() => new CoreEngine(), []);
  
  return (
    <div className="app">
      {/* UI Components */}
    </div>
  );
};
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno

```bash
# .env.example
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/eduide
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Git Providers
GITHUB_TOKEN=your_github_token
GITLAB_TOKEN=your_gitlab_token

# Cloud Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket

# Development
NODE_ENV=development
DEBUG=edu-ide:*
LOG_LEVEL=debug
```

### Configuración de TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true
  },
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/desktop" },
    { "path": "./packages/web" }
  ]
}
```

### Configuración de ESLint

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    '@edu-ide/eslint-config',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
```

## 🧪 Testing

### Configuración de Jest

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'packages/**/*.ts',
    '!packages/**/*.d.ts',
    '!packages/**/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

### Tests Unitarios

```typescript
// packages/core/__tests__/editor.test.ts
import { EditorEngine } from '../editor';

describe('EditorEngine', () => {
  let editor: EditorEngine;
  
  beforeEach(() => {
    editor = new EditorEngine();
  });
  
  it('should create a new document', () => {
    const doc = editor.createDocument('test.js', 'console.log("hello");');
    expect(doc.content).toBe('console.log("hello");');
  });
  
  it('should insert text at position', () => {
    const doc = editor.createDocument('test.js', 'hello world');
    editor.insertText(doc, { line: 0, column: 5 }, ' beautiful');
    expect(doc.content).toBe('hello beautiful world');
  });
});
```

### Tests E2E

```typescript
// tests/e2e/editor.spec.ts
import { test, expect } from '@playwright/test';

test('should open and edit a file', async ({ page }) => {
  await page.goto('/');
  
  // Abrir archivo
  await page.click('[data-testid="open-file"]');
  await page.fill('[data-testid="file-path"]', 'test.js');
  await page.click('[data-testid="open-button"]');
  
  // Editar contenido
  await page.click('[data-testid="editor"]');
  await page.keyboard.type('console.log("hello world");');
  
  // Verificar contenido
  const content = await page.textContent('[data-testid="editor"]');
  expect(content).toContain('console.log("hello world");');
});
```

## 🔌 Desarrollo de Plugins

### Estructura de Plugin

```
packages/plugins/my-plugin/
├── src/
│   ├── index.ts           # Punto de entrada
│   ├── commands.ts        # Comandos del plugin
│   ├── providers.ts       # Proveedores de servicios
│   └── ui/                # Componentes UI
├── package.json
├── tsconfig.json
└── README.md
```

### Plugin Básico

```typescript
// packages/plugins/my-plugin/src/index.ts
import { Plugin, ExtensionContext } from '@edu-ide/core';

export class MyPlugin implements Plugin {
  readonly id = 'my-plugin';
  readonly name = 'My Plugin';
  readonly version = '1.0.0';
  
  activate(context: ExtensionContext): void {
    // Registrar comandos
    context.registerCommand({
      id: 'my-plugin.hello',
      title: 'Say Hello',
      handler: () => {
        console.log('Hello from My Plugin!');
      }
    });
    
    // Registrar proveedores
    context.registerLanguageProvider({
      language: 'javascript',
      provider: new MyLanguageProvider()
    });
  }
  
  deactivate(): void {
    // Limpiar recursos
  }
}
```

### Comandos de Plugin

```typescript
// packages/plugins/my-plugin/src/commands.ts
import { Command } from '@edu-ide/core';

export const commands: Command[] = [
  {
    id: 'my-plugin.format-code',
    title: 'Format Code',
    category: 'Editor',
    keybinding: 'Ctrl+Shift+F',
    handler: async (context) => {
      const editor = context.editor.getActiveEditor();
      if (editor) {
        const formatted = await formatCode(editor.getContent());
        editor.setContent(formatted);
      }
    }
  }
];
```

## 📦 Build y Deployment

### Build Desktop

```bash
# Build para desarrollo
npm run build:desktop:dev

# Build para producción
npm run build:desktop:prod

# Build para distribución
npm run dist:desktop
```

### Build Web

```bash
# Build para desarrollo
npm run build:web:dev

# Build para producción
npm run build:web:prod

# Build para deployment
npm run build:web:deploy
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build imagen
docker build -t edu-ide .

# Ejecutar contenedor
docker run -p 3000:3000 edu-ide
```

## 🚀 Release Process

### Versionado Semántico

```bash
# Patch release (1.0.0 -> 1.0.1)
npm run release:patch

# Minor release (1.0.0 -> 1.1.0)
npm run release:minor

# Major release (1.0.0 -> 2.0.0)
npm run release:major
```

### Changelog Automático

```bash
# Generar changelog
npm run changelog

# Verificar changelog
npm run changelog:check
```

### Release Notes

```markdown
# Release Notes v1.0.0

## 🎉 Nuevas Características
- Editor multi-lenguaje
- Asistente IA integrado
- Gestión de proyectos

## 🐛 Correcciones
- Fix en autocompletado
- Mejora en rendimiento

## 🔧 Mejoras
- UI más intuitiva
- Mejor soporte de TypeScript
```

## 📊 Monitoreo y Debugging

### Logging

```typescript
// packages/core/src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export default logger;
```

### Performance Monitoring

```typescript
// packages/core/src/utils/performance.ts
export class PerformanceMonitor {
  private static timers = new Map<string, number>();
  
  static start(label: string): void {
    this.timers.set(label, performance.now());
  }
  
  static end(label: string): number {
    const start = this.timers.get(label);
    if (!start) return 0;
    
    const duration = performance.now() - start;
    this.timers.delete(label);
    
    console.log(`${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }
}
```

## 🤝 Contribución

### Flujo de Trabajo

1. **Fork** del repositorio
2. **Crear rama** de feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Desarrollar** la funcionalidad
4. **Escribir tests** para la funcionalidad
5. **Ejecutar tests** (`npm test`)
6. **Commit** con mensaje descriptivo
7. **Push** a la rama
8. **Crear Pull Request**

### Estándares de Código

- **TypeScript**: Tipado estricto
- **ESLint**: Linting automático
- **Prettier**: Formateo consistente
- **Conventional Commits**: Mensajes de commit estandarizados
- **Tests**: Cobertura mínima del 80%

### Code Review

- **Revisión obligatoria** para cambios en core
- **Tests deben pasar** antes del merge
- **Documentación actualizada** si es necesario
- **Performance impact** evaluado para cambios grandes

## 📚 Recursos Adicionales

### Documentación
- [Arquitectura del Sistema](architecture.md)
- [Funcionalidades](features.md)
- [Stack Tecnológico](technology-stack.md)

### Enlaces Útiles
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)

### Comunidad
- [Discord](https://discord.gg/edu-ide)
- [GitHub Discussions](https://github.com/tu-usuario/edu-ide/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/edu-ide)
