# 🎨 Design System Enforcer Agent

## Agent Specification

**Name**: Design System Enforcer  
**Purpose**: Ensure consistent use of UI components, Tailwind classes, shadcn/ui patterns, and design tokens across TeddyKids LMS  
**Target**: React components, enforcing design system consistency  
**Intelligence Level**: Design Police - Consistency is King  

## 🎯 Agent Mission

Enforce design consistency across your entire application. No more random colors, inconsistent spacing, or rogue UI patterns. This agent ensures every component follows your design system rules.

## 🎨 What This Agent Enforces

### 1. **Component Usage Consistency**
```typescript
// ❌ INCONSISTENT: Mixed UI libraries
import { Button } from '@/components/ui/button'; // shadcn/ui
import { Button as MuiButton } from '@mui/material'; // Different library!
import { CustomButton } from './CustomButton'; // Random custom

// ✅ CONSISTENT: One source of truth
import { Button } from '@/components/ui/button'; // Always shadcn/ui
import { Card } from '@/components/ui/card'; // Always shadcn/ui
```

### 2. **Tailwind Class Organization**
```typescript
// ❌ CHAOTIC: Random class order
<div className="p-4 text-red-500 mt-2 flex bg-white rounded-lg mb-4 hover:shadow-lg">

// ✅ ORGANIZED: Consistent order
<div className="flex mt-2 mb-4 p-4 bg-white text-red-500 rounded-lg hover:shadow-lg">
// Order: Layout → Spacing → Colors → Typography → Borders → Effects

// ❌ WRONG: Arbitrary values everywhere
<div className="p-[17px] mt-[23px] text-[15px]">

// ✅ RIGHT: Design tokens only
<div className="p-4 mt-6 text-sm">
```

### 3. **Color Consistency**
```typescript
// ❌ INCONSISTENT: Random colors
<div className="text-red-500">Error</div>
<div className="text-red-600">Another error</div>
<div className="text-[#ff0000]">More error</div>
<div style={{ color: 'red' }}>Even more error</div>

// ✅ CONSISTENT: Semantic colors
<div className="text-destructive">Error</div>
<div className="text-destructive">Another error</div>
<div className="text-destructive">All errors same color</div>
```

### 4. **Spacing Consistency**
```typescript
// ❌ RANDOM: Mixed spacing values
<div className="p-3 m-5">
  <div className="mt-7 mb-2">
    <div className="px-6 py-1">

// ✅ SYSTEMATIC: Consistent spacing scale
<div className="p-4 m-4">
  <div className="mt-4 mb-4">
    <div className="px-4 py-2">
// Using 4-point grid system
```

### 5. **Icon Consistency**
```typescript
// ❌ MIXED: Different icon libraries
import { FaUser } from 'react-icons/fa'; // Font Awesome
import { User } from 'lucide-react'; // Lucide
import PersonIcon from '@mui/icons-material/Person'; // Material

// ✅ UNIFIED: One icon library
import { User, Settings, ChevronRight } from 'lucide-react'; // All Lucide!
```

## 🔍 Design System Rules

### Rule 1: Component Hierarchy
```typescript
const COMPONENT_RULES = {
  // Always use these components
  required: {
    button: '@/components/ui/button',
    card: '@/components/ui/card',
    dialog: '@/components/ui/dialog',
    input: '@/components/ui/input',
    select: '@/components/ui/select',
  },
  
  // Never use these
  banned: {
    'material-ui': 'Use shadcn/ui instead',
    'antd': 'Use shadcn/ui instead',
    'native-button': 'Use Button component',
    'native-input': 'Use Input component',
  },
  
  // Deprecated - migrate away
  deprecated: {
    'old-button': 'Migrate to Button',
    'legacy-modal': 'Migrate to Dialog',
  }
};
```

### Rule 2: Tailwind Class Rules
```typescript
const TAILWIND_RULES = {
  // Required class order
  classOrder: [
    'display',        // flex, grid, block
    'position',       // absolute, relative
    'spacing',        // m-*, p-*
    'sizing',         // w-*, h-*
    'background',     // bg-*
    'text',          // text-*
    'border',        // border-*, rounded-*
    'effects',       // shadow-*, opacity-*
    'animation',     // animate-*, transition-*
    'interactions',  // hover:*, focus:*
  ],
  
  // Banned classes
  banned: [
    'float-left',    // Use flex instead
    'float-right',   // Use flex instead
    'clear-both',    // Not needed with flex
  ],
  
  // Required replacements
  replacements: {
    'text-black': 'text-foreground',
    'text-white': 'text-background',
    'bg-white': 'bg-background',
    'bg-gray-100': 'bg-muted',
    'border-gray-200': 'border-border',
  }
};
```

