# Prompt para Figma: Diseño UI Nougram

## Contexto del Proyecto

**Aplicación:** Nougram - Plataforma SaaS de gestión de cotizaciones para agencias creativas  
**Sistema de Diseño:** Material Design 3  
**Framework:** Next.js 14+ con Tailwind CSS  
**Objetivo:** Crear un sistema de diseño completo y consistente que mejore la experiencia de usuario

---

## 1. CONFIGURACIÓN INICIAL DE FIGMA

### 1.1 Estructura del Archivo

Crear un archivo Figma con la siguiente estructura de páginas:

```
📄 Design System
  ├── 🎨 Colors
  ├── 📝 Typography
  ├── 📏 Spacing & Layout
  ├── 🎭 Components
  └── 📐 Elevation

📄 Pages
  ├── 🔐 Login
  ├── 📊 Dashboard
  ├── 📁 Projects
  ├── ⚙️ Settings
  └── 📄 Project Detail

📄 Flows
  ├── 🔄 Authentication Flow
  ├── ➕ Create Quote Flow
  ├── ✏️ Edit Project Flow
  └── ⚙️ Settings Navigation Flow
```

### 1.2 Configuración de Grid

- **Grid Base:** 8px
- **Layout Grid:** Columnas de 8px
- **Snap to Grid:** Habilitado
- **Auto Layout:** Habilitado para todos los componentes

---

## 2. SISTEMA DE COLORES

### 2.1 Colores Primarios

Crear un estilo de color para cada nivel de la paleta primaria:

**Primary Palette:**
- `Primary 50`: #E3F2FD (hsl(210, 100%, 97%))
- `Primary 100`: #BBDEFB (hsl(210, 100%, 93%))
- `Primary 200`: #90CAF9 (hsl(210, 100%, 88%))
- `Primary 300`: #64B5F6 (hsl(210, 100%, 82%))
- `Primary 400`: #42A5F5 (hsl(210, 100%, 77%))
- `Primary 500`: #2196F3 (hsl(210, 100%, 72%)) ⭐ **Principal**
- `Primary 600`: #1E88E5 (hsl(210, 100%, 67%))
- `Primary 700`: #1976D2 (hsl(210, 100%, 62%)) ⭐ **Hover/Dark**
- `Primary 800`: #1565C0 (hsl(210, 100%, 57%))
- `Primary 900`: #0D47A1 (hsl(210, 100%, 52%))

**Uso:**
- Primary 500: Botones principales, links activos, elementos destacados
- Primary 700: Estados hover, elementos destacados
- Primary 100: Backgrounds sutiles, estados disabled

### 2.2 Escala de Grises

**Grey Scale:**
- `Grey 50`: #FAFAFA (hsl(0, 0%, 98%)) - Background principal
- `Grey 100`: #F5F5F5 (hsl(0, 0%, 96%)) - Backgrounds secundarios
- `Grey 200`: #EEEEEE (hsl(0, 0%, 93%)) - Borders sutiles
- `Grey 300`: #E0E0E0 (hsl(0, 0%, 88%)) - Borders
- `Grey 400`: #BDBDBD (hsl(0, 0%, 74%)) - Placeholders
- `Grey 500`: #9E9E9E (hsl(0, 0%, 62%)) - Texto secundario
- `Grey 600`: #757575 (hsl(0, 0%, 46%)) - Texto secundario
- `Grey 700`: #616161 (hsl(0, 0%, 38%)) - Texto
- `Grey 800`: #424242 (hsl(0, 0%, 26%)) - Texto principal
- `Grey 900`: #212121 (hsl(0, 0%, 13%)) - Texto principal oscuro

### 2.3 Colores Semánticos

**Success:**
- `Success 50`: #E8F5E9
- `Success 500`: #4CAF50 (hsl(122, 39%, 50%))
- `Success 700`: #388E3C

**Error:**
- `Error 50`: #FFEBEE
- `Error 500`: #F44336 (hsl(4, 90%, 58%))
- `Error 700`: #D32F2F

