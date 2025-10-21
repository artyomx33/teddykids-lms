# 🎨 Review Form Card Layout - Implementation Plan

**Issue**: Issue 3 - Apply card layout to ALL 8 review types  
**Goal**: Match the clean, segmented design from user's screenshot  
**Status**: Ready to implement

---

## 🎯 **Design Goals**

### **Current State** (What Needs Fixing)
- All fields in one flat form
- No visual separation between sections
- Hard to scan and navigate
- Lacks hierarchy and organization

### **Target State** (From Screenshot)
- ✅ Card-based sections with clear headers
- ✅ Emoji icons for visual distinction
- ✅ Consistent spacing (`space-y-6` between cards, `p-6` inside)
- ✅ Clean, segmented appearance
- ✅ Easy to scan and understand

---

## 📋 **Card Structure (All 8 Review Types)**

### **Universal Card Order**
1. **📝 Template Questions** - Questions from selected template
2. **💭 Self-Assessment: Reflect & Respond** - Employee self-rating
3. **🎨 DISC Personality Check-in** - Mini DISC questions
4. **Type-Specific Cards** - Warning, promotion, salary (if applicable)
5. **⭐ Performance Assessment** - Star rating, performance level
6. **🎯 Goals & Development** - Goals, achievements, areas to improve
7. **📄 Review Summary** - Final notes and signatures

### **Card Component Structure**
```tsx
<Card className="border-2">
  <CardHeader className="pb-3">
    <CardTitle className="flex items-center gap-2 text-lg">
      <span className="text-2xl">📝</span>
      Section Title
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Section content */}
  </CardContent>
</Card>
```

---

## 🎨 **Section Styling Guide**

### **1. Template Questions Card**
- **Emoji**: 📝
- **Title**: "Template Questions" or template name
- **Background**: Default (white)
- **Content**: Dynamic questions from template

### **2. Self-Assessment Card**
- **Emoji**: 💭
- **Title**: "Self-Assessment: Reflect & Respond"
- **Background**: `bg-blue-50/30`
- **Content**:
  - Self-rating sliders
  - "What are you proud of?" (textarea)
  - "What do you want to work on?" (textarea)
  - "How supported do you feel?" (1-5 stars)

### **3. DISC Card**
- **Emoji**: 🎨
- **Title**: "DISC Personality Check-in"
- **Background**: `bg-purple-50/30`
- **Content**:
  - Current DISC profile display (if known)
  - 3 rotating mini-questions
  - Response options (Red/Blue/Green/Yellow)

### **4. Type-Specific Cards**

#### **Warning Review** (if `review_type === 'warning'`)
- **Emoji**: ⚠️
- **Title**: "Warning / Intervention Details"
- **Background**: `bg-red-50/30`
- **Content**:
  - Warning level (1-3)
  - Behavior score
  - Impact score
  - Support suggestions

#### **Promotion Review** (if `review_type === 'promotion'`)
- **Emoji**: 🚀
- **Title**: "Promotion / Position Change"
- **Background**: `bg-green-50/30`
- **Content**:
  - Leadership readiness score
  - Team impact score
  - Problem-solving maturity
  - Open pitch field

#### **Salary Review** (if `review_type === 'salary'`)
- **Emoji**: 💰
- **Title**: "Salary Review / Growth Plan"
- **Background**: `bg-yellow-50/30`
- **Content**:
  - Performance stability
  - Initiative
  - Financial responsibility
  - Salary suggestion reason
  - Future raise goal

### **5. Performance Assessment Card**
- **Emoji**: ⭐
- **Title**: "Performance Assessment"
- **Background**: Default
- **Content**:
  - Star rating (1-5)
  - Performance level dropdown
  - Overall score (calculated)

### **6. Goals & Development Card**
- **Emoji**: 🎯
- **Title**: "Goals & Development"
- **Background**: `bg-green-50/30`
- **Content**:
  - Key achievements (list)
  - Areas to improve (list)
  - New goals (list)

