# 🚀 EduIDE - IDE Educativo Multi-Plataforma

**IDE educativo moderno con asistencia de IA, diseñado para estudiantes y desarrolladores.**

---

## 📁 Estructura del Proyecto

```
edu-ide/
├── frontend/              # ✅ Aplicación Next.js + React
│   ├── app/              # Páginas y rutas
│   ├── components/       # Componentes UI
│   │   ├── ui/          # Componentes base (Button, Card, etc.)
│   │   ├── landing-page.tsx
│   │   ├── ide-layout.tsx
│   │   ├── sidebar.tsx
│   │   ├── toolbar.tsx
│   │   └── monaco-editor.tsx
│   ├── lib/             # Utilidades
│   ├── styles/          # Estilos globales
│   └── package.json
│
├── backend/              # ✅ API Node.js + Express
│   ├── src/
│   │   ├── routes/      # Rutas API
│   │   ├── controllers/ # Controladores
│   │   ├── services/    # Lógica de negocio
│   │   ├── models/      # Modelos de datos
│   │   └── index.ts     # Servidor Express
│   └── package.json
│
├── docs/                 # 📚 Documentación
│   ├── architecture.md
│   ├── features.md
│   ├── technology-stack.md
│   └── development-guide.md
│
└── ejemplo front/        # 🎨 Referencia de diseño
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 15 + React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4 (con colores OKLCH)
- **Editor**: Monaco Editor (motor de VS Code)
- **UI Components**: Radix UI
- **Iconos**: Lucide React
- **Build**: Vite/Next.js

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Build Tool**: tsx
- **API Style**: REST

---

## 🚀 Inicio Rápido

### 1. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

**URL**: http://localhost:3000

### 2. Backend (Express API)

```bash
cd backend
npm install
npm run dev
```

**URL**: http://localhost:3001

---

## ✨ Características Principales

### 🧠 Asistente IA Project Manager
- Chat inteligente integrado
- Análisis automático de código
- Recomendaciones de mejoras
- Planificación de proyectos
- Generación de documentación

### 📝 Editor Multi-Lenguaje
- Syntax highlighting para 50+ lenguajes
- Autocompletado inteligente (IntelliSense)
- Bracket matching
- Code folding
- Multi-cursor editing
- Find & Replace

### 🏗️ Gestión de Proyectos
- Templates predefinidos
- Generación de estructura de directorios
- Configuración automática de entornos
- Gestión de dependencias

### 🔧 Herramientas Integradas
- Terminal integrado
- Git visual interface
- Debugger avanzado
- Testing integrado
- Linting y formateo automático

---

## 🎨 Sistema de Diseño

### Paleta de Colores (OKLCH)
- **Modo Oscuro**: Por defecto, optimizado para programar
- **Gradientes**: Azul-púrpura para elementos destacados
- **Transparencias**: Backdrop blur para profundidad
- **Consistencia**: Variables CSS reutilizables

### Tipografía
- **UI**: Inter (sans-serif)
- **Código**: Fira Code (monospace con ligaduras)

---

## 📡 API Endpoints

### Backend Endpoints

```http
GET /health                 # Health check
GET /api                    # API info
GET /api/projects          # Lista de proyectos
GET /api/files             # Estructura de archivos
POST /api/ai/chat          # Chat con IA
POST /api/ai/analyze       # Análisis de código
POST /api/execute          # Ejecutar código
GET /api/git/status        # Estado de Git
```

---

## 🔐 Variables de Entorno

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=EduIDE
```

### Backend (.env)
```bash
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
DATABASE_URL=postgresql://...
```

---

## 📚 Documentación Completa

- **[Arquitectura](docs/architecture.md)** - Diseño del sistema
- **[Funcionalidades](docs/features.md)** - Lista completa de características
- **[Stack Tecnológico](docs/technology-stack.md)** - Tecnologías utilizadas
- **[Guía de Desarrollo](docs/development-guide.md)** - Cómo desarrollar

---

## 🎯 Roadmap

### ✅ Fase 1: Fundación (Actual)
- [x] Frontend con Next.js
- [x] Backend con Express
- [x] Editor Monaco integrado
- [x] Diseño UI/UX moderno
- [x] Componentes base

### 🔄 Fase 2: Core Features (En progreso)
- [ ] Sistema de proyectos completo
- [ ] Integración con IA (OpenAI/Claude)
- [ ] Terminal funcional
- [ ] Git integration
- [ ] Sistema de archivos

### 📋 Fase 3: Avanzado (Planeado)
- [ ] Debugger integrado
- [ ] Testing framework
- [ ] Colaboración en tiempo real
- [ ] Marketplace de plugins
- [ ] Tutoriales interactivos

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

MIT License - Ver LICENSE para más detalles.

---

## 🙏 Agradecimientos

- Monaco Editor (Microsoft)
- Next.js (Vercel)
- Tailwind CSS
- Radix UI
- Comunidad open source

---

**EduIDE** - Haciendo la programación más accesible para todos 💙

© 2025 EduIDE - Hecho con ❤️ para estudiantes de programación.