**Warning:**
- `Warning 50`: #FFF3E0
- `Warning 500`: #FF9800 (hsl(36, 100%, 50%))
- `Warning 700`: #F57C00

**Info:**
- `Info 50`: #E3F2FD
- `Info 500`: #2196F3
- `Info 700`: #1976D2

### 2.4 Organización en Figma

- Crear un frame "Color Palette" con todos los colores
- Convertir cada color en un estilo de color (Color Style)
- Nombrar: `Primary/500`, `Grey/200`, `Success/500`, etc.
- Agregar descripción con valores HSL y uso recomendado

---

## 3. TIPOGRAFÍA

### 3.1 Fuente Base

**Font Family:** Roboto  
**Weights:** 300 (Light), 400 (Regular), 500 (Medium), 700 (Bold)

### 3.2 Escala Tipográfica

Crear estilos de texto para cada nivel:

| Estilo | Tamaño | Line Height | Font Weight | Uso | Nombre en Figma |
|--------|--------|-------------|-------------|-----|-----------------|
| Display | 57px | 64px | 400 | Títulos principales | `Text/Display` |
| Headline | 32px | 40px | 400 | Títulos de sección grandes | `Text/Headline` |
| Title | 20px | 28px | 500 | Títulos de sección | `Text/Title` |
| Body Large | 16px | 24px | 400 | Texto de cuerpo principal | `Text/Body Large` |
| Body | 14px | 20px | 400 | Texto de cuerpo | `Text/Body` |
| Label | 14px | 20px | 500 | Labels de formularios | `Text/Label` |
| Caption | 12px | 16px | 400 | Texto secundario, hints | `Text/Caption` |

### 3.3 Variantes de Color

Para cada estilo de texto, crear variantes con colores:
- `Text/Display/On Primary` (blanco sobre primary)
- `Text/Display/On Surface` (Grey 900)
- `Text/Body/Muted` (Grey 600)
- `Text/Caption/Secondary` (Grey 500)

### 3.4 Organización en Figma

- Crear estilos de texto (Text Styles) para cada combinación
- Nombrar: `Text/[Estilo]/[Color]`
- Agregar descripción con uso recomendado

---

## 4. ESPACIADO Y LAYOUT

### 4.1 Sistema de Espaciado (8px Grid)

Crear componentes de espaciado visual:

**Spacing Tokens:**
- `Spacing XS`: 4px (0.5 * 8px)
- `Spacing SM`: 8px (1 * 8px)
- `Spacing MD`: 16px (2 * 8px)
- `Spacing LG`: 24px (3 * 8px)
- `Spacing XL`: 32px (4 * 8px)
- `Spacing 2XL`: 48px (6 * 8px)
- `Spacing 3XL`: 64px (8 * 8px)

**Crear en Figma:**
- Frame "Spacing System" con rectángulos de cada tamaño
- Etiquetar cada uno con su valor
- Usar como referencia para padding/margin

### 4.2 Breakpoints Responsive

**Breakpoints:**
- Mobile: 0-599px (diseñar a 375px - iPhone)
- Tablet: 600-959px (diseñar a 768px - iPad)
- Desktop: 960px+ (diseñar a 1440px - Desktop estándar)

**Crear frames con constraints:**
- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1440px width

---

## 5. ELEVACIÓN Y SOMBRAS

### 5.1 Niveles de Elevación

Crear estilos de efecto (Effect Styles) para cada nivel:

**Elevation 0:** Sin sombra

**Elevation 1:**
```
Shadow 1: X: 0, Y: 2, Blur: 1, Spread: -1, Color: rgba(0,0,0,0.2)
Shadow 2: X: 0, Y: 1, Blur: 1, Spread: 0, Color: rgba(0,0,0,0.14)
Shadow 3: X: 0, Y: 1, Blur: 3, Spread: 0, Color: rgba(0,0,0,0.12)
```

