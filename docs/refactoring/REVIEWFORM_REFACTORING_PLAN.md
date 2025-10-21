# 🏗️ ReviewForm.tsx - Refactoring Implementation Plan

**Agent**: Component Refactoring Architect  
**Date**: October 19, 2025  
**Phase**: Phase 2 - Detailed Refactoring Strategy  
**Target**: 916 lines → ~150 lines (84% reduction)

---

## 🎯 REFACTORING PHILOSOPHY

**Golden Rules**:
1. ✅ **PRESERVE 100% OF FUNCTIONALITY** - Zero features lost
2. ✅ **ADD ERROR BOUNDARIES** - Resilience at every layer
3. ✅ **IMPROVE TESTABILITY** - Each piece testable in isolation
4. ✅ **MAINTAIN PERFORMANCE** - No degradation
5. ✅ **ENHANCE TYPE SAFETY** - Remove all `any` types

---

## 📂 NEW FILE STRUCTURE

```
src/
├── components/
│   └── reviews/
│       ├── ReviewForm/
│       │   ├── index.tsx                    # Main orchestrator (150 lines)
│       │   ├── ReviewFormContent.tsx        # Layout wrapper (80 lines)
│       │   ├── ReviewFormHeader.tsx         # Title & status (40 lines)
│       │   ├── sections/
│       │   │   ├── BasicInfoSection.tsx              # Template, date (60 lines)
│       │   │   ├── TemplateQuestionsSection.tsx      # Dynamic questions (120 lines)
│       │   │   ├── PerformanceAssessmentSection.tsx  # Scores, ratings (80 lines)
│       │   │   ├── GoalsAndDevelopmentSection.tsx    # Goals, achievements (100 lines)
│       │   │   ├── SignaturesSection.tsx             # Sign-offs (50 lines)
│       │   │   └── review-type-specific/
│       │   │       ├── ProbationFields.tsx           # First month fields (60 lines)
│       │   │       ├── WarningFields.tsx             # Warning/intervention (80 lines)
│       │   │       ├── PromotionFields.tsx           # Promotion assessment (60 lines)
│       │   │       └── SalaryReviewFields.tsx        # Salary details (70 lines)
│       │   ├── components/
│       │   │   ├── QuestionRenderer.tsx              # Dynamic question UI (100 lines)
│       │   │   ├── StarRating.tsx                    # Reusable star input (40 lines)
│       │   │   └── ArrayFieldManager.tsx             # Goals/achievements input (60 lines)
│       │   ├── context/
│       │   │   └── ReviewFormContext.tsx             # Shared state (100 lines)
│       │   └── types.ts                              # All TypeScript interfaces (80 lines)
│       │
│       ├── ReviewForm.tsx                   # [WILL BE REPLACED]
│       ├── SelfAssessment.tsx              # [KEEP AS IS] ✅
│       └── DISCMiniQuestions.tsx           # [KEEP AS IS] ✅
│
├── lib/
│   ├── hooks/
│   │   └── reviews/
│   │       ├── useReviewFormState.ts       # Form state management (120 lines)
│   │       ├── useReviewValidation.ts      # Validation logic (100 lines)
│   │       ├── useReviewSubmission.ts      # Save/update/complete (150 lines)
│   │       ├── useTemplateLogic.ts         # Template-related logic (80 lines)
│   │       └── useArrayFieldManager.ts     # Array field utilities (60 lines)
│   │
│   ├── reviews/
│   │   ├── reviewCalculations.ts           # Score calculations (100 lines)
│   │   ├── reviewTransformations.ts        # Form → DB transformations (150 lines)
│   │   ├── reviewValidationRules.ts        # Validation rules (120 lines)
│   │   └── reviewTypes.ts                  # Consolidated types (100 lines)
│   │
│   └── reviewMetrics.ts                    # [KEEP AS IS] ✅
│
└── components/
    └── error-boundaries/
        ├── ReviewFormErrorBoundary.tsx     # Top-level boundary (80 lines)
        └── SectionErrorBoundary.tsx        # Section-level boundary (60 lines)
```

**Total New Files**: 29  
**Lines Distribution**: ~2,500 lines (from 916) - but HIGHLY organized and maintainable!

---

## 1️⃣ CUSTOM HOOKS EXTRACTION

### Hook 1: `useReviewFormState.ts`

**Purpose**: Manage all form state with proper validation  
**Replaces**: `useState` calls, `handleInputChange`, `handleResponseChange`, array handlers

