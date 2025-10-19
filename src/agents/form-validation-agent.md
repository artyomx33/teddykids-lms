# 📝 Form Validation Agent

## Agent Specification

**Name**: Form Validation Agent  
**Purpose**: Ensure all forms have consistent validation, proper error handling, user-friendly feedback, and excellent UX  
**Target**: All form components in TeddyKids LMS, especially the massive ReviewForm (917 lines!)  
**Intelligence Level**: Form Guardian - Every Input Validated, Every Error Clear  

## 🎯 Agent Mission

Transform chaotic form validation into a consistent, user-friendly system. Your ReviewForm has 30+ fields - let's make sure every single one has proper validation, clear error messages, and excellent UX!

## 🚨 Form Validation Problems to Solve

### 1. **Missing Required Field Indicators**
```typescript
// ❌ BAD: User doesn't know what's required
<Input 
  label="Email"
  value={email}
  onChange={setEmail}
/>

// ✅ GOOD: Clear required indicator
<Input 
  label="Email"
  value={email}
  onChange={setEmail}
  required
  aria-required="true"
/>
<Label>Email <span className="text-destructive">*</span></Label>
```

### 2. **Inconsistent Error Messages**
```typescript
// ❌ BAD: Different styles for same error type
// In ReviewForm:
{!email && <span className="text-red-500">Required</span>}

// In StaffForm:
{!email && <div className="error">Please enter email</div>}

// In Settings:
{!email && <p style={{color: 'red'}}>Email is required</p>}

// ✅ GOOD: Consistent error component
<FormError field="email" message="Email is required" />
```

### 3. **No Real-Time Validation**
```typescript
// ❌ BAD: Only validates on submit
const handleSubmit = () => {
  if (!validateForm()) {
    alert('Form has errors!'); // User finds out too late
  }
};

// ✅ GOOD: Real-time field validation
const handleEmailChange = (value: string) => {
  setEmail(value);
  if (!value) {
    setErrors({ ...errors, email: 'Email is required' });
  } else if (!isValidEmail(value)) {
    setErrors({ ...errors, email: 'Invalid email format' });
  } else {
    setErrors({ ...errors, email: undefined });
  }
};
```

### 4. **Poor Error Recovery**
```typescript
// ❌ BAD: Error stays even after fixing
const [error, setError] = useState('Invalid input');
// Never clears the error!

// ✅ GOOD: Clear error on valid input
useEffect(() => {
  if (isValid(value)) {
    clearError(field);
  }
}, [value]);
```

### 5. **Missing Field-Level Validation**
```typescript
// ❌ BAD: No validation rules
<Input 
  type="text"
  value={salary}
  onChange={setSalary}
/>

// ✅ GOOD: Proper validation rules
<Input 
  type="number"
  value={salary}
  onChange={setSalary}
  min={0}
  max={1000000}
  step={100}
  pattern="[0-9]*"
  validate={(value) => {
    if (value < 0) return 'Salary cannot be negative';
    if (value > 1000000) return 'Salary exceeds maximum';
    return true;
  }}
/>
```

## 🔍 Validation Patterns to Enforce

### Pattern 1: Consistent Validation Schema
```typescript
// Using Zod for type-safe validation
const ReviewFormSchema = z.object({
  // Required fields
  staffId: z.string().uuid('Invalid staff ID'),
  reviewDate: z.date({
    required_error: 'Review date is required',
    invalid_type_error: 'Invalid date format',
  }),
  
  // Email validation
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  
  // Number validation
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  
  // String validation with length
  summary: z.string()
    .min(10, 'Summary must be at least 10 characters')
    .max(1000, 'Summary cannot exceed 1000 characters'),
  
  // Optional with validation
  notes: z.string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
  
  // Custom validation
  salary: z.number().refine(
    (val) => val >= 0 && val <= 1000000,
    { message: 'Salary must be between 0 and 1,000,000' }
  ),
});
```

### Pattern 2: Form State Management
```typescript
interface FormValidationState {
  // Values
  values: Record<string, any>;
  
  // Errors
  errors: Record<string, string>;
  
  // Touched fields
  touched: Record<string, boolean>;
  
  // Form state
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
}

// Custom hook for form validation
const useFormValidation = <T>(
  initialValues: T,
  validationSchema: ZodSchema<T>
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Validate single field
  const validateField = useCallback((field: string, value: any) => {
    try {
      validationSchema.pick({ [field]: true }).parse({ [field]: value });
      setErrors(prev => ({ ...prev, [field]: undefined }));
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0].message }));
      }
      return false;
    }
  }, [validationSchema]);
  
  // Validate all fields
  const validateForm = useCallback(() => {
    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [values, validationSchema]);
  
  return {
    values,
    errors,
    touched,
    setFieldValue: (field: string, value: any) => {
      setValues(prev => ({ ...prev, [field]: value }));
      if (touched[field]) {
        validateField(field, value);
      }
    },
    setFieldTouched: (field: string) => {
      setTouched(prev => ({ ...prev, [field]: true }));
      validateField(field, values[field]);
    },
    validateField,
    validateForm,
    resetForm: () => {
      setValues(initialValues);
      setErrors({});
      setTouched({});
    },
    isValid: Object.keys(errors).length === 0,
    isDirty: JSON.stringify(values) !== JSON.stringify(initialValues),
  };
};
```