**Elevation 2:**
```
Shadow 1: X: 0, Y: 3, Blur: 1, Spread: -2, Color: rgba(0,0,0,0.2)
Shadow 2: X: 0, Y: 2, Blur: 2, Spread: 0, Color: rgba(0,0,0,0.14)
Shadow 3: X: 0, Y: 1, Blur: 5, Spread: 0, Color: rgba(0,0,0,0.12)
```

**Elevation 4:**
```
Shadow 1: X: 0, Y: 2, Blur: 4, Spread: -1, Color: rgba(0,0,0,0.2)
Shadow 2: X: 0, Y: 4, Blur: 5, Spread: 0, Color: rgba(0,0,0,0.14)
Shadow 3: X: 0, Y: 1, Blur: 10, Spread: 0, Color: rgba(0,0,0,0.12)
```

**Elevation 8:**
```
Shadow 1: X: 0, Y: 5, Blur: 5, Spread: -3, Color: rgba(0,0,0,0.2)
Shadow 2: X: 0, Y: 8, Blur: 10, Spread: 1, Color: rgba(0,0,0,0.14)
Shadow 3: X: 0, Y: 3, Blur: 14, Spread: 2, Color: rgba(0,0,0,0.12)
```

**Elevation 12:**
```
Shadow 1: X: 0, Y: 7, Blur: 8, Spread: -4, Color: rgba(0,0,0,0.2)
Shadow 2: X: 0, Y: 12, Blur: 17, Spread: 2, Color: rgba(0,0,0,0.14)
Shadow 3: X: 0, Y: 5, Blur: 22, Spread: 4, Color: rgba(0,0,0,0.12)
```

**Elevation 16:**
```
Shadow 1: X: 0, Y: 8, Blur: 10, Spread: -5, Color: rgba(0,0,0,0.2)
Shadow 2: X: 0, Y: 16, Blur: 24, Spread: 2, Color: rgba(0,0,0,0.14)
Shadow 3: X: 0, Y: 6, Blur: 30, Spread: 5, Color: rgba(0,0,0,0.12)
```

**Elevation 24:**
```
Shadow 1: X: 0, Y: 11, Blur: 15, Spread: -7, Color: rgba(0,0,0,0.2)
Shadow 2: X: 0, Y: 24, Blur: 38, Spread: 3, Color: rgba(0,0,0,0.14)
Shadow 3: X: 0, Y: 9, Blur: 46, Spread: 8, Color: rgba(0,0,0,0.12)
```

### 5.2 Uso por Componente

- **Card (default):** Elevation 2
- **Card (hover):** Elevation 8
- **Dialog:** Elevation 24
- **Dropdown:** Elevation 8
- **App Bar (Header):** Elevation 4
- **Button (hover):** Elevation +1 del estado default

---

## 6. COMPONENTES BASE

### 6.1 Button

**Crear componente con variantes:**

**Variantes:**
1. **Contained (Primary)**
   - Background: Primary 500
   - Text: White
   - Border: None
   - Elevation: 0
   - Hover: Primary 700, Elevation 2
   - Active: Primary 800, Elevation 1
   - Disabled: Primary 100, Opacity 38%

2. **Outlined**
   - Background: Transparent
   - Text: Primary 500
   - Border: 2px Primary 500
   - Hover: Primary 50 background
   - Active: Primary 100 background

3. **Text**
   - Background: Transparent
   - Text: Primary 500
   - Border: None
   - Hover: Primary 50 background
   - Active: Primary 100 background

4. **Icon Button**
   - Circular: 40px x 40px
   - Background: Transparent
   - Icon: Primary 500, 24px
   - Hover: Primary 50 background

**Tamaños:**
- Small: Height 36px, Padding 12px 24px, Text: 14px
- Medium (default): Height 40px, Padding 10px 16px, Text: 14px
- Large: Height 44px, Padding 12px 24px, Text: 16px

**Estados a crear:**
- Default
- Hover
- Active
- Disabled
- Loading (con spinner)

