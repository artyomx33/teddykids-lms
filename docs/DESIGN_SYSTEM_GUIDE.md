# 🎨 Design System Guide - TeddyKids LMS

> **Quick Reference**: Best practices for building consistent, maintainable UI components

---

## 🎯 Core Principles

1. **Use shadcn/ui components only** - No Material-UI, Ant Design, or other libraries
2. **Semantic color tokens** - No hardcoded colors (`bg-green-500` ❌ → `text-primary` ✅)
3. **4-point spacing grid** - Use 4, 8, 12, 16, 24, 32 (not 3, 5, 7, etc.)
4. **Lucide icons exclusively** - Consistent icon library
5. **Reusable components** - Check if a component exists before creating new ones

---

## 📦 Shared Components

### StatusBadge
Use for all status indicators instead of hardcoded colors.

```tsx
import { StatusBadge } from "@/components/ui/status-badge";

// ❌ DON'T: Hardcoded colors
<Badge className="bg-green-100 text-green-800 border-green-300">
  Success
</Badge>

// ✅ DO: StatusBadge with semantic types
<StatusBadge status="success">Complete</StatusBadge>
<StatusBadge status="warning">Pending</StatusBadge>
<StatusBadge status="error">Failed</StatusBadge>
<StatusBadge status="info">Processing</StatusBadge>
<StatusBadge status="pending">Queued</StatusBadge>
```

### StarRating
Use for all star rating displays.

```tsx
import { StarRating } from "@/components/ui/star-rating";

// ❌ DON'T: Manual star implementation
{Array.from({ length: 5 }).map((_, i) => (
  <Star className={i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'} />
))}

// ✅ DO: StarRating component
<StarRating rating={4.5} />
<StarRating rating={4.5} showValue />
<StarRating rating={4.5} size="lg" />
<StarRating rating={rating} interactive onRatingChange={setRating} />
```

---

## 🎨 Colors

### Semantic Tokens (Always Use These)

```tsx
// Text colors
text-foreground        // Primary text
text-muted-foreground  // Secondary text
text-primary           // Accent/interactive elements
text-destructive       // Errors, destructive actions

// Background colors
bg-background          // Main background
bg-muted              // Secondary background
bg-primary            // Accent background
bg-destructive        // Error background

// Border colors
border-border         // Default borders
border-primary        // Accent borders
border-destructive    // Error borders
```

### Badge Variants

```tsx
// ❌ DON'T: Hardcoded colors
<Badge className="bg-green-100 text-green-800">Active</Badge>

// ✅ DO: Use variants
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Info</Badge>
<Badge variant="outline">Neutral</Badge>
<Badge variant="destructive">Error</Badge>
```

### Icon Colors

```tsx
// ❌ DON'T: Hardcoded colors
<Star className="text-yellow-500" />
<AlertCircle className="text-red-600" />
<CheckCircle className="text-green-500" />

// ✅ DO: Semantic colors
<Star className="text-primary" />
<AlertCircle className="text-destructive" />
<CheckCircle className="text-primary" />
```

---

## 📏 Spacing

### 4-Point Grid System

Always use multiples of 4 for spacing:

```tsx
// ❌ DON'T: Random values
<div className="p-3 mt-5 mb-7 space-y-2">
  <div className="gap-3">...</div>
</div>

// ✅ DO: 4-point grid (4, 8, 12, 16, 24, 32)
<div className="p-4 mt-4 mb-8 space-y-4">
  <div className="gap-4">...</div>
</div>
```

### Common Patterns

```tsx
// Card padding
<CardContent className="p-6">     // Standard
<CardContent className="p-4">     // Compact

// Section spacing
<div className="space-y-6">       // Between major sections
<div className="space-y-4">       // Between related items
<div className="space-y-2">       // Within a component

// Gaps
<div className="gap-4">           // Standard gap
<div className="gap-2">           // Tight gap
```

---

## 🧩 Components

### Use shadcn/ui Components

```tsx
// ❌ DON'T: Native HTML elements
<select className="...">
  <option>...</option>
</select>
<textarea className="..." />
<input type="text" className="..." />

// ✅ DO: shadcn/ui components
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>

<Textarea rows={4} value={text} onChange={...} />
<Input type="text" value={text} onChange={...} />
```

### Modal/Dialog Pattern