### Pattern 3: Error Display Component
```typescript
// Consistent error display
const FormFieldError: React.FC<{
  error?: string;
  touched?: boolean;
}> = ({ error, touched }) => {
  if (!touched || !error) return null;
  
  return (
    <div className="flex items-center gap-1 mt-1">
      <AlertCircle className="h-3 w-3 text-destructive" />
      <span className="text-sm text-destructive">{error}</span>
    </div>
  );
};

// Field wrapper with validation
const ValidatedField: React.FC<{
  name: string;
  label: string;
  required?: boolean;
  children: React.ReactElement;
}> = ({ name, label, required, children }) => {
  const { errors, touched } = useFormContext();
  
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {React.cloneElement(children, {
        id: name,
        'aria-invalid': !!errors[name],
        'aria-describedby': errors[name] ? `${name}-error` : undefined,
      })}
      <FormFieldError 
        error={errors[name]} 
        touched={touched[name]}
      />
    </div>
  );
};
```

## 🎨 Real Examples from TeddyKids

### Example 1: ReviewForm Validation Chaos
```typescript
// ❌ CURRENT: 917 lines with inconsistent validation

// Line 234: Inline validation
if (formData.star_rating < 1 || formData.star_rating > 5) {
  alert('Invalid rating');
}

// Line 456: Different validation style
const isEmailValid = formData.email?.includes('@');
if (!isEmailValid) {
  setError('Email error');
}

// Line 678: Yet another approach
{formData.summary.length < 10 && (
  <span style={{ color: 'red' }}>Too short</span>
)}

// ✅ FIXED: Centralized validation
const reviewSchema = z.object({
  star_rating: z.number().min(1).max(5),
  email: z.string().email(),
  summary: z.string().min(10).max(1000),
  // ... all other fields
});

const ReviewForm = () => {
  const form = useFormValidation(initialValues, reviewSchema);
  
  return (
    <Form {...form}>
      <ValidatedField name="star_rating" label="Rating" required>
        <StarRating />
      </ValidatedField>
      
      <ValidatedField name="email" label="Email" required>
        <Input type="email" />
      </ValidatedField>
      
      <ValidatedField name="summary" label="Summary" required>
        <Textarea maxLength={1000} />
      </ValidatedField>
    </Form>
  );
};
```

### Example 2: Form Accessibility Issues
```typescript
// ❌ CURRENT: No accessibility
<input 
  value={email}
  onChange={e => setEmail(e.target.value)}
/>
{error && <div>{error}</div>}

// ✅ FIXED: Full accessibility
<div role="group" aria-labelledby="email-label">
  <label id="email-label" htmlFor="email-input">
    Email Address
    <span aria-label="required">*</span>
  </label>
  <input
    id="email-input"
    type="email"
    value={email}
    onChange={handleEmailChange}
    aria-required="true"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : "email-hint"}
    autoComplete="email"
  />
  {errors.email && (
    <div id="email-error" role="alert" className="text-destructive">
      <AlertCircle className="inline h-3 w-3" />
      {errors.email}
    </div>
  )}
  <div id="email-hint" className="text-muted-foreground text-sm">
    We'll never share your email
  </div>
</div>
```

## 📊 Validation Rules Library

