# Theme System Documentation

## Overview

Your app now has a complete dark/light theme system using React Context, Tailwind CSS, and shadcn/ui components.

## Features

- ✅ **Automatic System Theme Detection** - Detects user's system preference
- ✅ **Persistent Theme Storage** - Remembers user's choice in localStorage
- ✅ **Smooth Transitions** - Animated theme switching
- ✅ **Multiple Toggle Components** - Icon, text, and dropdown variants
- ✅ **TypeScript Support** - Fully typed theme context
- ✅ **shadcn/ui Integration** - Works seamlessly with your existing components

## Components

### ThemeToggle
Basic icon toggle button (already added to your header)
```tsx
import { ThemeToggle } from '@/components/ui/ThemeToggle';

<ThemeToggle />
```

### ThemeToggleWithText
Toggle with light/dark text labels
```tsx
import { ThemeToggleWithText } from '@/components/ui/ThemeToggle';

<ThemeToggleWithText />
```

### ThemeSelector
Dropdown selector
```tsx
import { ThemeSelector } from '@/components/ui/ThemeToggle';

<ThemeSelector />
```

## Using the Theme Hook

```tsx
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('dark')}>Force Dark</button>
      <button onClick={() => setTheme('light')}>Force Light</button>
    </div>
  );
}
```

## Theme-Aware Styling

Your components automatically use theme-aware colors via CSS variables:

```tsx
// These classes automatically switch between light/dark
<div className="bg-background text-foreground">
  <div className="bg-card text-card-foreground border">
    Card content
  </div>
</div>
```

## Available CSS Variables

### Light/Dark Colors
- `--background` / `--foreground` - Main background and text
- `--card` / `--card-foreground` - Card backgrounds
- `--primary` / `--primary-foreground` - Primary buttons
- `--secondary` / `--secondary-foreground` - Secondary elements
- `--muted` / `--muted-foreground` - Muted/disabled states
- `--accent` / `--accent-foreground` - Accent colors
- `--destructive` / `--destructive-foreground` - Error/danger states
- `--border`, `--input`, `--ring` - UI element borders

### Chart Colors
For data visualization (recharts integration):
- `--chart-1` through `--chart-5` - Different colors for charts

## Implementation Details

### Context Provider
The `ThemeProvider` is already wrapped around your entire app in `App.tsx`:

```tsx
<ThemeProvider defaultTheme="light">
  <AuthProvider>
    <GamificationProvider>
      <RouterProvider router={router} />
    </GamificationProvider>
  </AuthProvider>
</ThemeProvider>
```

### Theme Detection Priority
1. User's manual selection (stored in localStorage)
2. System preference (`prefers-color-scheme`)
3. Default theme (`light`)

### CSS Transitions
Smooth transitions are enabled globally with:
```css
* {
  @apply transition-colors duration-200;
}
```

## Where to Use Theme Toggles

- ✅ **Header/Navigation** - Already implemented
- ✅ **Profile/Settings Pages** - Already implemented
- **Mobile Menu** - Add `<ThemeToggle />` 
- **Sidebar** - Add `<ThemeToggleWithText />`
- **Settings Modal** - Use `<ThemeSelector />`

## Testing the Theme System

1. **Header Toggle** - Click the sun/moon icon in the header
2. **Profile Page** - Visit `/profile` to see all theme toggle variants
3. **Persistence** - Refresh the page to confirm theme is remembered
4. **System Integration** - Change your system theme to see automatic detection

## Customization

### Adding New Theme Colors
Add to `src/index.css`:
```css
:root {
  --my-custom-color: 210 40% 98%;
}

.dark {
  --my-custom-color: 222 47% 11%;
}
```

Then use in Tailwind:
```tsx
<div className="bg-[hsl(var(--my-custom-color))]">
  Custom themed element
</div>
```

### Custom Theme Toggle
```tsx
import { useTheme } from '@/hooks/useTheme';

function CustomToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'} Switch to {theme === 'light' ? 'dark' : 'light'}
    </button>
  );
}
```

## Troubleshooting

**Theme not switching?**
- Check if `ThemeProvider` wraps your app
- Verify Tailwind config has `darkMode: ["class"]`

**Flashing on page load?**
- The theme is applied after React hydration, this is normal
- For SSR apps, consider server-side theme detection

**Colors not updating?**
- Ensure you're using CSS variables like `bg-background` instead of hardcoded colors
- Check that your Tailwind config includes the color mappings

**TypeScript errors?**
- Import from `@/hooks/useTheme` or `@/context/ThemeContext`
- Ensure theme type is `'light' | 'dark'` 