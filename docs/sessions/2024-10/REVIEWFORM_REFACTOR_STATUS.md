# ReviewForm Refactoring - Current Status & Final Push Plan

## 📊 Current Status Summary

### ✅ COMPLETED (Phases A & B)

#### Phase A: Project Scaffolding
- ✅ Created directory structure under `src/components/reviews/ReviewForm/`
- ✅ Error boundaries created:
  - `src/components/error-boundaries/ReviewFormErrorBoundary.tsx`
  - `src/components/error-boundaries/SectionErrorBoundary.tsx`
- ✅ Type definitions in `src/components/reviews/ReviewForm/types.ts`
- ✅ Review types in `src/lib/reviews/reviewTypes.ts`

#### Phase B: Business Logic Extraction
- ✅ Created `src/lib/reviews/reviewCalculations.ts` (score calculations)
- ✅ Created `src/lib/reviews/reviewTransformations.ts` (payload building)
- ✅ Created `src/lib/reviews/reviewValidationRules.ts` (validation logic)
- ✅ Unit tests created and **ALL PASSING** (9/9 tests pass):
  - `src/lib/reviews/__tests__/reviewCalculations.test.ts`
  - `src/lib/reviews/__tests__/reviewTransformations.test.ts`
- ✅ Test environment configured with localStorage polyfills
- ✅ Vitest working correctly with Supabase client

#### Phase C: Hooks & Context (PARTIALLY COMPLETE)
- ✅ Custom hooks created in `src/lib/hooks/reviews/`:
  - `useReviewFormState.ts` - form state management
  - `useReviewValidation.ts` - validation orchestration
  - `useReviewSubmission.ts` - save/update/complete logic
  - `useTemplateLogic.ts` - template-derived flags
  - `useArrayFieldManager.ts` - goals/achievements management
- ✅ Context infrastructure created:
  - `src/components/reviews/ReviewForm/context/ReviewFormContext.tsx`
  - `src/components/reviews/ReviewForm/context/ReviewFormProvider.tsx`
- ⚠️ **INCOMPLETE**: Current `ReviewForm.tsx` only shows template selection - missing ALL other UI sections

### ❌ TODO (Phases C completion, D & E)

#### Phase C Completion: Restore Full UI Using Context
**Current Problem**: `ReviewForm.tsx` is a stub with only template selection. Need to restore all sections:
- Basic info (date, reviewer)
- Template questions rendering
- Self-assessment section
- DISC mini questions
- Review-type specific fields (probation, warning, promotion, salary)
- Performance assessment (stars, level, salary rec)
- Goals & development (arrays)
- Signatures (complete mode)

#### Phase D: Component Decomposition (Not Started)
Need to extract sections into reusable components:
- `sections/BasicInfoSection.tsx`
- `sections/TemplateQuestionsSection.tsx`
- `sections/PerformanceAssessmentSection.tsx`
- `sections/GoalsSection.tsx`
- `sections/ReviewTypeSpecificSection.tsx`
- `sections/SignaturesSection.tsx`
- `components/QuestionRenderer.tsx`
- `components/StarRating.tsx`
- Wrap each with `SectionErrorBoundary`

#### Phase E: Finalization (Not Started)
- Remove any legacy code
- Update all imports across the app
- Expand test coverage
- Documentation updates
- Final validation

---

## 🎯 Final Push Plan - Complete in One Go

### Step 1: Complete Phase C - Restore Full UI (Priority 1)
**Action**: Update `src/components/reviews/ReviewForm/ReviewForm.tsx` to include ALL sections from original form

**Sections to add** (in order):
1. Basic Information (review_date field)
2. Template Questions (with renderQuestion helper)
3. Self-Assessment Section (conditional on `showSelfAssessment` + mode)
4. DISC Mini Questions (conditional on `showDISC` + staffId + mode)
5. Review-Type Specific Fields:
   - Probation fields (adaptability_speed, initiative_taken, team_reception_score)
   - Warning fields (warning_level, behavior_score, impact_score, support_suggestions)
   - Promotion fields (promotion_readiness_score, leadership_potential_score)
   - Salary Review fields (salary_suggestion_reason, future_raise_goal)