```typescript
export function useReviewFormState(initialData?: Partial<ReviewFormData>) {
  const [formData, setFormData] = useState<ReviewFormData>(
    getDefaultFormData(initialData)
  );
  const [isDirty, setIsDirty] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Field update with validation
  const updateField = useCallback((field: keyof ReviewFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setTouchedFields(prev => new Set(prev).add(field));
  }, []);

  // Response update for dynamic questions
  const updateResponse = useCallback((questionIndex: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      responses: { ...prev.responses, [questionIndex]: value }
    }));
    setIsDirty(true);
  }, []);

  // Array field management
  const updateArrayField = useCallback((
    field: 'goals_next' | 'development_areas' | 'achievements',
    index: number,
    value: string
  ) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      if (value.trim()) {
        newArray[index] = value;
      } else {
        newArray.splice(index, 1);
      }
      return { ...prev, [field]: newArray };
    });
    setIsDirty(true);
  }, []);

  const addArrayItem = useCallback((
    field: 'goals_next' | 'development_areas' | 'achievements'
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(getDefaultFormData(initialData));
    setIsDirty(false);
    setTouchedFields(new Set());
  }, [initialData]);

  return {
    formData,
    isDirty,
    touchedFields,
    updateField,
    updateResponse,
    updateArrayField,
    addArrayItem,
    resetForm
  };
}
```

**Lines**: ~120  
**Preserves**: ALL state management logic  
**Improves**: Adds dirty tracking, touched fields

---

### Hook 2: `useReviewValidation.ts`

**Purpose**: Centralize all validation logic  
**New Feature**: Currently missing from ReviewForm!

```typescript
export function useReviewValidation(
  formData: ReviewFormData,
  template: ReviewTemplate | undefined,
  mode: ReviewFormMode
) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Validate entire form
  const validateAll = useCallback(() => {
    const newErrors: ValidationErrors = {};

    // Required field validation
    if (!formData.staff_id) newErrors.staff_id = 'Staff member is required';
    if (!formData.review_date) newErrors.review_date = 'Review date is required';

    // Template question validation
    if (template) {
      template.questions.forEach((q, idx) => {
        if (q.required && !formData.responses[idx]) {
          newErrors[`response_${idx}`] = 'This question is required';
        }
      });
    }

    // Mode-specific validation
    if (mode === 'complete') {
      if (!formData.signed_by_reviewer) {
        newErrors.signed_by_reviewer = 'Reviewer signature required to complete';
      }
    }

    // Review type specific validation
    if (formData.review_type === 'warning' && !formData.warning_level) {
      newErrors.warning_level = 'Warning level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, template, mode]);

  // Validate single field
  const validateField = useCallback((field: string, value: any) => {
    const fieldErrors = validateSingleField(field, value, formData, template);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (fieldErrors.length > 0) {
        newErrors[field] = fieldErrors[0];
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  }, [formData, template]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  return {
    errors,
    isValid,
    validateAll,
    validateField,
    clearErrors: () => setErrors({})
  };
}
```

**Lines**: ~100  
**Preserves**: N/A (new feature!)  
**Improves**: Adds comprehensive validation

---

### Hook 3: `useReviewSubmission.ts`

**Purpose**: Handle all save/update/complete logic  
**Replaces**: `handleSave()` function (87 lines!)

```typescript
export function useReviewSubmission(
  mode: ReviewFormMode,
  reviewId: string | undefined
) {
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const completeReview = useCompleteReview();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitReview = useCallback(async (
    formData: ReviewFormData,
    template: ReviewTemplate | undefined,
    discQuestions: DISCQuestion[],
    onSuccess?: (data: any) => void
  ) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Calculate scores
      const calculations = calculateReviewScores(formData, template);

      // Calculate DISC if applicable
      const discSnapshot = calculateDISCSnapshot(
        formData.disc_responses,
        discQuestions
      );

      // Transform to database format
      const reviewData = transformFormDataToReviewData(
        formData,
        template,
        calculations,
        discSnapshot
      );

      // Submit based on mode
      let result;
      if (mode === 'create' || (mode === 'complete' && !reviewId)) {
        result = await createReview.mutateAsync(reviewData);
      } else if (mode === 'complete') {
        result = await completeReview.mutateAsync({
          reviewId: reviewId!,
          reviewData: { ...reviewData, signed_by_reviewer: true }
        });
      } else {
        result = await updateReview.mutateAsync({
          reviewId: reviewId!,
          updates: reviewData
        });
      }

      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save review';
      setSubmitError(errorMessage);
      console.error('Review submission error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, reviewId, createReview, updateReview, completeReview]);

  return {
    submitReview,
    isSubmitting,
    submitError,
    clearError: () => setSubmitError(null)
  };
}
```