**Organización:**
- Componente principal: `Button`
- Variantes: `Contained`, `Outlined`, `Text`, `Icon`
- Estados: `Default`, `Hover`, `Active`, `Disabled`, `Loading`

### 6.2 Input

**Especificación:**

**Default State:**
- Height: 40px
- Padding: 12px 16px
- Border: 1px Grey 300
- Background: White
- Border Radius: 8px (md)
- Text: Body (14px/20px), Grey 900
- Placeholder: Body, Grey 500

**Focus State:**
- Border: 2px Primary 500
- Ring: 2px Primary 500, offset 2px
- Background: White

**Error State:**
- Border: 2px Error 500
- Ring: 2px Error 500
- Text: Error 700

**Disabled State:**
- Border: 1px Grey 300
- Background: Grey 100
- Text: Grey 500
- Opacity: 50%
- Cursor: not-allowed

**Con Label:**
- Label: Text/Label, Grey 700, margin-bottom 8px
- Helper text (opcional): Text/Caption, Grey 600, margin-top 4px
- Error text: Text/Caption, Error 700, margin-top 4px

**Tipos:**
- Text
- Email
- Number
- Password (con icono de mostrar/ocultar)
- Search (con icono de búsqueda)

### 6.3 Card

**Especificación:**

**Default:**
- Background: White
- Border: 1px Grey 200
- Border Radius: 12px (lg)
- Elevation: 2
- Padding: 24px

**Hover (si es clickeable):**
- Elevation: 8
- Cursor: pointer
- Transition: 200ms

**Estructura:**
- **Card Header:**
  - Padding: 24px 24px 16px 24px
  - Title: Text/Title (20px/28px, Medium)
  - Description (opcional): Text/Body, Grey 600, margin-top 4px

- **Card Content:**
  - Padding: 24px
  - Flex: 1

- **Card Footer:**
  - Padding: 16px 24px 24px 24px
  - Border-top: 1px Grey 200 (opcional)

### 6.4 Table

**Especificación:**

**Table Container:**
- Border: 1px Grey 200
- Border Radius: 8px
- Overflow: hidden

**Table Header:**
- Background: Grey 50
- Padding: 16px
- Text: Text/Label, Grey 700
- Border-bottom: 1px Grey 200

**Table Row:**
- Border-bottom: 1px Grey 200
- Hover: Background Grey 50
- Padding: 16px

**Table Cell:**
- Padding: 16px
- Text: Text/Body, Grey 900
- Alignment: Left (default), Right (para números)

**Estados:**
- Default row
- Hover row
- Selected row (Primary 50 background)

### 6.5 Dialog/Modal

**Especificación:**

**Overlay:**
- Background: Black, Opacity 50%
- Backdrop blur: 4px
- Full screen

**Dialog Content:**
- Width: Max 512px (lg)
- Background: White
- Border Radius: 12px
- Elevation: 24
- Padding: 24px
- Centered (horizontal y vertical)

**Dialog Header:**
- Title: Text/Title
- Close button: Icon button, top-right

**Dialog Body:**
- Padding: 24px
- Content: Text/Body

**Dialog Footer:**
- Padding: 24px (top)
- Actions: Buttons alineados a la derecha
- Gap: 8px entre botones

### 6.6 Badge/Chip

**Especificación:**

**Variantes:**
1. **Default:**
   - Background: Grey 100
   - Text: Grey 800
   - Padding: 4px 8px
   - Border Radius: 12px
   - Text: Text/Caption

2. **Primary:**
   - Background: Primary 500
   - Text: White

3. **Success:**
   - Background: Success 500
   - Text: White

4. **Error:**
   - Background: Error 500
   - Text: White

5. **Warning:**
   - Background: Warning 500
   - Text: White

**Tamaños:**
- Small: Height 20px, Padding 4px 8px
- Medium: Height 24px, Padding 6px 12px

### 6.7 Select/Dropdown

**Especificación:**

**Trigger (igual que Input):**
- Height: 40px
- Padding: 12px 16px
- Border: 1px Grey 300
- Background: White
- Icon: Chevron down, Grey 600, 16px

