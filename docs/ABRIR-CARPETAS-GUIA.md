# 📁 Guía: Abrir Carpetas del Sistema

## 🎯 Descripción

EduIDE ahora permite **abrir cualquier carpeta de tu sistema** (escritorio, documentos, proyectos, etc.) y trabajar con ella como en VSCode. Incluye explorador de archivos nativo y historial de carpetas recientes.

---

## 🚀 Características

### ✅ **1. File Picker Nativo**
- Explorador de archivos del sistema operativo
- Compatible con Windows, macOS y Linux
- Interfaz nativa de cada SO
- Navegación visual por carpetas

### ✅ **2. Historial de Carpetas Recientes**
- Guarda las últimas 10 carpetas abiertas
- Muestra nombre, ruta y tiempo desde última apertura
- Persistencia en localStorage (se mantiene al cerrar el navegador)
- Acceso rápido con un click
- Eliminar carpetas individuales del historial
- Limpiar todo el historial

### ✅ **3. Validación de Rutas**
- Verifica que la ruta existe
- Verifica que es un directorio (no un archivo)
- Indicadores visuales (verde=válida, rojo=inválida)
- Mensajes de error descriptivos

### ✅ **4. Tres Formas de Abrir Carpetas**
1. **Explorador nativo**: Click en "Buscar carpeta en mi PC"
2. **Carpetas recientes**: Click en cualquier carpeta del historial
3. **Ruta manual**: Escribir y validar la ruta

---

## 📖 Cómo Usar

### **Método 1: Explorador de Archivos Nativo (Recomendado)**

1. Click en **"📁 Abrir Carpeta"** en la barra superior
2. Click en **"🔍 Buscar carpeta en mi PC"**
3. Se abre el explorador de archivos de tu sistema operativo
4. Navega y selecciona la carpeta deseada
5. Click en **"Abrir Carpeta"**
6. ✅ ¡Listo! El explorador se actualiza con los archivos

### **Método 2: Carpetas Recientes**

1. Click en **"📁 Abrir Carpeta"**
2. En la sección **"Carpetas recientes"**:
   - Ver lista de carpetas abiertas anteriormente
   - Muestra: nombre, ruta completa, tiempo desde última apertura
3. Click en cualquier carpeta de la lista
4. ✅ Se abre automáticamente

### **Método 3: Ruta Manual**

1. Click en **"📁 Abrir Carpeta"**
2. En **"O escribe la ruta manualmente"**:
   - Escribe la ruta completa (ej: `C:\Users\Usuario\Desktop\MiProyecto`)
3. Click en **"Validar"** para verificar
4. Si es válida (✅ verde), click en **"Abrir Carpeta"**

---

## 💻 Ejemplos de Rutas

### **Windows:**
```
C:\Users\Usuario\Desktop\MiProyecto
C:\Users\Usuario\Documents\proyectos\react-app
D:\Desarrollo\mi-app
F:\edu-ide
```

### **macOS:**
```
/Users/usuario/Desktop/MiProyecto
/Users/usuario/Documents/proyectos/react-app
~/proyectos/mi-app
```

### **Linux:**
```
/home/usuario/proyectos/mi-app
/home/usuario/Desktop/proyecto
~/Documents/desarrollo/app
```

---

## 🎨 UI y Experiencia de Usuario

### **Diálogo "Abrir Carpeta"**

```
┌─────────────────────────────────────────────┐
│ 📁 Abrir Carpeta                            │
├─────────────────────────────────────────────┤
│                                             │
│ ⏰ Carpetas recientes           [Limpiar]   │
│ ┌─────────────────────────────────────────┐ │
│ │ 📁 mi-proyecto                    Hace 5min │
│ │    C:\Users\User\Desktop\mi-proyecto    │ │
│ │                                     [×] │ │
│ ├─────────────────────────────────────────┤ │
│ │ 📁 react-app                   Hace 1h  │ │
│ │    D:\Desarrollo\react-app          [×] │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Explorador de archivos                      │
│ [🔍 Buscar carpeta en mi PC]                │
│                                             │
│ O escribe la ruta manualmente               │
│ [C:\Users\User\Desktop\proyecto] [Validar]  │
│ ✅ Ruta válida                              │
│                                             │
│               [Cancelar] [Abrir Carpeta]    │
└─────────────────────────────────────────────┘
```

