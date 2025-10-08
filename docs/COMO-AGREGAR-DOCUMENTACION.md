# 📚 Cómo Agregar Documentación Personalizada a EduIDE

## 🎯 Visión General

El sistema de documentación de EduIDE está diseñado para:
1. ✅ Mostrar enlaces a documentación oficial (YA IMPLEMENTADO)
2. ✅ Recomendar recursos según el archivo activo (YA IMPLEMENTADO)
3. 🔄 Agregar tu propia documentación personalizada (PREPARADO PARA TI)

---

## 📖 Sistema Actual (Implementado)

### **Recursos Disponibles:**

#### **Lenguajes:**
- 📘 JavaScript (MDN + JavaScript.info)
- 📘 TypeScript (Official Handbook)
- 🐍 Python (Official Docs + Tutorial)
- ☕ Java (Official Docs)
- ⚙️ C/C++ (CPP Reference)
- 🌐 HTML (MDN)
- 🎨 CSS (MDN)

#### **Frameworks:**
- ⚛️ React (Official Docs)
- 💚 Vue.js (Official Docs)
- 🅰️ Angular (Official Docs)
- 🟢 Node.js (Official Docs)
- 🚂 Express (Official Docs)
- ▲ Next.js (Official Docs)
- 🎸 Django (Official Docs)

#### **Herramientas:**
- 📦 Git (Official Docs + Pro Git Book)

#### **Comunidad:**
- 💬 Stack Overflow
- 🐙 GitHub

---

## 🔧 Cómo Funciona el Sistema

### **1. Recomendaciones Inteligentes**

El sistema detecta automáticamente el tipo de archivo y recomienda recursos:

```typescript
// Ejemplo: app.tsx
Detecta:
- Extensión: .tsx → TypeScript + React
- Recomienda:
  1. TypeScript Handbook
  2. React Documentation
  3. MDN JavaScript
```

### **2. Estructura de Recursos**

Cada recurso tiene:

```typescript
interface DocResource {
  id: string;              // Identificador único
  title: string;           // "React Documentation"
  description: string;     // "Documentación oficial de React"
  url: string;            // "https://react.dev/"
  category: string;       // official/tutorial/reference/course/community
  language?: string;      // "javascript", "python", etc.
  framework?: string;     // "react", "vue", etc.
  tags: string[];         // ["react", "componentes", "hooks"]
  icon?: string;          // "⚛️"
}
```

### **3. Categorías**

Los recursos se organizan en:
- 💻 **Lenguajes de Programación**
- 🔧 **Frameworks y Librerías**
- 🛠️ **Herramientas y Utilidades**
- 👥 **Comunidad y Recursos**

---

## 📝 Cómo Agregar Tu Propia Documentación

### **Opción 1: Agregar Enlaces a Recursos Externos**

Edita: `backend/src/services/DocumentationService.ts`

```typescript
// En el constructor, agrega tus recursos:

// Ejemplo: Agregar Svelte
this.addResource('svelte', {
  id: 'svelte-docs',
  title: 'Svelte Documentation',
  description: 'Documentación oficial de Svelte',
  url: 'https://svelte.dev/docs',
  category: 'official',
  framework: 'svelte',
  tags: ['svelte', 'reactive', 'compiler'],
  icon: '🔥'
});

// Ejemplo: Agregar tutorial de Redux
this.addResource('redux', {
  id: 'redux-tutorial',
  title: 'Redux Essentials',
  description: 'Tutorial oficial de Redux',
  url: 'https://redux.js.org/tutorials/essentials/part-1-overview-concepts',
  category: 'tutorial',
  framework: 'redux',
  tags: ['redux', 'state-management', 'react'],
  icon: '💜'
});

// Ejemplo: Agregar curso de tu autoría
this.addResource('javascript', {
  id: 'mi-curso-js',
  title: 'Mi Curso de JavaScript',
  description: 'Curso completo desde cero hasta avanzado',
  url: 'https://mi-sitio.com/curso-javascript',
  category: 'course',
  language: 'javascript',
  tags: ['javascript', 'curso', 'completo', 'español'],
  icon: '🎓'
});
```

### **Opción 2: Crear Sistema de Documentación Interna** (Futuro)

Para documentación personalizada **dentro del IDE** (no enlaces externos):

#### **Estructura sugerida:**

```
backend/
  docs/
    javascript/
      fundamentos.md
      arrays.md
      async-await.md
    react/
      componentes.md
      hooks.md
      estado.md
    python/
      fundamentos.md
      listas.md
      diccionarios.md
```

#### **Implementación (cuando la crees):**

1. **Backend: Leer archivos Markdown**