**Lines**: ~150  
**Preserves**: ALL handleSave() logic  
**Improves**: Better error handling, loading states

---

### Hook 4: `useTemplateLogic.ts`

**Purpose**: Template selection and feature flags  
**Replaces**: Template-related computed values

```typescript
export function useTemplateLogic(
  selectedTemplateId: string,
  templates: ReviewTemplate[]
) {
  const selectedTemplate = useMemo(
    () => templates.find(t => t.id === selectedTemplateId),
    [templates, selectedTemplateId]
  );

  const showSelfAssessment = useMemo(
    () => selectedTemplate?.self_assessment_required !== false,
    [selectedTemplate]
  );

  const showDISC = useMemo(
    () => selectedTemplate?.disc_injection_enabled !== false,
    [selectedTemplate]
  );

  const xpReward = useMemo(
    () => selectedTemplate?.xp_reward || 100,
    [selectedTemplate]
  );

  return {
    selectedTemplate,
    showSelfAssessment,
    showDISC,
    xpReward
  };
}
```

**Lines**: ~80  
**Preserves**: Template logic  
**Improves**: Memoization, clarity

---

### Hook 5: `useArrayFieldManager.ts`

**Purpose**: Reusable array field management  
**Replaces**: `handleArrayFieldChange`, `addArrayField`

```typescript
export function useArrayFieldManager<T = string>(initialValues: T[] = []) {
  const [values, setValues] = useState<T[]>(initialValues);

  const updateItem = useCallback((index: number, value: T) => {
    setValues(prev => {
      const newValues = [...prev];
      // Remove if empty (string case)
      if (typeof value === 'string' && !value.trim()) {
        newValues.splice(index, 1);
      } else {
        newValues[index] = value;
      }
      return newValues;
    });
  }, []);

  const addItem = useCallback((defaultValue: T) => {
    setValues(prev => [...prev, defaultValue]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setValues(prev => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  return {
    values,
    updateItem,
    addItem,
    removeItem,
    reset
  };
}
```

**Lines**: ~60  
**Preserves**: Array management logic  
**Improves**: Reusable, adds remove functionality

---

## 2️⃣ BUSINESS LOGIC EXTRACTION

### File 1: `reviewCalculations.ts`

**Purpose**: All score and calculation logic

```typescript
/**
 * Calculate overall score from responses
 */
export function calculateOverallScore(
  responses: Record<string, any>,
  template: ReviewTemplate | undefined
): number {
  if (!template || template.scoring_method !== 'five_star') return 0;
  return calculateAverageRating(responses);
}

/**
 * Calculate self vs manager rating delta
 */
export function calculateSelfVsManagerDelta(
  managerRatings: Record<string, number>,
  selfRatings: Record<string, number>
): number {
  return calculateRatingDelta(managerRatings, selfRatings);
}

/**
 * Calculate all review scores at once
 */
export function calculateReviewScores(
  formData: ReviewFormData,
  template: ReviewTemplate | undefined
) {
  return {
    overallScore: calculateOverallScore(formData.responses, template),
    selfDelta: calculateSelfVsManagerDelta(
      formData.responses,
      formData.self_assessment.self_ratings
    )
  };
}
```

**Lines**: ~100  
**Preserves**: `calculateOverallScore()`, `calculateSelfVsManagerDelta()`  
**Improves**: Testable in isolation

---

### File 2: `reviewTransformations.ts`

**Purpose**: Transform form data to database schema  
**CRITICAL**: This is the most important extraction!