6. Performance Assessment (star_rating, performance_level, salary_recommendation, promotion_ready)
7. Goals & Development (goals_next, development_areas, achievements arrays)
8. Summary textarea
9. Signatures (mode === 'complete')
10. Action buttons (Cancel/Save)

**Key**: Use context values (`state`, `updateField`, `updateResponse`, `handleArrayFieldChange`, etc.) - NO local state!

### Step 2: Phase D - Extract Section Components (Priority 2)
Create modular components wrapped with error boundaries:

```
src/components/reviews/ReviewForm/
  sections/
    BasicInfoSection.tsx
    TemplateQuestionsSection.tsx  
    SelfAssessmentSection.tsx (wrapper around existing)
    DISCSection.tsx (wrapper around existing DISCMiniQuestions)
    ReviewTypeSpecificSection.tsx
    PerformanceSection.tsx
    GoalsSection.tsx
    SignaturesSection.tsx
  components/
    QuestionRenderer.tsx
    StarRating.tsx
    ArrayFieldInput.tsx
```

Each section wrapped:
```tsx
<SectionErrorBoundary section="TemplateSections">
  <TemplateQuestionsSection />
</SectionErrorBoundary>
```

### Step 3: Phase E - Final Integration & Testing (Priority 3)
1. Update `ReviewForm/index.tsx` to compose all sections
2. Wrap top-level with `ReviewFormErrorBoundary`
3. Test all modes (create/edit/complete)
4. Test all review types
5. Verify no regressions
6. Run linters and type-check
7. Update documentation

---

## 🚀 Execution Order

### **IMMEDIATE**: Fix ReviewForm.tsx UI
The current `ReviewForm.tsx` needs to be expanded from 164 lines back to ~900 lines (temporarily), pulling all UI from the original but using context instead of local state.

**Critical mappings**:
- `formData` → `state` (from context)
- `setFormData` → `updateField` (from context)
- `handleInputChange` → `updateField` (from context)
- `handleResponseChange` → `updateResponse` (from context)
- `handleArrayFieldChange` → `handleArrayFieldChange` (from context)
- `addArrayField` → `addArrayField` (from context)
- `handleSave` → `submitReview` (from context)

### **NEXT**: Phase D component extraction
Once full UI is working via context, systematically extract sections.

### **FINALLY**: Phase E cleanup
Polish, test, document.

---

## 📋 Files That Need Updates

### Immediate (Phase C completion):
- `src/components/reviews/ReviewForm/ReviewForm.tsx` - **EXPAND TO FULL UI**

### Soon (Phase D):
- Create 8-10 new section/component files
- Update `ReviewForm/index.tsx` to compose sections

### Final (Phase E):
- Any consuming components using old ReviewForm path
- Documentation in `docs/refactoring/`
- Test files

---

## 🎓 Key Principles to Maintain

1. **Zero Functionality Loss** - Every field, validation, conditional from original must be preserved
2. **Context-Driven** - All state/handlers from `useReviewFormContext()`, no local state
3. **Error Resilience** - Error boundaries at section and form level
4. **Type Safety** - Maintain TypeScript coverage, no `any` types
5. **Test Coverage** - All business logic tested (already done ✅)

---

## 🔧 Quick Reference: What's Working

✅ Business logic helpers (calculations, transformations, validation)
✅ All unit tests passing
✅ Custom hooks (form state, submission, validation, templates, arrays)
✅ Context provider infrastructure
✅ Error boundary components
✅ Type definitions

## ⚠️ What's Broken

❌ ReviewForm UI is incomplete (only shows template selector)
❌ No section components yet
❌ Not wrapped with error boundaries yet
❌ Parent components may not be passing correct props yet

---

## 💪 Let's Finish This!

**Next Command**: Restore full UI to `ReviewForm.tsx` using context hooks.
**Estimated Work**: ~30-45 minutes to complete all remaining phases.
**Confidence Level**: HIGH - All hard parts (business logic, hooks, tests) are done ✅