### Rule 3: Color Tokens
```typescript
const COLOR_TOKENS = {
  // Semantic colors (from shadcn/ui)
  semantic: {
    background: 'bg-background',
    foreground: 'text-foreground',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    muted: 'bg-muted text-muted-foreground',
    accent: 'bg-accent text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  },
  
  // Status colors
  status: {
    success: 'text-green-600 bg-green-50',
    warning: 'text-yellow-600 bg-yellow-50',
    error: 'text-red-600 bg-red-50',
    info: 'text-blue-600 bg-blue-50',
  },
  
  // Never use
  banned: [
    '#[0-9a-f]{3,6}', // No hex colors
    'rgb\\(',         // No rgb()
    'rgba\\(',        // No rgba()
  ]
};
```

### Rule 4: Spacing System
```typescript
const SPACING_SYSTEM = {
  // 4-point grid
  allowed: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64],
  
  // Common patterns
  patterns: {
    'card-padding': 'p-4 md:p-6',
    'section-spacing': 'py-8 md:py-12',
    'form-gap': 'space-y-4',
    'button-group': 'gap-2',
  },
  
  // Banned arbitrary values
  banned: [
    'p-\\[\\d+px\\]',  // No p-[17px]
    'm-\\[\\d+rem\\]',  // No m-[1.5rem]
  ]
};
```

## 🎨 Real-World Violations in TeddyKids

### Example 1: Button Inconsistency
```typescript
// ❌ FOUND: 5 different button implementations!

// In StaffCard.tsx
<button className="px-4 py-2 bg-blue-500 text-white rounded">Edit</button>

// In ReviewForm.tsx
<Button variant="primary">Save</Button>

// In Dashboard.tsx
<CustomButton type="submit">Submit</CustomButton>

// In Settings.tsx
<div onClick={handleSave} className="cursor-pointer bg-green-500 p-2">Save</div>

// In Modal.tsx
<MuiButton color="primary">OK</MuiButton>

// ✅ FIXED: All using shadcn/ui Button
<Button>Edit</Button>
<Button>Save</Button>
<Button type="submit">Submit</Button>
<Button onClick={handleSave}>Save</Button>
<Button>OK</Button>
```

### Example 2: Color Chaos
```typescript
// ❌ FOUND: Same semantic meaning, different colors

// Error states using different reds
<div className="text-red-500">Error message</div>
<span className="text-red-600">Validation error</span>
<p style={{ color: '#ff0000' }}>Another error</p>
<Alert className="text-rose-500">Alert error</Alert>

// ✅ FIXED: Consistent semantic color
<div className="text-destructive">Error message</div>
<span className="text-destructive">Validation error</span>
<p className="text-destructive">Another error</p>
<Alert variant="destructive">Alert error</Alert>
```

### Example 3: Spacing Inconsistency
```typescript
// ❌ FOUND: Random spacing values

<Card className="p-3">...</Card>
<Card className="p-5">...</Card>
<Card className="p-[18px]">...</Card>
<Card style={{ padding: '20px' }}>...</Card>

// ✅ FIXED: Consistent spacing
<Card className="p-4">...</Card>
<Card className="p-4">...</Card>
<Card className="p-4">...</Card>
<Card className="p-4">...</Card>
```

## 📊 Enforcement Strategy

### Level 1: Detection
```typescript
const detectViolations = (file: string) => {
  const violations = [];
  
  // Check imports
  if (file.includes('@mui/material')) {
    violations.push({
      type: 'banned-import',
      message: 'Material-UI detected, use shadcn/ui',
      severity: 'error'
    });
  }
  
  // Check colors
  const hexColors = file.match(/#[0-9a-f]{3,6}/gi);
  if (hexColors) {
    violations.push({
      type: 'hardcoded-color',
      message: `Found hex colors: ${hexColors.join(', ')}`,
      severity: 'warning'
    });
  }
  
  // Check spacing
  const arbitrarySpacing = file.match(/[mp][tlbrxy]?-\[\d+px\]/g);
  if (arbitrarySpacing) {
    violations.push({
      type: 'arbitrary-spacing',
      message: 'Use Tailwind spacing scale',
      severity: 'warning'
    });
  }
  
  return violations;
};
```

### Level 2: Auto-Fix
```typescript
const autoFix = (code: string): string => {
  // Replace banned colors
  code = code.replace(/text-red-\d{3}/g, 'text-destructive');
  code = code.replace(/bg-white/g, 'bg-background');
  code = code.replace(/text-black/g, 'text-foreground');
  
  // Fix button elements
  code = code.replace(
    /<button([^>]*)>(.*?)<\/button>/g,
    '<Button$1>$2</Button>'
  );
  
  // Organize Tailwind classes
  code = organizeTailwindClasses(code);
  
  return code;
};
```