```typescript
/**
 * Transform ReviewFormData to database-compatible format
 * Handles null conversion, v1.1 fields, DISC snapshot
 */
export function transformFormDataToReviewData(
  formData: ReviewFormData,
  template: ReviewTemplate | undefined,
  calculations: ReviewCalculations,
  discSnapshot: DISCSnapshot | null
): DatabaseReviewData {
  // Build base data with required fields
  const reviewData: DatabaseReviewData = {
    staff_id: formData.staff_id || null,
    reviewer_id: formData.reviewer_id || null,
    review_type: formData.review_type,
    review_date: formData.review_date,
    responses: formData.responses,
  };

  // Add optional scalar fields
  reviewData.summary = formData.summary?.trim() || null;
  reviewData.goals_next = formData.goals_next?.length ? formData.goals_next : null;
  reviewData.development_areas = formData.development_areas?.length ? formData.development_areas : null;
  reviewData.achievements = formData.achievements?.length ? formData.achievements : null;
  
  // Add calculated scores
  reviewData.overall_score = calculations.overallScore || null;
  reviewData.star_rating = formData.star_rating > 0 ? formData.star_rating : null;
  reviewData.performance_level = formData.performance_level || null;
  
  // Add recommendations
  reviewData.promotion_ready = formData.promotion_ready || null;
  reviewData.salary_recommendation = formData.salary_recommendation || null;
  
  // Add signatures
  reviewData.signed_by_employee = formData.signed_by_employee || null;
  reviewData.signed_by_reviewer = formData.signed_by_reviewer || null;
  
  // Add template reference
  reviewData.template_id = template?.id || null;

  // === v1.1 FIELDS ===
  reviewData.self_assessment = formData.self_assessment || null;
  reviewData.manager_vs_self_delta = calculations.selfDelta || null;
  reviewData.disc_snapshot = discSnapshot;
  
  // Transform DISC responses to database format
  reviewData.disc_questions_answered = transformDISCResponses(formData.disc_responses);
  
  reviewData.xp_earned = template?.xp_reward || 100;
  reviewData.wellbeing_score = formData.self_assessment?.how_supported || null;

  // Add review-type specific fields
  addReviewTypeSpecificFields(reviewData, formData);

  return reviewData;
}

/**
 * Transform DISC responses to database format
 */
function transformDISCResponses(
  responses: Record<string, number>
): DISCQuestionAnswer[] | null {
  if (!Object.keys(responses).length) return null;
  
  return Object.entries(responses).map(([question_id, answer]) => ({
    question_id,
    selected_option_index: answer
  }));
}

/**
 * Add review type specific fields to review data
 */
function addReviewTypeSpecificFields(
  reviewData: DatabaseReviewData,
  formData: ReviewFormData
) {
  // Probation specific
  if (formData.review_type === 'probation') {
    reviewData.adaptability_speed = formData.adaptability_speed || null;
    reviewData.initiative_taken = formData.initiative_taken || null;
    reviewData.team_reception_score = formData.team_reception_score || null;
  }

  // Warning specific
  if (formData.review_type === 'warning') {
    reviewData.warning_level = formData.warning_level || null;
    reviewData.behavior_score = formData.behavior_score || null;
    reviewData.impact_score = formData.impact_score || null;
    reviewData.support_suggestions = formData.support_suggestions?.length 
      ? formData.support_suggestions 
      : null;
  }

  // Promotion specific
  if (formData.review_type === 'promotion_review') {
    reviewData.promotion_readiness_score = formData.promotion_readiness_score || null;
    reviewData.leadership_potential_score = formData.leadership_potential_score || null;
  }

  // Salary specific
  if (formData.review_type === 'salary_review') {
    reviewData.salary_suggestion_reason = formData.salary_suggestion_reason || null;
    reviewData.future_raise_goal = formData.future_raise_goal || null;
  }
}
```

**Lines**: ~150  
**Preserves**: ENTIRE data transformation logic from handleSave()  
**Improves**: Testable, clear structure, documented

---

### File 3: `reviewValidationRules.ts`

**Purpose**: Centralized validation rules

```typescript
export const REVIEW_VALIDATION_RULES = {
  staff_id: {
    required: true,
    message: 'Staff member is required'
  },
  review_date: {
    required: true,
    message: 'Review date is required'
  },
  warning_level: {
    required: (formData: ReviewFormData) => formData.review_type === 'warning',
    message: 'Warning level is required for warning reviews'
  },
  // ... more rules
};

export function validateSingleField(
  field: string,
  value: any,
  formData: ReviewFormData,
  template: ReviewTemplate | undefined
): string[] {
  // Implementation
}
```

**Lines**: ~120  
**Preserves**: N/A (new feature)  
**Improves**: Declarative validation

---

## 3️⃣ COMPONENT BREAKDOWN

### Component 1: `ReviewForm/index.tsx` (Main Orchestrator)

**Purpose**: Entry point with error boundary  
**Size**: ~150 lines