```typescript
// backend/src/services/DocumentationService.ts

async getInternalDoc(language: string, topic: string): Promise<string> {
  const docPath = path.join(__dirname, '..', 'docs', language, `${topic}.md`);
  
  if (!existsSync(docPath)) {
    throw new Error('Documentation not found');
  }
  
  const content = readFileSync(docPath, 'utf-8');
  return content; // Markdown content
}
```

2. **Frontend: Renderizar Markdown**

Instalar: `npm install react-markdown`

```typescript
// frontend/components/doc-viewer.tsx
import ReactMarkdown from 'react-markdown';

export function DocViewer({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-invert">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
```

3. **Integrar en DocumentationPanel**

```typescript
const [internalDoc, setInternalDoc] = useState<string | null>(null);

const loadInternalDoc = async (language: string, topic: string) => {
  const response = await api.getInternalDoc(language, topic);
  if (response.success) {
    setInternalDoc(response.data.content);
  }
};

// En el render:
{internalDoc && <DocViewer content={internalDoc} />}
```

---

## 🎨 Ideas de Contenido para Tu Documentación

### **1. Tutoriales Paso a Paso**
```markdown
# Crear tu Primera Aplicación React

## Paso 1: Setup
1. Crear proyecto con...
2. Instalar dependencias...

## Paso 2: Componentes
...
```

### **2. Snippets de Código Comunes**
```markdown
# Snippets Útiles de JavaScript

## Array Map
```js
const doubled = numbers.map(n => n * 2);
```

## Async/Await
```js
async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}
```
```

### **3. Patrones de Diseño**
```markdown
# Singleton Pattern

## ¿Qué es?
Un patrón que asegura que solo exista una instancia...

## Implementación
```js
class Singleton {
  static instance;
  
  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}
```

## Cuándo usar
- Base de datos
- Logger
- Configuración
```

### **4. Cheat Sheets**
```markdown
# Git Cheat Sheet

## Comandos Básicos
- `git init` - Inicializar repo
- `git add .` - Agregar todo
- `git commit -m "msg"` - Commit
- `git push` - Subir cambios

## Branching
- `git branch nombre` - Crear branch
- `git checkout nombre` - Cambiar branch
- `git merge nombre` - Mergear branch
```

### **5. Best Practices**
```markdown
# React Best Practices

## 1. Nombres de Componentes
✅ BIEN: `UserProfile.tsx`
❌ MAL: `userprofile.tsx`

## 2. Props Destructuring
✅ BIEN: `function MyComponent({ name, age })`
❌ MAL: `function MyComponent(props)`

## 3. Key en Lists
✅ BIEN: `{items.map(item => <div key={item.id}>)}`
❌ MAL: `{items.map((item, index) => <div key={index}>)}`
```

---

## 🚀 Roadmap de Documentación

### **Fase 1: Enlaces Externos** ✅ (COMPLETADO)
- ✅ Recursos a docs oficiales
- ✅ Recomendaciones inteligentes
- ✅ Categorización
- ✅ Búsqueda por tags

### **Fase 2: Documentación Interna** 🔄 (TÚ LO HARÁS)
- [ ] Archivos Markdown organizados por tema
- [ ] Renderizador Markdown con syntax highlighting
- [ ] Navegación entre docs
- [ ] Índice y tabla de contenidos
- [ ] Búsqueda en contenido

### **Fase 3: Contenido Interactivo** 🔮 (FUTURO)
- [ ] Code playgrounds embebidos
- [ ] Ejercicios con validación
- [ ] Videos tutoriales
- [ ] Quizzes interactivos
- [ ] Proyectos guiados paso a paso

---

## 📂 Estructura Recomendada para Tus Docs

```
backend/
  docs/
    README.md              # Índice general
    
    javascript/
      README.md            # Índice de JavaScript
      fundamentos/
        variables.md
        funciones.md
        objetos.md
        arrays.md
      avanzado/
        closures.md
        async-await.md
        promises.md
      
    react/
      README.md
      basico/
        componentes.md
        props.md
        estado.md
      hooks/
        useState.md
        useEffect.md
        custom-hooks.md
      
    python/
      README.md
      fundamentos/
        variables.md
        listas.md
        diccionarios.md
      avanzado/
        decoradores.md
        generadores.md
        
    patrones/
      README.md
      creacionales/
        singleton.md
        factory.md
      estructurales/
        decorator.md
        adapter.md
        
    algoritmos/
      README.md
      ordenamiento/
        bubble-sort.md
        quick-sort.md
      busqueda/
        binary-search.md
```

---

## 💡 Plantilla de Documento

