# 🎓 EduIDE - Educational IDE

> Un IDE educativo moderno y completo construido con Next.js, Express y Monaco Editor

[![GitHub](https://img.shields.io/badge/GitHub-EduIDE-blue)](https://github.com/IagoPL/EDU-IDE)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🚀 Estado del Proyecto

**Versión**: v0.3 (Sprint 2 Completado)  
**Progreso**: 30% (63/210 funcionalidades)  
**Estado**: ✅ FUNCIONAL

### 📊 Sprints Completados

- ✅ **Sprint 1**: Editor Profesional (Monaco, Search, Cache)
- ✅ **Sprint 2**: Terminal Integrado y Ejecución de Código
- ⏳ **Sprint 3**: Git Integration (Próximo)

---

## ✨ Características Principales

### 🖥️ Editor de Código Profesional
- **Monaco Editor** con lazy loading y web workers
- Syntax highlighting para 50+ lenguajes
- IntelliSense y autocompletado inteligente
- Find & Replace con soporte para regex
- Code folding, bracket matching, minimap
- Múltiples pestañas y archivos simultáneos

### 📁 Sistema de Archivos Completo
- Explorador de archivos con árbol recursivo
- Crear, editar, eliminar archivos y carpetas
- Renombrar y mover archivos
- Caché inteligente (70% menos llamadas al servidor)
- Quick Open (Ctrl+P) con búsqueda fuzzy

### 🖥️ Terminal Integrado
- Terminal completo con xterm.js
- Soporte para Bash/PowerShell/CMD según OS
- Múltiples pestañas de terminal
- Ejecución de comandos en tiempo real
- Historial de comandos

### ⚡ Ejecución de Código
- Ejecutar código en múltiples lenguajes:
  - JavaScript/TypeScript (Node.js)
  - Python
  - Java
  - C/C++
- Gestor de dependencias automático (npm/yarn/pnpm/pip)
- Output en tiempo real
- Detección automática de package manager

### 🎨 Interfaz Moderna
- Command Palette (Ctrl+Shift+P) con 25+ comandos
- Sistema de temas (Light/Dark/System)
- Diseño responsive con glassmorphism
- Paleta de colores OKLCH
- Animaciones suaves

### 📦 Gestión de Proyectos
- Crear proyectos desde plantillas
- Plantillas: React, Node.js, Python, HTML
- Panel de proyectos
- Configuración por proyecto

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 15.5.4
- **Lenguaje**: TypeScript 5.7
- **Editor**: Monaco Editor
- **Terminal**: xterm.js
- **UI**: Radix UI + Tailwind CSS
- **Gestión de Estado**: React Hooks

### Backend
- **Runtime**: Node.js 22
- **Framework**: Express 4
- **Lenguaje**: TypeScript 5.7
- **Compilador**: tsx (desarrollo)
- **Terminal**: child_process (nativo)

### Herramientas
- **Package Manager**: npm
- **Linter**: ESLint
- **Formato**: Prettier (implícito)
- **Control de Versiones**: Git

---

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ (recomendado 22+)
- npm o yarn
- Git

### Clonar el Repositorio

```bash
git clone https://github.com/IagoPL/EDU-IDE.git
cd EDU-IDE
```

### Instalar Dependencias

```bash
# Instalar todas las dependencias (root, frontend, backend)
npm install

# O instalar individualmente
cd backend && npm install
cd ../frontend && npm install
```

### Ejecutar en Desarrollo

```bash
# Desde la raíz (ejecuta frontend y backend simultáneamente)
npm run dev

# O ejecutar individualmente:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

---

## 📖 Documentación

### Documentos Principales

- **[CHECKLIST-FUNCIONALIDADES.md](CHECKLIST-FUNCIONALIDADES.md)** - Lista completa de funcionalidades y progreso
- **[SPRINT1-COMPLETADO.md](SPRINT1-COMPLETADO.md)** - Resumen del Sprint 1
- **[SPRINT2-COMPLETADO.md](SPRINT2-COMPLETADO.md)** - Resumen del Sprint 2
- **[FIXES-APLICADOS.md](FIXES-APLICADOS.md)** - Soluciones técnicas implementadas
- **[STATUS-SERVIDORES.md](STATUS-SERVIDORES.md)** - Estado y configuración de servidores

### Documentación Técnica

- **[docs/architecture.md](docs/architecture.md)** - Arquitectura del proyecto
- **[docs/development-guide.md](docs/development-guide.md)** - Guía de desarrollo
- **[docs/features.md](docs/features.md)** - Descripción detallada de features
- **[docs/technology-stack.md](docs/technology-stack.md)** - Stack tecnológico

---

## 🎯 Uso Rápido

### Atajos de Teclado

| Acción | Windows/Linux | Mac |
|--------|---------------|-----|
| Guardar archivo | `Ctrl + S` | `Cmd + S` |
| Quick Open | `Ctrl + P` | `Cmd + P` |
| Command Palette | `Ctrl + Shift + P` | `Cmd + Shift + P` |
| Find | `Ctrl + F` | `Cmd + F` |
| Find & Replace | `Ctrl + H` | `Cmd + H` |
| Toggle Terminal | `Ctrl + ` | `Ctrl + ` |

### Comandos Principales

```bash
# Crear nuevo archivo
Command Palette → "File: New File"

# Ejecutar código
1. Abrir archivo
2. Ctrl+Shift+P → "Code: Execute"

# Instalar dependencias
Command Palette → "Project: Install Dependencies"

# Cambiar tema
Command Palette → "View: Change Theme"
```

---

## 📊 Progreso del Proyecto

### Por Categoría

| Categoría | Completado | Total | % |
|-----------|------------|-------|---|
| Sistema de Archivos | 15 | 18 | 83% |
| Editor de Código | 11 | 22 | 50% |
| Terminal Integrado | 6 | 12 | 50% |
| UI/UX | 14 | 20 | 70% |
| Gestión de Proyectos | 9 | 18 | 50% |
| Rendimiento | 5 | 10 | 50% |
| **TOTAL** | **63** | **210** | **30%** |

### Roadmap

- [x] Sprint 1: MVP Mejorado (Editor Profesional)
- [x] Sprint 2: Terminal y Ejecución
- [ ] Sprint 3: Git Integration
- [ ] Sprint 4: Asistente IA
- [ ] Sprint 5: Debugging
- [ ] Sprint 6: Testing Framework
- [ ] Sprint 7: Características Educativas
- [ ] Sprint 8+: Cloud, Colaboración, Plugins

---

## 🤝 Contribuir

### Cómo Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Seguir la estructura de commits convencionales
- Añadir tests para nuevas funcionalidades
- Actualizar documentación
- Seguir las guías de estilo de TypeScript

---

## 🐛 Problemas Conocidos

### Limitaciones Actuales

- **Terminal**: No soporta comandos interactivos (vim, nano)
- **SSH**: No hay soporte para conexiones remotas
- **node-pty**: Requiere Visual Studio Build Tools en Windows
- **Mobile**: No optimizado para dispositivos móviles

### Soluciones en Progreso

Ver [FIXES-APLICADOS.md](FIXES-APLICADOS.md) para detalles técnicos.

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Autores

- **Iago** - *Desarrollo Principal* - [IagoPL](https://github.com/IagoPL)

---

## 🙏 Agradecimientos

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Editor de código
- [xterm.js](https://xtermjs.org/) - Terminal emulator
- [Next.js](https://nextjs.org/) - React framework
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

## 📧 Contacto

- GitHub: [@IagoPL](https://github.com/IagoPL)
- Proyecto: [EDU-IDE](https://github.com/IagoPL/EDU-IDE)

---

## 🌟 Dale una Estrella

Si este proyecto te ha sido útil, considera darle una ⭐ en GitHub!

---

*Última actualización: 7 de octubre de 2025*