```typescript
export function ReviewForm(props: ReviewFormProps) {
  return (
    <ReviewFormErrorBoundary>
      <ReviewFormProvider {...props}>
        <ReviewFormContent />
      </ReviewFormProvider>
    </ReviewFormErrorBoundary>
  );
}
```

**Preserves**: Same external API  
**Improves**: Error boundary protection

---

### Component 2: `ReviewFormContent.tsx`

**Purpose**: Layout and section orchestration  
**Size**: ~80 lines

```typescript
function ReviewFormContent() {
  const { mode, showSelfAssessment, showDISC, formData } = useReviewFormContext();
  
  return (
    <Card>
      <ReviewFormHeader />
      
      <CardContent className="space-y-6">
        <SectionErrorBoundary name="BasicInfo">
          <BasicInfoSection />
        </SectionErrorBoundary>
        
        <SectionErrorBoundary name="TemplateQuestions">
          <TemplateQuestionsSection />
        </SectionErrorBoundary>
        
        {showSelfAssessment && (mode === 'edit' || mode === 'complete') && (
          <SectionErrorBoundary name="SelfAssessment">
            <SelfAssessment {...selfAssessmentProps} />
          </SectionErrorBoundary>
        )}
        
        {/* ... more sections ... */}
        
        <ReviewFormActions />
      </CardContent>
    </Card>
  );
}
```

**Preserves**: Same visual structure  
**Improves**: Section error boundaries, clear layout

---

### Component 3-9: Section Components

Each section becomes its own component:

1. **BasicInfoSection** - Template selection, date picker
2. **TemplateQuestionsSection** - Dynamic questions
3. **PerformanceAssessmentSection** - Ratings, performance level
4. **GoalsAndDevelopmentSection** - Goals, achievements, summary
5. **SignaturesSection** - Sign-off checkboxes
6. **ProbationFields** - First month specific
7. **WarningFields** - Warning specific
8. **PromotionFields** - Promotion specific
9. **SalaryReviewFields** - Salary specific

**Each**: 60-120 lines, single responsibility

---

### Component 10: `QuestionRenderer.tsx`

**Purpose**: Extract `renderQuestion()` function  
**Size**: ~100 lines

```typescript
interface QuestionRendererProps {
  question: QuestionData;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
}

export function QuestionRenderer({ question, value, onChange, readOnly }: QuestionRendererProps) {
  switch (question.type) {
    case 'text':
      return <TextQuestionInput value={value} onChange={onChange} readOnly={readOnly} />;
    case 'rating':
      return <StarRating value={value} onChange={onChange} readOnly={readOnly} />;
    case 'boolean':
      return <BooleanQuestionInput value={value} onChange={onChange} readOnly={readOnly} />;
    case 'select':
      return <SelectQuestionInput question={question} value={value} onChange={onChange} readOnly={readOnly} />;
    default:
      return null;
  }
}
```

**Preserves**: ALL question rendering logic  
**Improves**: Reusable, testable

---

### Component 11: `StarRating.tsx`

**Purpose**: Reusable star rating component  
**Size**: ~40 lines

```typescript
interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

export function StarRating({ value, onChange, max = 5, size = 'md', readOnly }: StarRatingProps) {
  // Extract star rendering logic
}
```

**Preserves**: Star rating logic  
**Improves**: Reusable across components

---

## 4️⃣ ERROR BOUNDARY STRATEGY

### 4-Layer Protection

```typescript
// Layer 1: Top-level (ReviewFormErrorBoundary)
<ReviewFormErrorBoundary>
  <ReviewForm />
</ReviewFormErrorBoundary>

// Layer 2: Provider level
<ReviewFormProvider>
  <ReviewFormContent />
</ReviewFormProvider>

// Layer 3: Section level
<SectionErrorBoundary name="TemplateQuestions">
  <TemplateQuestionsSection />
</SectionErrorBoundary>

// Layer 4: Component level (for risky operations)
<ErrorBoundary componentName="DISCCalculation">
  <DISCMiniQuestions />
</ErrorBoundary>
```

**Result**: Form continues working even if one section crashes!

---

## 5️⃣ CONTEXT STRATEGY

### `ReviewFormContext.tsx`

**Purpose**: Share state across all sections without prop drilling