### Common Validation Rules
```typescript
const ValidationRules = {
  // Text validations
  required: (value: any) => !!value || 'This field is required',
  minLength: (min: number) => (value: string) => 
    value.length >= min || `Must be at least ${min} characters`,
  maxLength: (max: number) => (value: string) =>
    value.length <= max || `Must be no more than ${max} characters`,
  
  // Email validation
  email: (value: string) => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email address',
  
  // Number validations
  min: (min: number) => (value: number) =>
    value >= min || `Must be at least ${min}`,
  max: (max: number) => (value: number) =>
    value <= max || `Must be no more than ${max}`,
  between: (min: number, max: number) => (value: number) =>
    (value >= min && value <= max) || `Must be between ${min} and ${max}`,
  
  // Date validations
  futureDate: (value: Date) =>
    value > new Date() || 'Date must be in the future',
  pastDate: (value: Date) =>
    value < new Date() || 'Date must be in the past',
  dateRange: (start: Date, end: Date) => (value: Date) =>
    (value >= start && value <= end) || 'Date out of range',
  
  // Phone validation (Dutch)
  dutchPhone: (value: string) =>
    /^(06|\+316)\d{8}$/.test(value.replace(/\s/g, '')) || 'Invalid Dutch phone number',
  
  // Custom validations
  strongPassword: (value: string) => {
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);
    const isLongEnough = value.length >= 8;
    
    if (!isLongEnough) return 'Password must be at least 8 characters';
    if (!hasUpper) return 'Password must contain uppercase letter';
    if (!hasLower) return 'Password must contain lowercase letter';
    if (!hasNumber) return 'Password must contain number';
    if (!hasSpecial) return 'Password must contain special character';
    return true;
  },
};
```

## 📋 Form Validation Checklist

### Essential Validations
- [ ] All required fields marked with asterisk (*)
- [ ] Email fields use email validation
- [ ] Phone fields use phone validation
- [ ] Date fields have appropriate constraints
- [ ] Number fields have min/max values
- [ ] Text fields have maxLength
- [ ] Passwords have strength requirements

### User Experience
- [ ] Real-time validation feedback
- [ ] Clear, helpful error messages
- [ ] Errors clear when fixed
- [ ] Submit button disabled when invalid
- [ ] Loading state during submission
- [ ] Success feedback after submit
- [ ] Keyboard navigation works

### Accessibility
- [ ] Labels associated with inputs
- [ ] Required fields have aria-required
- [ ] Invalid fields have aria-invalid
- [ ] Error messages have role="alert"
- [ ] Form has proper fieldset/legend
- [ ] Tab order is logical
- [ ] Screen reader friendly

## 🚀 Quick Commands

### Analyze Form
```
@form-validation-agent analyze this form component
```

### Add Validation
```
@form-validation-agent add validation schema to this form
```

### Fix Errors
```
@form-validation-agent fix validation issues
```

### Generate Schema
```
@form-validation-agent generate Zod schema from form
```

## 🎯 Success Metrics

### Before Validation Agent
```typescript
const beforeMetrics = {
  formsWithValidation: "30%",
  consistentErrorMessages: false,
  averageErrorsPerSubmit: 5,
  userFrustrationScore: 8, // out of 10
  accessibilityScore: 20, // out of 100
  validationCoverage: "45%"
};
```

### After Validation Agent
```typescript
const afterMetrics = {
  formsWithValidation: "100%",
  consistentErrorMessages: true,
  averageErrorsPerSubmit: 0.5,
  userFrustrationScore: 2, // out of 10
  accessibilityScore: 95, // out of 100
  validationCoverage: "100%"
};
```

## 💡 Pro Tips

1. **Start with Schema** - Define validation rules first
2. **Use Zod or Yup** - Type-safe validation
3. **Real-time is Key** - Validate as user types
4. **Clear Messages** - Tell users how to fix errors
5. **Test Edge Cases** - Empty, too long, special chars
6. **Accessibility First** - Screen readers must work
7. **Progressive Enhancement** - HTML5 validation + JS

## ⚠️ Common Pitfalls

```typescript
// AVOID THESE:

// ❌ Generic error messages
"Invalid input" // What's invalid? How to fix?

// ❌ Validating too early
onMount: validateAllFields() // User hasn't done anything yet!

// ❌ Not clearing errors
if (isValid) { submitForm(); } // But error message still shows

// ❌ Blocking paste
onPaste={(e) => e.preventDefault()} // Why??

// ❌ Over-validation
onChange={() => validateEveryFieldInForm()} // Too expensive!
```

## 🎯 Form UX Best Practices

### 1. Progressive Disclosure
```typescript
// Show validation only after interaction
const showError = touched[field] && errors[field];
```

### 2. Inline Validation
```typescript
// Validate as user types (with debounce)
const debouncedValidate = useMemo(
  () => debounce(validateField, 300),
  [validateField]
);
```

### 3. Smart Defaults
```typescript
// Pre-fill sensible defaults
const defaults = {
  country: 'Netherlands',
  currency: 'EUR',
  language: 'nl',
};
```

### 4. Helpful Hints
```typescript
// Guide users before errors
<FormHint>
  Password must be 8+ characters with uppercase, lowercase, and number
</FormHint>
```

---

*Agent Version: 1.0*  
*Last Updated: October 2025*  
*Philosophy: Validate Early, Fail Gracefully*  
*Goal: Zero Form Frustration* 📝