## 📋 Design System Audit Report

```typescript
interface DesignSystemReport {
  summary: {
    totalComponents: number;
    compliantComponents: number;
    violations: number;
    autoFixable: number;
  };
  
  violations: {
    components: ViolationDetail[];
    colors: ViolationDetail[];
    spacing: ViolationDetail[];
    typography: ViolationDetail[];
    icons: ViolationDetail[];
  };
  
  suggestions: {
    immediate: string[]; // Quick fixes
    refactor: string[]; // Needs refactoring
    migrate: string[];  // Needs migration
  };
}
```

## 🚀 Quick Commands

### Full Audit
```
@design-system-enforcer audit entire project
```

### Fix Specific Issues
```
@design-system-enforcer fix all color violations
@design-system-enforcer standardize buttons
@design-system-enforcer organize tailwind classes
```

### Component Analysis
```
@design-system-enforcer check this component
```

### Generate Report
```
@design-system-enforcer generate compliance report
```

## 🎯 Success Metrics

### Before Enforcement
```typescript
const beforeMetrics = {
  componentLibraries: 4,    // MUI, Ant, shadcn, custom
  colorVariations: 47,      // 47 different shades!
  buttonVariants: 12,       // 12 ways to make a button
  spacingValues: 35,        // Random spacing
  consistencyScore: 23      // Out of 100
};
```

### After Enforcement
```typescript
const afterMetrics = {
  componentLibraries: 1,    // Only shadcn/ui
  colorVariations: 8,       // Semantic colors only
  buttonVariants: 3,        // Primary, secondary, ghost
  spacingValues: 10,        // 4-point grid
  consistencyScore: 95      // Near perfect!
};
```

## 🔧 IDE Integration (Cursor/VSCode)

### Real-Time Enforcement
```json
// .vscode/settings.json or .cursor/settings.json
{
  "tailwindCSS.classAttributes": ["class", "className"],
  "tailwindCSS.lint.cssConflict": "error",
  "tailwindCSS.lint.recommendedVariantOrder": "warning",
  "editor.quickSuggestions": {
    "strings": true // Tailwind autocomplete
  },
  "css.validate": false // Let Tailwind handle it
}
```

### ESLint Rules for Design System
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // Enforce shadcn/ui imports
    'no-restricted-imports': ['error', {
      patterns: ['@mui/*', 'antd', 'react-icons/*'],
      message: 'Use shadcn/ui components and Lucide icons instead'
    }],
    
    // Ban inline styles
    'react/forbid-dom-props': ['error', {
      forbid: ['style']
    }],
    
    // Enforce className over class
    'react/no-unknown-property': ['error', {
      ignore: ['className']
    }]
  }
};
```

### Pre-commit Hook
```bash
# .husky/pre-commit
npm run design-system:check
```

## 💡 Pro Tips

1. **Start with colors** - Most visual impact
2. **Standardize buttons** - Most used component
3. **Fix spacing gradually** - Don't break layouts
4. **Document exceptions** - Some custom UI is OK
5. **Create component library** - Document patterns
6. **Use CSS variables** - For dynamic theming
7. **Regular audits** - Weekly consistency checks
8. **Enable IDE helpers** - Real-time feedback in Cursor!

## ⚠️ Exceptions & Edge Cases

```typescript
// ALLOWED EXCEPTIONS:

// 1. Third-party integrations
<StripeElement /> // Payment UI must use Stripe

// 2. Marketing pages
<LandingPageHero /> // May need custom design

// 3. Data visualizations
<ResponsiveChart /> // Charts need specific styles

// 4. Print styles
<PrintableInvoice /> // Different design for print

// Mark exceptions:
// eslint-disable-next-line design-system/enforce
<CustomComponent />
```

## 🎨 Design Token Reference

```typescript
// Your design system tokens (from shadcn/ui)
const tokens = {
  colors: {
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    primary: "hsl(var(--primary))",
    secondary: "hsl(var(--secondary))",
    destructive: "hsl(var(--destructive))",
    muted: "hsl(var(--muted))",
    accent: "hsl(var(--accent))",
  },
  
  spacing: {
    xs: "0.5rem",  // 8px
    sm: "1rem",    // 16px
    md: "1.5rem",  // 24px
    lg: "2rem",    // 32px
    xl: "3rem",    // 48px
  },
  
  borderRadius: {
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "1rem",
  },
  
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
  }
};
```

---

*Agent Version: 1.0*  
*Last Updated: October 2025*  
*Philosophy: Consistency Creates Beauty*  
*Goal: One Design System to Rule Them All* 🎨