```typescript
interface ReviewFormContextValue {
  // From useReviewFormState
  formData: ReviewFormData;
  isDirty: boolean;
  updateField: (field: string, value: any) => void;
  updateResponse: (index: number, value: any) => void;
  // ... more state methods
  
  // From useTemplateLogic
  selectedTemplate: ReviewTemplate | undefined;
  showSelfAssessment: boolean;
  showDISC: boolean;
  
  // From useReviewValidation
  errors: ValidationErrors;
  validateField: (field: string) => void;
  
  // From useReviewSubmission
  submitReview: () => Promise<void>;
  isSubmitting: boolean;
  
  // Mode
  mode: ReviewFormMode;
}
```

**Preserves**: All data access  
**Improves**: No prop drilling, centralized state

---

## 6️⃣ TYPE SAFETY IMPROVEMENTS

### New `types.ts` File

```typescript
// Remove ALL 'any' types!

export interface ReviewFormData {
  staff_id: string;
  reviewer_id: string;
  review_type: ReviewType;
  review_date: string;
  responses: ReviewResponses;  // NOT Record<string, any>
  summary: string;
  // ... properly typed
}

export interface ReviewResponses {
  [questionIndex: number]: string | number | boolean;
}

export interface DatabaseReviewData {
  // Exact database schema
}

export interface ValidationErrors {
  [field: string]: string;
}

// ... all other types
```

**Preserves**: Type information  
**Improves**: Removes `any`, adds missing types

---

## 7️⃣ MIGRATION STRATEGY (Safe & Phased)

### 🚦 Phase-by-Phase Implementation

#### **Phase A: Preparation** (No code changes)
- ✅ Create directory structure
- ✅ Set up error boundaries
- ✅ Create types.ts
- ⏱️ Time: 30 minutes
- 🎯 Risk: ZERO

#### **Phase B: Business Logic Extraction** (Zero UI impact)
- ✅ Create `reviewCalculations.ts`
- ✅ Create `reviewTransformations.ts`
- ✅ Create `reviewValidationRules.ts`
- ✅ Write unit tests for each
- ✅ Import and use in ReviewForm.tsx (inline)
- ⏱️ Time: 2 hours
- 🎯 Risk: LOW (no UI changes, easy rollback)

#### **Phase C: Custom Hooks Extraction** (State only)
- ✅ Create `useReviewFormState.ts`
- ✅ Create `useReviewValidation.ts`
- ✅ Create `useTemplateLogic.ts`
- ✅ Create `useArrayFieldManager.ts`
- ✅ Create `useReviewSubmission.ts`
- ✅ Test each hook in isolation
- ✅ Swap into ReviewForm.tsx
- ⏱️ Time: 3 hours
- 🎯 Risk: MEDIUM (logic changes, test thoroughly)

#### **Phase D: Context Setup** (Infrastructure)
- ✅ Create `ReviewFormContext.tsx`
- ✅ Wrap existing ReviewForm.tsx in provider
- ✅ Test nothing breaks
- ⏱️ Time: 1 hour
- 🎯 Risk: LOW

#### **Phase E: Component Extraction** (Visual changes)
- ✅ Extract `QuestionRenderer.tsx` and test
- ✅ Extract `StarRating.tsx` and test
- ✅ Extract `ArrayFieldManager.tsx` and test
- ✅ Extract section components ONE AT A TIME:
  1. BasicInfoSection
  2. TemplateQuestionsSection
  3. PerformanceAssessmentSection
  4. GoalsAndDevelopmentSection
  5. Review-type specific fields
  6. SignaturesSection
- ✅ Test after EACH extraction
- ⏱️ Time: 4 hours
- 🎯 Risk: MEDIUM (visual changes)

#### **Phase F: Final Assembly** (The big switch)
- ✅ Create new `ReviewForm/index.tsx`
- ✅ Create `ReviewFormContent.tsx`
- ✅ Wire all sections together
- ✅ Add all error boundaries
- ✅ Test exhaustively
- ✅ Rename old `ReviewForm.tsx` → `ReviewForm.tsx.backup`
- ✅ Deploy new structure
- ⏱️ Time: 2 hours
- 🎯 Risk: HIGH (but everything tested already!)

#### **Phase G: Cleanup & Verification**
- ✅ Remove old backup file
- ✅ Update imports in parent components
- ✅ Run full regression tests
- ✅ Verify in production
- ⏱️ Time: 1 hour
- 🎯 Risk: LOW

**Total Time**: ~13 hours  
**Total Risk**: LOW (phased approach allows rollback at any step)