**Dropdown Menu:**
- Background: White
- Border: 1px Grey 200
- Border Radius: 8px
- Elevation: 8
- Padding: 8px
- Min width: 200px

**Option:**
- Padding: 12px 16px
- Text: Text/Body
- Hover: Grey 50 background
- Selected: Primary 50 background, Primary 700 text

### 6.8 Toast/Notification

**Especificación:**

**Container:**
- Position: Top-right
- Max width: 400px
- Gap: 8px entre toasts

**Toast:**
- Background: White
- Border: 1px Grey 200
- Border Radius: 8px
- Elevation: 8
- Padding: 16px
- Min height: 56px

**Variantes:**
- Success: Border-left 4px Success 500
- Error: Border-left 4px Error 500
- Warning: Border-left 4px Warning 500
- Info: Border-left 4px Info 500

**Contenido:**
- Icon: 20px, color según variante
- Message: Text/Body
- Close button: Icon button, 16px

---

## 7. LAYOUT COMPONENTS

### 7.1 Sidebar

**Especificación:**

**Container:**
- Width: 256px (desktop)
- Background: White
- Border-right: 1px Grey 200
- Height: 100vh
- Fixed position

**Header:**
- Height: 64px
- Padding: 16px 24px
- Border-bottom: 1px Grey 200
- Logo/Title: Text/Title, Primary 700

**Navigation:**
- Padding: 16px 8px
- Gap: 4px entre items

**Nav Item:**
- Height: 40px
- Padding: 8px 16px
- Border Radius: 8px
- Text: Text/Body, Grey 700
- Icon: 20px, Grey 600
- Gap: 12px (icon-text)

**Nav Item Active:**
- Background: Primary 500
- Text: White
- Icon: White

**Nav Item Hover:**
- Background: Grey 50

**Sub-items (nested):**
- Padding-left: 40px
- Font size: 14px

### 7.2 Header/App Bar

**Especificación:**

**Container:**
- Height: 64px
- Background: White
- Border-bottom: 1px Grey 200
- Elevation: 4
- Padding: 0 24px
- Fixed top

**Left Section:**
- Title: Text/Title (opcional si no hay sidebar)
- Breadcrumbs (opcional)

**Right Section:**
- Notifications: Icon button con badge
- Profile: Icon button
- Gap: 8px

**User Info:**
- Avatar: 32px circle
- Name: Text/Body, Grey 900
- Role badge: Badge small
- Gap: 8px

### 7.3 Main Layout