### **Indicadores Visuales**

- 🟢 **Verde**: Ruta válida, lista para abrir
- 🔴 **Rojo**: Ruta inválida o no existe
- ⚪ **Gris**: Sin validar aún
- 📁 **Icono azul**: Carpeta en historial
- ⏰ **Clock**: Sección de recientes
- 🔍 **Lupa**: Botón de explorador
- ❌ **X**: Eliminar del historial (aparece al hover)

---

## 🔧 Arquitectura Técnica

### **Backend (Node.js/Express)**

#### **Endpoints:**

```typescript
// POST /api/files/workspace
// Cambiar el workspace actual
{
  path: string  // Ruta de la carpeta
}
// Retorna: { success: true, data: { path: string } }

// POST /api/files/validate-path
// Validar si una ruta es válida
{
  path: string
}
// Retorna: { success: true, data: { valid: boolean, reason?: string } }

// POST /api/files/open-file-picker
// Abrir explorador de archivos nativo
{
  defaultPath?: string  // Ruta inicial (opcional)
}
// Retorna: { success: true, data: { path?: string, cancelled: boolean } }
```

#### **Comandos por SO:**

**Windows (PowerShell):**
```powershell
Add-Type -AssemblyName System.Windows.Forms
$browser = New-Object System.Windows.Forms.FolderBrowserDialog
$browser.ShowDialog()
```

**macOS (osascript):**
```bash
osascript -e 'POSIX path of (choose folder with prompt "Selecciona una carpeta")'
```

**Linux (zenity/kdialog):**
```bash
zenity --file-selection --directory
# o
kdialog --getexistingdirectory
```

---

### **Frontend (React/Next.js)**

#### **Hook: `useRecentFolders`**

```typescript
interface RecentFolder {
  path: string        // Ruta completa
  name: string        // Nombre de la carpeta
  lastOpened: number  // Timestamp
}

const {
  recentFolders,          // Array de carpetas recientes
  addRecentFolder,        // Agregar carpeta al historial
  removeRecentFolder,     // Eliminar carpeta del historial
  clearRecentFolders      // Limpiar todo el historial
} = useRecentFolders()
```

#### **Persistencia:**

- **Storage Key**: `eduide-recent-folders`
- **Ubicación**: `localStorage`
- **Formato**: JSON array de `RecentFolder[]`
- **Límite**: 10 carpetas máximo
- **Orden**: Más reciente primero

---

## 📊 Flujo de Trabajo

### **Flujo Completo: Abrir con File Picker**

```
1. Usuario: Click "Abrir Carpeta"
   ↓
2. Diálogo se abre
   ↓
3. Usuario: Click "Buscar carpeta en mi PC"
   ↓
4. Frontend: POST /api/files/open-file-picker
   ↓
5. Backend: Ejecuta comando del SO (PowerShell/osascript/zenity)
   ↓
6. SO: Muestra diálogo nativo
   ↓
7. Usuario: Selecciona carpeta y confirma
   ↓
8. Backend: Retorna ruta seleccionada
   ↓
9. Frontend: Actualiza input con ruta
   ↓
10. Frontend: POST /api/files/workspace con ruta
   ↓
11. Backend: Cambia workspace
   ↓
12. Frontend: 
    - Agrega a historial (localStorage)
    - Recarga explorador de archivos
    - Muestra toast de confirmación
    ✅ ¡Carpeta abierta!
```

### **Flujo Simplificado: Carpeta Reciente**

```
1. Usuario: Click en carpeta del historial
   ↓
2. Frontend: POST /api/files/workspace
   ↓
3. Backend: Cambia workspace
   ↓
4. Frontend: 
   - Actualiza timestamp en historial
   - Recarga explorador
   ✅ ¡Listo!
```

---

## 🎯 Casos de Uso