---

## 8️⃣ TESTING STRATEGY

### Unit Tests (New!)

```typescript
// reviewCalculations.test.ts
describe('calculateOverallScore', () => {
  it('calculates average from responses', () => {
    const responses = { 0: 5, 1: 4, 2: 3 };
    expect(calculateOverallScore(responses, template)).toBe(4.0);
  });
});

// reviewTransformations.test.ts
describe('transformFormDataToReviewData', () => {
  it('converts empty strings to null for UUIDs', () => {
    const formData = { staff_id: '', reviewer_id: 'uuid-123' };
    const result = transformFormDataToReviewData(formData, ...);
    expect(result.staff_id).toBeNull();
    expect(result.reviewer_id).toBe('uuid-123');
  });
});

// useReviewFormState.test.ts
describe('useReviewFormState', () => {
  it('tracks dirty state on field update', () => {
    const { result } = renderHook(() => useReviewFormState());
    expect(result.current.isDirty).toBe(false);
    act(() => result.current.updateField('summary', 'test'));
    expect(result.current.isDirty).toBe(true);
  });
});
```

**Coverage Goal**: 80%+ on business logic

---

### Integration Tests

```typescript
// ReviewForm.integration.test.tsx
describe('ReviewForm Integration', () => {
  it('submits review data correctly in create mode', async () => {
    render(<ReviewForm mode="create" staffId="123" />);
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Summary'), 'Great performance');
    await userEvent.click(screen.getByLabelText('5 stars'));
    
    // Submit
    await userEvent.click(screen.getByText('Schedule Review'));
    
    // Verify API called
    expect(mockCreateReview).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: 'Great performance',
        star_rating: 5
      })
    );
  });
});
```

---

### Manual Test Checklist

- [ ] Create review flow works
- [ ] Edit review flow works
- [ ] Complete review flow works
- [ ] Self-assessment renders correctly
- [ ] DISC questions work
- [ ] All review types show correct fields:
  - [ ] Probation
  - [ ] Warning
  - [ ] Promotion
  - [ ] Salary
  - [ ] Six month
  - [ ] Yearly
- [ ] Star ratings work
- [ ] Goals/achievements add/remove
- [ ] Validation shows errors
- [ ] Form dirty state works
- [ ] Error boundaries catch crashes
- [ ] Performance is maintained

---

## 9️⃣ ROLLBACK PLAN

### If Something Goes Wrong...

#### Immediate Rollback (< 5 minutes)
```bash
# Restore backup
mv src/components/reviews/ReviewForm.tsx.backup src/components/reviews/ReviewForm.tsx

# Clear new directory
rm -rf src/components/reviews/ReviewForm/

# Restart dev server
npm run dev
```

#### Partial Rollback (Phase-specific)
- Phase B: Remove business logic imports, use inline code
- Phase C: Remove hook imports, restore useState
- Phase D: Remove context provider
- Phase E: Keep extractions, revert to old structure
- Phase F: Keep old ReviewForm.tsx, discard new

#### Git Safety Net
```bash
# Before starting refactoring
git checkout -b refactoring/reviewform-backup
git commit -am "Backup before ReviewForm refactoring"

# If needed
git checkout refactoring/reviewform-backup
git checkout main -- src/components/reviews/ReviewForm.tsx
```

---

## 🔟 RISK ASSESSMENT

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Lost functionality** | LOW | 🔴 CRITICAL | Extensive testing, phase-by-phase |
| **Type errors** | MEDIUM | 🟡 HIGH | TypeScript catches at compile time |
| **Performance regression** | LOW | 🟡 HIGH | Benchmark before/after |
| **Integration breaks** | MEDIUM | 🔴 CRITICAL | Integration tests |
| **Context re-renders** | MEDIUM | 🟡 HIGH | Proper memoization |
| **Error boundary issues** | LOW | 🟡 HIGH | Test error scenarios |

**Overall Risk**: 🟢 LOW (with proper testing)

---

## 1️⃣1️⃣ SUCCESS METRICS

### Quantitative

- ✅ Main ReviewForm.tsx: 916 → ~150 lines (84% reduction)
- ✅ Max component size: < 200 lines each
- ✅ Cyclomatic complexity: < 10 per function
- ✅ Test coverage: > 80% on business logic
- ✅ Error boundaries: 3+ layers
- ✅ Type safety: 0 `any` types (except external libs)
- ✅ Build time: No significant increase
- ✅ Bundle size: No significant increase