### **7. Summary Card**
- **Emoji**: 📄
- **Title**: "Review Summary"
- **Background**: Default
- **Content**:
  - Summary/notes textarea
  - Signed by employee checkbox
  - Signed by reviewer checkbox

---

## 🔨 **Implementation Strategy**

### **Phase 1: Create Card Wrapper Components**
1. Create `ReviewSection` component for consistency
2. Define emoji and color mappings
3. Test with one review type first

### **Phase 2: Restructure Existing Form**
1. Group existing fields into logical sections
2. Wrap each section in `ReviewSection` component
3. Maintain all existing functionality

### **Phase 3: Apply to All 8 Types**
1. First-month review
2. Six-month review
3. Annual review
4. Position/promotion review
5. Salary review
6. Warning review
7. Probation review
8. Custom review

### **Phase 4: Polish & Test**
1. Verify all calculations still work
2. Test save functionality
3. Check mobile responsiveness
4. Verify all 8 types render correctly

---

## 📐 **Spacing & Layout Constants**

```tsx
// Between cards
const CARD_SPACING = "space-y-6";

// Inside cards
const CARD_PADDING = "p-6";

// Card header
const HEADER_PADDING = "pb-3";

// Content spacing
const CONTENT_SPACING = "space-y-4";

// Field spacing
const FIELD_SPACING = "space-y-2";
```

---

## 🎯 **Key Requirements**

### **Must Maintain**
- ✅ All existing calculations (overall_score, self_delta, etc.)
- ✅ All form validation
- ✅ All save/complete functionality
- ✅ All template question rendering
- ✅ All conditional logic (warning, promotion, etc.)

### **Must Add**
- ✅ Card-based visual structure
- ✅ Emoji headers for each section
- ✅ Subtle background colors for different sections
- ✅ Consistent spacing and padding
- ✅ Clean, scannable layout

### **Must Not Break**
- ✅ Existing data flow
- ✅ API integrations
- ✅ Validation logic
- ✅ Calculation functions
- ✅ Template system

---

## 🧪 **Testing Checklist**

### **For Each Review Type**
- [ ] Card layout renders correctly
- [ ] All fields are editable
- [ ] Save functionality works
- [ ] Calculations are correct
- [ ] Validation triggers properly
- [ ] Mobile layout is responsive
- [ ] No console errors

### **Cross-Review Tests**
- [ ] Template switching works
- [ ] Self-assessment appears for all types
- [ ] DISC section renders correctly
- [ ] Type-specific cards show only when appropriate
- [ ] Signatures save correctly

---

## 💡 **Implementation Notes**

### **Component Reusability**
Create a `ReviewSection` component:
```tsx
interface ReviewSectionProps {
  emoji: string;
  title: string;
  bgColor?: string;
  children: React.ReactNode;
}

function ReviewSection({ emoji, title, bgColor, children }: ReviewSectionProps) {
  return (
    <Card className={`border-2 ${bgColor || ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">{emoji}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}
```

### **Conditional Rendering**
```tsx
{reviewType === 'warning' && (
  <ReviewSection emoji="⚠️" title="Warning Details" bgColor="bg-red-50/30">
    {/* Warning-specific fields */}
  </ReviewSection>
)}
```

---

## 🎊 **Expected Outcome**

### **User Experience Improvements**
- ✅ **Clearer Structure**: Easy to see what sections exist
- ✅ **Better Navigation**: Scroll through distinct cards
- ✅ **Visual Hierarchy**: Emojis and colors guide attention
- ✅ **Less Overwhelming**: Sections break up the form
- ✅ **More Professional**: Matches modern design standards

### **Technical Quality**
- ✅ **Maintainable**: Reusable `ReviewSection` component
- ✅ **Consistent**: Same structure across all types
- ✅ **Extensible**: Easy to add new sections
- ✅ **Tested**: All functionality verified
- ✅ **Performant**: No unnecessary re-renders

---

## 🚀 **Ready to Implement!**

**Estimated Effort**: 30-45 minutes  
**Risk Level**: Low (wrapping existing code, not rewriting)  
**Impact**: High (major UX improvement)  

**Philosophy**: Keep it simple, maintain functionality, improve appearance.