### **Caso 1: Abrir Proyecto Nuevo**
```
Escenario: Tienes un proyecto en C:\mis-proyectos\mi-react-app
Pasos:
1. Click "Abrir Carpeta"
2. Click "Buscar carpeta en mi PC"
3. Navegar a C:\mis-proyectos
4. Seleccionar "mi-react-app"
5. Confirmar
Resultado: ✅ Explorador muestra archivos del proyecto
```

### **Caso 2: Cambiar entre Proyectos**
```
Escenario: Alternar entre proyecto A y proyecto B
Pasos:
1. Trabajas en proyecto A
2. Click "Abrir Carpeta" → Recientes → Proyecto B
3. Archivos de A se cierran, explorador muestra B
4. Cuando quieras volver: Recientes → Proyecto A
Resultado: ✅ Cambio rápido sin navegar carpetas
```

### **Caso 3: Limpiar Historial**
```
Escenario: Tienes carpetas obsoletas en recientes
Pasos:
1. Click "Abrir Carpeta"
2. Hover sobre carpeta obsoleta → Click X
   O
   Click "Limpiar" para eliminar todas
Resultado: ✅ Historial actualizado
```

---

## 🐛 Manejo de Errores

### **Errores Comunes y Soluciones:**

| Error | Causa | Solución |
|-------|-------|----------|
| "Path does not exist" | Ruta no existe | Verificar escritura, usar explorador |
| "Path is not a directory" | Es un archivo, no carpeta | Seleccionar carpeta, no archivo |
| "Error al abrir el explorador" | Falta dependencia del SO | Windows: OK, Linux: instalar zenity/kdialog |
| Carpeta no se recarga | Cache | Recargar página (F5) |

### **Validaciones Implementadas:**

✅ Ruta no vacía  
✅ Ruta existe en el sistema  
✅ Ruta es un directorio (no archivo)  
✅ Permisos de lectura  

---

## 💡 Tips y Trucos

### **1. Acceso Rápido**
- Las carpetas recientes se guardan automáticamente
- No necesitas buscar la misma carpeta dos veces
- El historial persiste entre sesiones

### **2. Validación Preventiva**
- Usa el botón "Validar" antes de abrir
- Evita errores de rutas incorrectas
- Indicador verde = ruta OK

### **3. Explorador Nativo**
- Más rápido que escribir rutas
- Sin errores de escritura
- Navegación visual

### **4. Historial Inteligente**
- Máximo 10 carpetas
- Más recientes primero
- Timestamps relativos ("Hace 5 min")

---

## 📝 Archivos Relacionados

```
Backend:
├── backend/src/routes/files.ts          (+60 líneas)
│   ├── POST /workspace
│   ├── POST /validate-path
│   └── POST /open-file-picker

Frontend:
├── frontend/lib/api.ts                  (+7 líneas)
│   ├── setWorkspace()
│   ├── validatePath()
│   └── openFilePicker()
├── frontend/hooks/use-recent-folders.ts (NUEVO, 71 líneas)
│   └── Hook para historial de carpetas
├── frontend/components/open-folder-dialog.tsx (351 líneas)
│   └── Diálogo completo con todas las funcionalidades
├── frontend/components/toolbar.tsx       (+15 líneas)
│   └── Botón "Abrir Carpeta"
└── frontend/components/ide-layout.tsx    (+11 líneas)
    └── Lógica de recarga de workspace
```

---

## 🚀 Próximas Mejoras Sugeridas

1. **Favoritos**: Marcar carpetas favoritas con estrella
2. **Proyectos**: Guardar configuración específica por carpeta
3. **Drag & Drop**: Arrastrar carpeta desde explorador de Windows
4. **Iconos**: Iconos diferentes según tipo de proyecto (React, Node, etc.)
5. **Búsqueda**: Buscar en historial de carpetas
6. **Categorías**: Agrupar por tipo de proyecto o fecha

---

## 🎉 ¡Pruébalo Ahora!

1. Inicia el IDE: `http://localhost:3000/ide`
2. Click en **"📁 Abrir Carpeta"** en la barra superior
3. Elige tu método preferido:
   - 🔍 Explorador nativo
   - ⏰ Carpeta reciente
   - ⌨️ Ruta manual

**¡Disfruta trabajando con tus propios proyectos en EduIDE!** 🚀