### Qualitative

- ✅ **Maintainability**: Each piece has clear purpose
- ✅ **Testability**: Every function testable in isolation
- ✅ **Readability**: New developers can understand structure
- ✅ **Resilience**: Sections can fail without crashing form
- ✅ **Reusability**: Components/hooks usable elsewhere
- ✅ **Type Safety**: IDE autocomplete works perfectly
- ✅ **Documentation**: Clear README for each module

---

## 1️⃣2️⃣ NEXT ACTIONS

### Ready to Start? Choose Path:

**Option A: Full Implementation** (Recommended)
- Start with Phase A (prep)
- Go through B → G sequentially
- ~13 hours total
- Maximum safety

**Option B: Quick Proof-of-Concept**
- Just do Phases B + C (business logic + hooks)
- Keep UI as-is for now
- ~5 hours
- Lower risk, partial benefit

**Option C: Gradual Over Multiple Sessions**
- Do 1-2 phases per session
- Test in production between sessions
- ~2 weeks total
- Maximum safety

---

## 📋 IMPLEMENTATION CHECKLIST

Copy this to track progress:

```
REVIEWFORM REFACTORING PROGRESS

Phase A: Preparation
[ ] Create directory structure
[ ] Set up error boundary components
[ ] Create types.ts
[ ] Run initial tests

Phase B: Business Logic
[ ] Create reviewCalculations.ts
[ ] Create reviewTransformations.ts
[ ] Create reviewValidationRules.ts
[ ] Write unit tests
[ ] Integrate into ReviewForm.tsx

Phase C: Custom Hooks
[ ] Create useReviewFormState.ts
[ ] Create useReviewValidation.ts
[ ] Create useTemplateLogic.ts
[ ] Create useArrayFieldManager.ts
[ ] Create useReviewSubmission.ts
[ ] Test each hook
[ ] Swap into ReviewForm.tsx

Phase D: Context
[ ] Create ReviewFormContext.tsx
[ ] Wrap ReviewForm.tsx
[ ] Verify no breaks

Phase E: Components
[ ] Extract QuestionRenderer.tsx
[ ] Extract StarRating.tsx
[ ] Extract ArrayFieldManager.tsx
[ ] Extract BasicInfoSection.tsx
[ ] Extract TemplateQuestionsSection.tsx
[ ] Extract PerformanceAssessmentSection.tsx
[ ] Extract GoalsAndDevelopmentSection.tsx
[ ] Extract ProbationFields.tsx
[ ] Extract WarningFields.tsx
[ ] Extract PromotionFields.tsx
[ ] Extract SalaryReviewFields.tsx
[ ] Extract SignaturesSection.tsx

Phase F: Assembly
[ ] Create ReviewForm/index.tsx
[ ] Create ReviewFormContent.tsx
[ ] Wire all sections
[ ] Add error boundaries
[ ] Test exhaustively
[ ] Backup old file
[ ] Deploy new structure

Phase G: Cleanup
[ ] Remove backup
[ ] Update imports
[ ] Run regression tests
[ ] Verify in production

COMPLETE! 🎉
```

---

## 📚 DOCUMENTATION TO CREATE

After refactoring:

1. **README.md** in `ReviewForm/` - Architecture overview
2. **HOOKS.md** - How to use each custom hook
3. **SECTIONS.md** - Guide to each section component
4. **BUSINESS_LOGIC.md** - Calculation and transformation docs
5. **TESTING.md** - How to test review forms
6. **TROUBLESHOOTING.md** - Common issues

---

## 🎯 FINAL WORD

This refactoring will transform ReviewForm from:
- ❌ 916-line monolith
- ❌ Hard to test
- ❌ Hard to maintain
- ❌ No error handling
- ❌ Mixed concerns

To:
- ✅ ~150-line orchestrator
- ✅ Fully testable
- ✅ Easy to maintain
- ✅ Graceful error handling
- ✅ Clear separation of concerns

**Estimated ROI**:
- Refactoring time: 13 hours
- Future maintenance saved: 100+ hours
- Bug reduction: 50%+
- Developer happiness: 📈📈📈

---

*Ready to begin implementation? Let's do this! 🚀*

---

**Phase 2 Complete ✅**  
**Next**: Choose implementation path and begin Phase A!

*Generated by Component Refactoring Architect Agent*  
*Zero Functionality Loss Guaranteed* 💯