```tsx
// ❌ DON'T: Custom div-based modals
<div className="fixed inset-0 bg-black/30">
  <div className="bg-white p-4 rounded">
    <div className="text-lg">Title</div>
    <div>Content</div>
    <div className="flex gap-2">
      <button>Cancel</button>
      <button>Save</button>
    </div>
  </div>
</div>

// ✅ DO: Card-based modals with proper structure
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Content */}
    </CardContent>
    <CardFooter className="flex justify-end gap-2">
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </CardFooter>
  </Card>
</div>
```

---

## 🎯 Class Organization

Organize Tailwind classes in this order:

```tsx
// 1. Layout (flex, grid, block)
// 2. Position (absolute, relative, fixed)
// 3. Spacing (margin, padding)
// 4. Sizing (width, height)
// 5. Background
// 6. Text
// 7. Border
// 8. Effects (shadow, opacity)
// 9. Interactions (hover, focus)

// ❌ DON'T: Random order
<div className="text-sm bg-white p-4 rounded-lg flex shadow-md mt-4">

// ✅ DO: Organized order
<div className="flex mt-4 p-4 bg-white text-sm rounded-lg shadow-md">
```

---

## 🚫 Common Mistakes to Avoid

### 1. Hardcoded Colors
```tsx
// ❌ DON'T
<div className="text-green-600 bg-green-50 border-green-300">
<AlertCircle className="text-red-500" />

// ✅ DO
<StatusBadge status="success">...</StatusBadge>
<AlertCircle className="text-destructive" />
```

### 2. Inconsistent Spacing
```tsx
// ❌ DON'T
<div className="p-3 mt-5 space-y-2">

// ✅ DO
<div className="p-4 mt-4 space-y-4">
```

### 3. Native HTML Form Elements
```tsx
// ❌ DON'T
<select><option>...</option></select>

// ✅ DO
<Select>...</Select>
```

### 4. Duplicated Components
```tsx
// ❌ DON'T: Create custom implementations
function MyStarRating() {
  return [...].map(() => <Star />);
}

// ✅ DO: Use existing components
<StarRating rating={5} />
```

### 5. Mixed UI Libraries
```tsx
// ❌ DON'T
import { Button } from '@mui/material';
import { Input } from 'antd';

// ✅ DO
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
```

---

## 📋 Pre-Commit Checklist

Before committing new components, verify:

- [ ] Uses shadcn/ui components exclusively
- [ ] No hardcoded colors (only semantic tokens)
- [ ] Follows 4-point spacing grid
- [ ] Lucide icons only
- [ ] No duplicated logic (checked for existing components)
- [ ] No native HTML form elements
- [ ] Proper TypeScript types
- [ ] Zero ESLint warnings

---

## 🔍 Component Lookup

**Before creating a new component, check if these exist:**

| Need | Use Component | Location |
|------|---------------|----------|
| Status indicator | `<StatusBadge>` | `@/components/ui/status-badge` |
| Star rating | `<StarRating>` | `@/components/ui/star-rating` |
| Button | `<Button>` | `@/components/ui/button` |
| Input field | `<Input>` | `@/components/ui/input` |
| Textarea | `<Textarea>` | `@/components/ui/textarea` |
| Select dropdown | `<Select>` | `@/components/ui/select` |
| Dialog/Modal | `<Dialog>` | `@/components/ui/dialog` |
| Card | `<Card>` | `@/components/ui/card` |
| Badge | `<Badge>` | `@/components/ui/badge` |
| Tabs | `<Tabs>` | `@/components/ui/tabs` |

---

## 📚 Resources

- **shadcn/ui Docs**: https://ui.shadcn.com
- **Lucide Icons**: https://lucide.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Design System Audit**: See `UI_DESIGN_SYSTEM_UPGRADE.md`

---

## 🎓 Examples

### Good Component Example

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { StarRating } from "@/components/ui/star-rating";
import { CheckCircle } from "lucide-react";

export function StaffCard({ staff }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{staff.name}</span>
          <Badge variant="secondary">{staff.role}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">Active</span>
        </div>
        
        <StatusBadge status="success">
          All documents complete
        </StatusBadge>
        
        <StarRating rating={staff.rating} showValue />
      </CardContent>
    </Card>
  );
}
```

---

**Last Updated**: October 2025  
**Maintained by**: Design System Team  
**Questions?** Check `UI_DESIGN_SYSTEM_UPGRADE.md` for detailed changelog

