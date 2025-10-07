# 📦 Guía de Instalación de EduIDE

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js** 18 o superior
- **npm** 9 o superior
- **Git** (opcional)

### Instalación Completa

```bash
# 1. Clonar o descargar el proyecto
cd F:\edu-ide

# 2. Instalar dependencias de todo el proyecto
npm run install:all

# 3. Iniciar en modo desarrollo (ambos servicios)
npm run dev
```

Esto iniciará:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

---

## 📝 Instalación Manual (Paso a Paso)

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

**Resultado**: Frontend corriendo en http://localhost:3000

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

**Resultado**: Backend corriendo en http://localhost:3001

---

## 🔧 Solución de Problemas

### Error: Puerto en uso

Si el puerto 3000 o 3001 está ocupado:

```bash
# Windows - Encontrar proceso
netstat -ano | findstr :3000

# Matar proceso (reemplaza PID)
taskkill /PID <numero> /F
```

### Error: Módulos no encontrados

```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: TypeScript

```bash
# Reinstalar TypeScript
npm install -D typescript@latest
```

---

## 🎯 Verificar Instalación

### Frontend
Abre http://localhost:3000 y deberías ver:
- Página de inicio con gradientes
- Navegación funcional
- Botones "Comenzar" y "Abrir IDE"

### Backend
Abre http://localhost:3001/health y deberías ver:
```json
{
  "status": "ok",
  "message": "EduIDE Backend is running"
}
```

---

## 🚀 Despliegue en Producción

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Subir a Vercel
```

### Backend (Heroku/Railway/Render)

```bash
cd backend
npm run build
npm start
```

---

## 📦 Scripts Disponibles

### Raíz del Proyecto

```bash
npm run dev              # Iniciar frontend + backend
npm run build            # Build de todo
npm run install:all      # Instalar todas las dependencias
```

### Frontend

```bash
npm run dev              # Desarrollo
npm run build            # Build producción
npm run start            # Servidor producción
npm run lint             # Linting
```

### Backend

```bash
npm run dev              # Desarrollo con hot reload
npm run build            # Compilar TypeScript
npm run start            # Servidor producción
```

---

## ✅ Checklist de Instalación

- [ ] Node.js 18+ instalado
- [ ] Dependencias del frontend instaladas
- [ ] Dependencias del backend instaladas
- [ ] Frontend corriendo en :3000
- [ ] Backend corriendo en :3001
- [ ] Sin errores en consola
- [ ] Página carga correctamente

---

¡Listo para programar! 🎉

