# Design Guidelines: AffiBoard Frontend

## Design Approach
**Selected Approach:** Custom Design System with Material Design 3 foundations  
**Justification:** AffiBoard is a data-intensive affiliate analytics dashboard requiring clarity and efficiency. The dark theme with glass-card aesthetics creates a premium, modern feel while maintaining Material Design's robust patterns for information density.

**Key Design Principles:**
- Glass morphism for visual depth and hierarchy
- High contrast for data readability on dark backgrounds
- Gradient accents for visual interest without distraction
- Professional, trustworthy analytics experience

---

## Core Design Elements

### A. Typography
**Font Family:** Inter (Google Fonts CDN)

**Hierarchy:**
- H1 (Dashboard Title): 36px, font-bold
- H2 (Section Headers): 28px, font-semibold
- H3 (Card Titles): 20px, font-medium
- Body Text: 16px, font-normal
- Small Text (Labels): 14px, font-normal
- Large Numbers (Metrics): 40px, font-bold
- Table Text: 15px, font-normal

### B. Layout System
**Spacing Primitives:** Tailwind units of 3, 4, 6, and 8

**Grid Structure:**
- Main Container: max-w-[1600px] mx-auto
- Dashboard Grid: 12-column with gap-6
- Sidebar: 280px width (desktop), collapsible overlay (mobile)
- Content padding: px-6 lg:px-8, py-6

---

## C. Component Library

### Navigation (Shadcn Sidebar)
- Collapsible sidebar with glass backdrop (backdrop-blur-xl)
- Logo section at top (h-16, p-4)
- Icon-label navigation items with hover glass effect
- Nested menu support for categories
- Footer section with user profile card
- Mobile: Slide-over drawer from left

### Glass Cards
- Backdrop blur effect (backdrop-blur-md)
- Border with teal accent glow (border-primary/20)
- Rounded corners (rounded-xl)
- Subtle inner shadow for depth
- Content padding: p-6
- Header with gradient underline separator

### Dashboard Components

**Stats Cards (Top Metrics Row):**
- 4-card grid (grid-cols-1 md:grid-cols-2 xl:grid-cols-4)
- Large number display with animated counter
- Icon with gradient background circle (64px)
- Trend indicator (arrow + percentage)
- Sparkline micro-chart below number
- Hover effect: Enhanced glow border

**Data Tables:**
- Glass container with fixed header
- Alternating row subtle background
- Sortable headers with icon indicators
- Action column (right-aligned) with icon buttons
- Pagination with glass buttons
- Custom scrollbar (thin, teal track)
- Row hover: Subtle teal glow

**Charts & Visualizations:**
- Glass card containers
- Gradient fills for area charts
- Teal primary line/bar color
- Grid lines at 10% opacity
- Legend with glass background
- Interactive tooltips with blur backdrop
- Time range selector (tabs or dropdown)

### Forms (Login/Signup)
- Centered glass card (max-w-md)
- Logo with subtle glow effect (h-12, mb-8)
- Floating label inputs with glass background
- Input focus: Teal border glow
- Error states: Red glow with message below
- Primary button: Full width, gradient background
- Divider with "or continue with" text
- Social login buttons (outlined glass style)

### Buttons
- Primary: Gradient teal background, bold text, py-3 px-6, rounded-lg
- Secondary: Glass with teal border, py-3 px-6
- Icon buttons: 40px square, glass background, rounded-lg
- Loading state: Spinner with teal color
- Disabled: 40% opacity

### Status & Badges
- Credit balance: Prominent top-right badge with gradient
- Transaction status: Small rounded pills (px-3 py-1)
- Activity indicators: Pulsing dot animation
- Notifications: Red badge with count on bell icon

---

## Screen-Specific Guidelines

### Login/Signup
- Full-screen gradient background (dark with teal accents)
- Centered glass card with backdrop blur
- Two-column layout on desktop: Form left, feature highlights right
- Feature highlights: 3 benefit cards with icons
- Footer links: Terms, Privacy (subtle text)

### Dashboard (Main View)
- Top bar: Search, notifications, credit balance, user avatar (h-16)
- Sidebar navigation (280px, glass)
- Main content area with 16px gap
- Top section: 4 metric cards in grid
- Middle section: 2-column layout (8:4 ratio) - Main chart left, activity feed right
- Bottom section: Recent transactions table (full width)
- Quick filters: Chip-style glass buttons above table

### Offer Analysis View
- Split layout: Offer list (40%) | Details panel (60%)
- Offer cards in list: Compact glass cards with key metrics
- Details panel: Tabbed interface (Overview, Performance, History)
- Performance charts: Stacked in 2-column grid
- Comparison mode: Side-by-side metric cards

### Profile/Settings
- Left sidebar: Section navigation (Account, Security, Billing, Preferences)
- Main area: Form sections with glass containers
- Two-column form layout (label-input pairs)
- Profile header: Avatar upload with gradient ring, user stats
- Save button: Sticky at top-right or floating bottom-right

---

## Custom Scrollbars
- Thin width (8px)
- Track: Semi-transparent dark background
- Thumb: Teal gradient with rounded ends
- Hover: Slightly wider (10px)

---

## Images

**No Hero Images** - This is a utility dashboard focused on data and functionality.

**Required Images:**
- **Logo**: Brand wordmark with icon (used in sidebar header, login screen). Recommended: SVG format, 160x40px
- **User Avatar**: Circular profile images (40px in navigation, 80px in profile, 120px in settings)
- **Empty States**: Simple line-art illustrations for empty tables/lists (e.g., "No offers yet" with search icon graphic)
- **Social Login Icons**: Provider logos (Google, GitHub) at 24px

**Image Treatment:**
- All images use subtle border-radius (rounded-lg or rounded-full)
- Profile images have teal gradient ring on hover
- Empty state illustrations use teal accent color