```markdown
# [Título del Tema]

## 📋 Descripción
Breve explicación de qué es y para qué sirve.

## 🎯 ¿Cuándo usar?
- Caso de uso 1
- Caso de uso 2

## 💻 Sintaxis Básica

```[lenguaje]
// Código de ejemplo
```

## 📖 Ejemplo Completo

```[lenguaje]
// Ejemplo funcional completo
```

## ⚠️ Errores Comunes

### Error 1: [Nombre del error]
**Problema:**
```[lenguaje]
// Código incorrecto
```

**Solución:**
```[lenguaje]
// Código correcto
```

## 🔗 Referencias
- [Link a recurso externo]
- [Link a otro doc interno]

## 🎯 Ejercicio Práctico

**Tarea:** [Descripción del ejercicio]

**Pistas:**
1. Pista 1
2. Pista 2

**Solución:** (collapse/spoiler)
```[lenguaje]
// Solución
```
```

---

## 🎨 Personalización del Panel

Para cambiar el diseño del panel de documentación:

**Archivo:** `frontend/components/documentation-panel.tsx`

**Puedes modificar:**
- Colores de categorías
- Layout de las cards
- Información mostrada
- Filtros adicionales
- Sistema de favoritos

---

## 📊 Estadísticas Actuales

```
Recursos totales:        ~20
Lenguajes cubiertos:     8
Frameworks cubiertos:    7
Categorías:             4
```

---

## 🚀 Próximos Pasos Sugeridos

1. **Crear carpeta `/backend/docs/`**
2. **Escribir primeros tutoriales en Markdown**
3. **Agregar endpoint para leer archivos Markdown**
4. **Instalar `react-markdown` en frontend**
5. **Crear componente `DocViewer` con renderizado**
6. **Agregar navegación entre docs**
7. **Implementar búsqueda en contenido**

---

## 💡 Recursos Útiles para Crear Contenido

### **Markdown:**
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)

### **Code Snippets:**
- [Carbon](https://carbon.now.sh/) - Generar imágenes de código
- [Ray.so](https://ray.so/) - Code screenshots bonitos

### **Diagramas:**
- [Mermaid](https://mermaid.js.org/) - Diagramas en Markdown
- [Excalidraw](https://excalidraw.com/) - Diagramas dibujados a mano

---

## 🎯 Ejemplo: Agregar Curso Completo de JavaScript

### **1. Crear estructura:**

```bash
mkdir -p backend/docs/cursos/javascript-desde-cero
```

### **2. Crear índice:**

```markdown
# JavaScript Desde Cero

## Módulo 1: Fundamentos
1. [Variables y Tipos de Datos](./modulo-1/variables.md)
2. [Operadores](./modulo-1/operadores.md)
3. [Condicionales](./modulo-1/condicionales.md)

## Módulo 2: Funciones
1. [Declaración de Funciones](./modulo-2/funciones.md)
2. [Arrow Functions](./modulo-2/arrow-functions.md)

## Módulo 3: Objetos y Arrays
...
```

### **3. Crear lecciones:**

```markdown
# Variables y Tipos de Datos

## 📝 Variables en JavaScript

JavaScript tiene 3 formas de declarar variables:

### var (obsoleta)
```js
var nombre = "Juan";
```

### let (moderna)
```js
let edad = 25;
edad = 26; // Se puede reasignar
```

### const (recomendada)
```js
const PI = 3.14159;
// PI = 3.14; // ❌ Error: no se puede reasignar
```

## 🎯 Ejercicio

Crea una función que...
```

### **4. Agregar al servicio:**

```typescript
// backend/src/services/DocumentationService.ts

this.addResource('cursos', {
  id: 'curso-js-cero',
  title: 'JavaScript Desde Cero',
  description: 'Curso completo de JavaScript para principiantes',
  url: '/docs/cursos/javascript-desde-cero', // Ruta interna
  category: 'course',
  language: 'javascript',
  tags: ['javascript', 'curso', 'principiantes', 'español'],
  icon: '🎓'
});
```

---

## 🎉 Beneficios de Documentación Interna

1. **Offline**: Funciona sin internet
2. **Personalizada**: Adaptada a tu audiencia
3. **Integrada**: Dentro del IDE, sin cambiar de ventana
4. **Interactiva**: Con ejercicios y validación
5. **Contextual**: Aparece según lo que estás programando

---

## 📞 Soporte

Si necesitas ayuda para:
- Estructurar tu contenido
- Implementar features adicionales
- Agregar interactividad
- Integrar videos o recursos externos

Consulta la documentación o abre un issue en GitHub.

---

**¡El sistema está listo para que agregues tu contenido educativo!** 🚀