**Estructura:**
```
┌─────────────────────────────────────┐
│ Header (64px, fixed)               │
├──────────┬──────────────────────────┤
│          │                          │
│ Sidebar  │ Main Content             │
│ (256px)  │ (flex: 1)                │
│          │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

**Main Content:**
- Padding: 24px
- Max width: 1440px (centered)
- Background: Grey 50

---

## 8. PÁGINAS COMPLETAS

### 8.1 Login Page

**Layout:**
- Full screen, centered
- Background: Grey 50

**Card:**
- Width: 400px
- Max width: 90vw
- Background: White
- Elevation: 8
- Border Radius: 12px
- Padding: 32px

**Contenido:**
- Logo/Title: Text/Headline, centrado, margin-bottom 8px
- Subtitle: Text/Body, Grey 600, centrado, margin-bottom 32px
- Form:
  - Email input
  - Password input
  - Submit button (full width)
  - Error message (si aplica)
- Footer: Link "Forgot password?" (opcional)

**Estados:**
- Default
- Error (con mensaje)
- Loading (botón con spinner)

### 8.2 Dashboard Page

**Layout:**
- Header con título y descripción
- Filtros (card colapsable)
- Grid de KPIs (3 columnas desktop, 2 tablet, 1 mobile)
- Grid de gráficos (2 columnas desktop, 1 mobile)
- Tabla de top clients
- AI Advisor (card full width)

**KPI Card:**
- Elevation: 2
- Padding: 24px
- Header: Icon (24px, Grey 600) + Title (Text/Label)
- Value: Text/Display, bold
- Description: Text/Caption, Grey 600
- Change indicator (opcional): Badge con flecha y porcentaje

**Filter Card:**
- Colapsable
- Grid de inputs (3 columnas desktop)
- Botones: "Apply Filters" (primary), "Clear" (outlined)
- Badge con número de filtros activos

**Chart Cards:**
- Elevation: 2
- Padding: 24px
- Header: Title + Description
- Chart area: Min height 300px
- Placeholder para gráfico

### 8.3 Projects Page

**Layout:**
- Header: Title + "New Quote" button
- Status filters: 5 cards clickeables (All, Draft, Sent, Won, Lost)
- Projects table

**Status Filter Cards:**
- Grid: 5 columnas (desktop)
- Card con:
  - Title: Text/Label
  - Count: Text/Headline, bold
  - Description: Text/Caption
- Active: Border 2px Primary 500
- Hover: Elevation 8

**Projects Table:**
- Columnas: Name, Client, Status, Currency, Created, Actions
- Status: Badge con color según estado
- Actions: Icon buttons (View, Edit, Delete)
- Hover row: Grey 50 background

**Empty State:**
- Icon: 64px, Grey 400
- Message: Text/Body, Grey 600, centrado
- CTA: Button "Create First Project"

### 8.4 Create Quote Page

**Layout:**
- 2 columnas (desktop): Main (2/3) + Sidebar (1/3)

**Main Column:**
- Project Information Card
- Services Card

**Project Information Card:**
- Form fields:
  - Project Name (required)
  - Client Name (required)
  - Client Email (optional)
  - Currency (select)
  - Taxes (checkboxes)

**Services Card:**
- Header: Title + "Add Service" button
- Table de servicios:
  - Service (select)
  - Hours (number input)
  - Actions (delete button)
- Empty state: Mensaje centrado

**Sidebar:**
- Quote Summary Card (sticky)
- Breakdown de items
- Total con impuestos
- Margin indicator (color según porcentaje)
- Action buttons: Cancel, Create Quote

**Estados:**
- Calculating: Spinner en summary
- Low margin: Alert card amarillo
- Ready: Botón habilitado
- Loading: Botón con spinner

### 8.5 Settings Pages

**Layout:**
- Sidebar navigation (left)
- Content area (right)

**Settings Sidebar:**
- Lista de secciones:
  - Costs
  - Team
  - Services
  - Currency
  - Taxes
  - Users & Roles
  - Approvals (con badge si hay pendientes)

**Settings Content:**
- Header: Title + Description
- Table/List de items
- "Add" button (top-right)
- Empty state si no hay items

**Form Modal:**
- Dialog con formulario
- Fields según tipo
- Actions: Cancel, Save

---

## 9. ESTADOS Y VARIACIONES

### 9.1 Estados de Componentes

Para cada componente, crear variantes de:
- Default
- Hover
- Active/Pressed
- Focus
- Disabled
- Loading
- Error (si aplica)

### 9.2 Estados de Página

- Loading: Skeleton screens o spinners
- Empty: Icon + mensaje + CTA
- Error: Icon + mensaje de error + acción
- Success: Toast notification

### 9.3 Responsive Variations

Crear variantes para:
- Mobile (375px)
- Tablet (768px)
- Desktop (1440px)

**Cambios principales:**
- Sidebar: Drawer en mobile
- Grids: 1 columna en mobile
- Tables: Cards en mobile
- Padding: Reducido en mobile

---

## 10. FLUJOS DE USUARIO

### 10.1 Authentication Flow

Crear frames conectados:
1. Login page (default)
2. Login page (error state)
3. Login page (loading state)
4. Dashboard (success)

### 10.2 Create Quote Flow

Crear frames conectados:
1. Projects page → Click "New Quote"
2. Create Quote page (empty)
3. Create Quote page (with services)
4. Create Quote page (low margin warning)
5. Success toast → Redirect to Projects

### 10.3 Edit Project Flow

Crear frames conectados:
1. Projects page → Click project
2. Project detail page
3. Click "Edit"
4. Edit form modal
5. Save → Updated project detail

---

## 11. ESPECIFICACIONES TÉCNICAS

### 11.1 Naming Convention

**Componentes:**
- `Component/Variant/State`
- Ejemplo: `Button/Contained/Default`

**Páginas:**
- `Page/[Page Name]/[State]`
- Ejemplo: `Page/Login/Error`

**Colores:**
- `Color/[Category]/[Shade]`
- Ejemplo: `Color/Primary/500`

### 11.2 Auto Layout

- Usar Auto Layout para todos los componentes
- Padding basado en spacing tokens (8px grid)
- Gap entre elementos: múltiplos de 8px
- Constraints: Left & Top (default)

### 11.3 Component Properties

Usar Component Properties para:
- Variantes (Variant)
- Estados (Boolean)
- Texto (Text)
- Iconos (Instance swap)

### 11.4 Constraints

- Sidebar: Fixed left
- Header: Fixed top
- Content: Center horizontal, top aligned
- Cards: Stretch horizontal

---

## 12. CHECKLIST DE ENTREGABLES

### 12.1 Design System
- [ ] Paleta de colores completa con estilos
- [ ] Tipografía con todos los estilos de texto
- [ ] Sistema de espaciado documentado
- [ ] Elevaciones con estilos de efecto
- [ ] Componentes base (Button, Input, Card, Table, etc.)
- [ ] Componentes de layout (Sidebar, Header)
- [ ] Componentes complejos (Dialog, Select, Toast)

### 12.2 Páginas
- [ ] Login page (todos los estados)
- [ ] Dashboard (con KPIs, gráficos, filtros)
- [ ] Projects list (con filtros y tabla)
- [ ] Create Quote (formulario completo)
- [ ] Project detail
- [ ] Settings pages (todas las secciones)

### 12.3 Flujos
- [ ] Authentication flow
- [ ] Create quote flow
- [ ] Edit project flow
- [ ] Settings navigation flow

### 12.4 Responsive
- [ ] Mobile variants (375px)
- [ ] Tablet variants (768px)
- [ ] Desktop variants (1440px)

### 12.5 Documentación
- [ ] Descripción en cada componente
- [ ] Uso recomendado en notas
- [ ] Especificaciones técnicas en comentarios

---

## 13. RECURSOS ADICIONALES

### 13.1 Iconos

**Librería recomendada:** Lucide Icons (ya usada en el proyecto)

**Iconos principales:**
- LayoutDashboard
- FolderKanban
- Settings
- DollarSign
- Users
- Package
- BarChart3
- Plus
- Edit (Pencil)
- Trash
- Eye
- CheckCircle
- AlertCircle
- Loader (spinner)

**Tamaños:**
- Small: 16px
- Medium: 20px
- Large: 24px

### 13.2 Placeholders

- Avatares: 32px, 40px, 48px circles
- Imágenes: Aspect ratio 16:9
- Gráficos: Placeholder con grid
- Texto: Lorem ipsum para body text

### 13.3 Prototipado

- Conectar frames con prototipos
- Transiciones: Ease in-out, 200ms
- Overlay interactions para modales
- Hover states en componentes interactivos

---

## 14. NOTAS FINALES

1. **Consistencia:** Todos los componentes deben seguir el sistema de diseño
2. **Accesibilidad:** Contraste mínimo 4.5:1 para texto normal
3. **Performance:** Optimizar assets, usar componentes reutilizables
4. **Escalabilidad:** Crear componentes modulares que puedan combinarse
5. **Documentación:** Agregar notas explicativas en componentes complejos

**Objetivo final:** Crear un sistema de diseño completo, consistente y escalable que pueda ser implementado directamente en código siguiendo las especificaciones del PRD.

---

**Fecha de creación:** Diciembre 2025  
**Versión:** 1.0  
**Basado en:** PRD_UX_UI.md
