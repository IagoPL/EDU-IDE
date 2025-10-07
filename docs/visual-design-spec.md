# EduIDE - Especificación de Diseño Visual

## 🎨 Sistema de Diseño Basado en el Ejemplo

### **1. Paleta de Colores (OKLCH)**

#### Modo Claro
- `--background`: oklch(1 0 0) - Blanco puro
- `--foreground`: oklch(0.145 0 0) - Negro oscuro
- `--primary`: oklch(0.205 0 0) - Negro profundo
- `--muted`: oklch(0.97 0 0) - Gris muy claro
- `--border`: oklch(0.922 0 0) - Gris claro
- `--card`: oklch(1 0 0) - Blanco

#### Modo Oscuro
- `--background`: oklch(0.145 0 0) - Negro oscuro
- `--foreground`: oklch(0.985 0 0) - Blanco claro
- `--primary`: oklch(0.985 0 0) - Blanco
- `--muted`: oklch(0.269 0 0) - Gris oscuro
- `--border`: oklch(0.269 0 0) - Gris oscuro
- `--card`: oklch(0.145 0 0) - Negro oscuro

#### Colores de Sidebar
- `--sidebar`: oklch(0.205 0 0) en dark
- `--sidebar-primary`: oklch(0.488 0.243 264.376) - Azul/Púrpura
- `--sidebar-accent`: oklch(0.269 0 0)

### **2. Tipografía**
- **Sans**: Inter (para UI)
- **Mono**: Fira Code (para código)
- **Tamaños**: sm, base, lg con line-heights específicos

### **3. Componentes Clave**

#### **Botones**
- Variantes: default, ghost, outline, secondary
- Tamaños: sm, default, lg, icon
- Efectos: transition-all, hover states, focus rings
- Estados: disabled con opacity-50

#### **Cards**
- Background: `bg-card/95` con backdrop-blur
- Bordes: `border-border` sutiles
- Hover: `hover:shadow-lg hover:shadow-primary/5`
- Transición: `transition-all`

#### **Sidebar**
- Width: 64 (256px)
- Background: `bg-card/95 backdrop-blur-sm`
- Bordes: `border-r border-border`
- Tabs: Con iconos, border-b-2 cuando activos

#### **Toolbar**
- Height: 12 (48px)
- Background: `bg-card/95 backdrop-blur-sm`
- Secciones: Left, Center, Right
- Separadores: `h-6 w-px bg-border`

### **4. Efectos Visuales**

#### **Gradientes**
- Títulos: `from-blue-500 via-purple-600 to-blue-500`
- Fondos: `from-background via-background to-secondary/20`
- Cards especiales: `from-blue-500/10 via-purple-500/10 to-pink-500/10`

#### **Backdrop Blur**
- Toolbars y Sidebar: `backdrop-blur-sm`
- Cards: `bg-card/95` (95% opacidad)

#### **Sombras**
- Cards hover: `hover:shadow-lg hover:shadow-primary/5`
- Elevación: shadow-xs, shadow-sm, shadow-lg

#### **Transiciones**
- Todo: `transition-all`
- Duración implícita por Tailwind (150-200ms)
- Transform: `hover:scale-105` para cards interactivos

### **5. Layout Structure**

```
┌─────────────────────────────────────────────────────────────┐
│  Toolbar (h-12, bg-card/95, backdrop-blur)                  │
├────────────┬──────────────────────────────┬──────────────────┤
│  Sidebar   │      Editor Area             │   Right Panel    │
│  (w-64)    │      (flex-1)                │   (w-80)         │
│            │                              │                  │
│  bg-card/95│      bg-background           │   bg-card/95     │
│  backdrop  │                              │   backdrop       │
│            │                              │                  │
├────────────┴──────────────────────────────┴──────────────────┤
│  Status Bar (h-auto, bg-card/95)                            │
└─────────────────────────────────────────────────────────────┘
```

### **6. Página de Inicio**

#### **Hero Section**
- Badge: Rounded-full con icon y texto
- Título: Gradiente azul-púrpura, text-5xl md:text-7xl
- Descripción: text-muted-foreground, text-lg
- Botones: size-lg con iconos

#### **Features Grid**
- Grid: md:grid-cols-2 lg:grid-cols-3
- Cards: Con iconos coloridos (h-8 w-8)
- Hover effects: hover:shadow-lg

#### **Quick Actions**
- Cards coloridos con gradientes sutiles
- Badges de lenguaje
- Hover: hover:scale-105

### **7. Interactividad**

#### **Focus States**
- Ring: `focus-visible:ring-ring/50`
- Ring width: `focus-visible:ring-[3px]`
- Outline: `outline-none`

#### **Hover States**
- Botones: `hover:bg-accent hover:text-accent-foreground`
- Cards: `hover:shadow-lg`
- Iconos: Cambio de color sutil

#### **Active States**
- Border indicator: `border-l-2 border-primary`
- Background: `bg-secondary/50`

### **8. Responsive Design**

#### **Breakpoints**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

#### **Mobile Adaptations**
- Sidebar: Colapsable/overlay
- Toolbar: Iconos sin texto
- Grid: Colapsa a single column

### **9. Espaciado Consistente**

- Padding interno: p-2, p-4
- Gap entre elementos: gap-2, gap-4
- Margins: mb-2, mb-4, mb-12

### **10. Bordereo Radios**

- Default: `rounded-md`
- Large: `rounded-lg`
- XL: `rounded-xl`
- Full: `rounded-full` (badges)
- Custom: var(--radius) = 0.625rem

## 📝 Notas de Implementación

1. Usar `cn()` utility para combinar clases
2. Usar OKLCH para todos los colores
3. Backdrop blur para transparencias
4. Gradientes para títulos principales
5. Consistencia en tamaños de iconos (h-4 w-4)
6. Transiciones suaves en todo
7. Focus visible states obligatorios
8. Dark mode por defecto

