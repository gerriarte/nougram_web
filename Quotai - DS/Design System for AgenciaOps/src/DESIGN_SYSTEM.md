# AgenciaOps Design System

## Overview

AgenciaOps is a complete SaaS platform for managing creative agency quotes, built with **Material Design 3** principles using React, Next.js, and Tailwind CSS.

---

## 🎨 Design System

### Color Palette

#### Primary Colors (Blue)
- **Primary 50-900**: HSL-based blue palette from light (#E3F2FD) to dark (#0D47A1)
- **Primary 500**: Main brand color `hsl(210, 100%, 72%)` - Used for buttons, links, highlights
- **Primary 700**: Dark variant `hsl(210, 100%, 62%)` - Used for hover states

#### Grey Scale
- **Grey 50-900**: Neutral palette for backgrounds, text, and borders
- **Grey 50**: `hsl(0, 0%, 98%)` - Main background
- **Grey 900**: `hsl(0, 0%, 13%)` - Primary text

#### Semantic Colors
- **Success**: Green palette for positive actions and states
- **Error**: Red palette for errors and destructive actions
- **Warning**: Orange palette for warnings and cautions
- **Info**: Blue palette for informational messages

### Typography

Based on Material Design 3 type scale:

| Style | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| Display | 57px | 64px | 400 | Hero titles |
| Headline | 32px | 40px | 400 | Section headers |
| Title | 20px | 28px | 500 | Card titles |
| Body Large | 16px | 24px | 400 | Primary content |
| Body | 14px | 20px | 400 | Default text |
| Label | 14px | 20px | 500 | Form labels |
| Caption | 12px | 16px | 400 | Helper text |

### Spacing System (8px Grid)

- **XS**: 4px (0.5 × 8)
- **SM**: 8px (1 × 8)
- **MD**: 16px (2 × 8)
- **LG**: 24px (3 × 8)
- **XL**: 32px (4 × 8)
- **2XL**: 48px (6 × 8)
- **3XL**: 64px (8 × 8)

### Elevation System

Material Design shadow levels:

- **Elevation 0**: No shadow (flat surfaces)
- **Elevation 1**: Subtle depth (raised cards)
- **Elevation 2**: Default cards
- **Elevation 4**: App bar / header
- **Elevation 8**: Dropdowns, hover states
- **Elevation 12**: FABs
- **Elevation 16**: Navigation drawers
- **Elevation 24**: Dialogs, modals

---

## 🧩 Components

### Layout Components

#### AppSidebar
- Fixed left sidebar (256px width)
- Navigation items with active states
- User profile section at bottom
- Uses Primary 500 for active states

#### AppHeader
- Fixed top header (64px height)
- Search and notifications
- User profile with avatar
- White background with subtle shadow

#### AppLayout
- Main layout wrapper
- Combines sidebar + header
- Content area with max-width constraint
- Responsive padding

### UI Components

#### KPICard
- Display key metrics
- Icon, value, and description
- Optional trend indicator (up/down)
- Elevation 2 shadow

#### StatusBadge
- Color-coded status labels
- Supports: draft, sent, won, lost, archived
- Small and medium sizes
- Rounded pill shape

#### StatusFilterCard
- Clickable filter cards
- Shows count and description
- Active state with Primary 500 border
- Hover elevation effect

---

## 📄 Pages

### 1. Login Page
- Centered card layout
- Email and password inputs
- Loading state with spinner
- Error message display
- Demo credentials hint

### 2. Dashboard
- **KPI Cards**: Revenue, Margin, Active Projects, Win Rate
- **Collapsible Filters**: Date range, status, client
- **Charts**: Revenue trend (line), Projects by status (bar)
- **Top Clients Table**: Revenue leaderboard
- **AI Advisor**: Insights card with gradient background

### 3. Projects
- **Status Filters**: 5 cards (All, Draft, Sent, Won, Lost)
- **Projects Table**: Sortable with actions
- **Empty State**: For new users or filtered views
- **Actions**: View, Edit, Delete per project

### 4. Create Quote
- **2-Column Layout**: Form (2/3) + Summary (1/3)
- **Project Information**: Name, client, email, currency, taxes
- **Services Section**: Add multiple services with hours
- **Quote Summary**: Real-time calculation
- **Margin Indicator**: Visual progress bar with color coding
- **Low Margin Warning**: Alert for margins below 30%

### 5. Settings
- **6 Sections**: Costs, Services, Team, Currency, Taxes, Users
- **Sidebar Navigation**: Icon + description
- **Tables**: Editable data with actions
- **Forms**: Add/Edit dialogs
- **Active States**: Primary 50 background for selected section

---

## 🔧 Technical Implementation

### File Structure

```
/App.tsx                          - Main app with routing
/lib/
  ├── types.ts                   - TypeScript interfaces
  └── mock-data.ts               - Sample data
/components/
  ├── layout/
  │   ├── AppSidebar.tsx
  │   ├── AppHeader.tsx
  │   └── AppLayout.tsx
  ├── pages/
  │   ├── LoginPage.tsx
  │   ├── DashboardPage.tsx
  │   ├── ProjectsPage.tsx
  │   ├── CreateQuotePage.tsx
  │   └── SettingsPage.tsx
  ├── KPICard.tsx
  ├── StatusBadge.tsx
  └── StatusFilterCard.tsx
/styles/
  └── globals.css               - Design system tokens
```

### Design Tokens (CSS Variables)

All design tokens are defined in `/styles/globals.css`:

```css
--primary-500: hsl(210, 100%, 72%)
--grey-50: hsl(0, 0%, 98%)
--spacing-md: 16px
--elevation-2: 0 3px 1px -2px rgba(0,0,0,0.2)...
```

### Icons

Using **Lucide React** library:
- LayoutDashboard, FolderKanban, Settings
- DollarSign, Users, Package
- Plus, Pencil, Trash, Eye
- TrendingUp, TrendingDown, AlertTriangle

### Charts

Using **Recharts** library:
- Line charts for trends
- Bar charts for distributions
- Responsive containers
- Custom tooltips with theme colors

---

## 🎯 Key Features

### 1. Quote Creation
- Add multiple services
- Real-time total calculation
- Margin estimation (60% cost assumption)
- Tax inclusion toggle
- Low margin warnings

### 2. Project Management
- Status-based filtering
- Comprehensive project table
- Quick actions (view, edit, delete)
- Client information display

### 3. Dashboard Analytics
- Key performance indicators
- Revenue trends
- Project distribution
- Top clients analysis
- AI-powered insights

### 4. Settings Management
- Cost rate configuration
- Service catalog
- Team member management
- Currency selection
- Tax rate setup
- User permissions

---

## 💡 Design Decisions

### 1. Material Design 3
- Modern, clean aesthetic
- Consistent elevation system
- Semantic color usage
- Accessible contrast ratios

### 2. 8px Grid System
- Predictable spacing
- Visual rhythm
- Easy to scale
- Maintenance friendly

### 3. Component Architecture
- Reusable components
- Props-based customization
- TypeScript for type safety
- Mock data for demonstration

### 4. Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Sticky summary sidebar
- Collapsible filters

---

## 🚀 Getting Started

1. **Login**: Enter any email and password to access the demo
2. **Explore Dashboard**: View KPIs, charts, and insights
3. **Browse Projects**: Filter and manage existing quotes
4. **Create Quote**: Build a new project with services
5. **Configure Settings**: Customize costs, services, and team

---

## 📊 Mock Data

The application includes comprehensive mock data:

- **8 Projects**: Various statuses and values
- **10 Services**: Different categories and rates
- **8 Cost Rates**: Team hourly costs
- **6 Team Members**: With roles and emails
- **6 Currencies**: Global options
- **4 Tax Rates**: Common configurations
- **5 Users**: Different permission levels

---

## 🎨 Color Usage Guidelines

### Primary Blue
- **Use for**: Primary actions, links, active states
- **Don't use for**: Error states, success messages

### Success Green
- **Use for**: Positive actions, completed states, high margins
- **Don't use for**: Primary navigation, neutral information

### Error Red
- **Use for**: Destructive actions, errors, low margins
- **Don't use for**: Primary actions, neutral states

### Grey Scale
- **Use for**: Text hierarchy, borders, backgrounds
- **Don't use for**: Primary actions (too neutral)

---

## 📝 Best Practices

1. **Consistency**: Use design system tokens, not arbitrary values
2. **Spacing**: Follow 8px grid for all spacing
3. **Typography**: Let default styles work, avoid overriding
4. **Colors**: Use semantic colors appropriately
5. **Elevation**: Match elevation to component importance
6. **Accessibility**: Maintain contrast ratios for text

---

## 🔮 Future Enhancements

- Dark mode implementation
- Export to PDF functionality
- Email quote sending
- Client portal
- Advanced analytics
- Integrations (accounting, CRM)
- Template system
- Approval workflows

---

Built with ❤️ using Material Design 3, React, and Tailwind CSS
