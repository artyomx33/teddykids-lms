/**
 * 🧪 HIRING WIDGET COMPONENT
 * Multi-step application form with Labs 2.0 styling
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  ChevronRight,
  ChevronLeft,
  Upload,
  Check,
  AlertCircle,
  Sparkles,
  FileText,
  MapPin,
  User,
  Heart,
  Shield,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HiringWidgetProps, WidgetFormData, WidgetStep, FormValidationError } from "@/types/hiring";

// Widget steps configuration
const WIDGET_STEPS: Array<{
  id: WidgetStep;
  title: string;
  description: string;
  icon: any;
  required: boolean;
}> = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Tell us about yourself',
    icon: User,
    required: true
  },
  {
    id: 'address',
    title: 'Address Details',
    description: 'Where are you located?',
    icon: MapPin,
    required: false
  },
  {
    id: 'professional',
    title: 'Professional Background',
    description: 'Your experience and education',
    icon: Users,
    required: true
  },
  {
    id: 'preferences',
    title: 'Position Preferences',
    description: 'What type of role interests you?',
    icon: Heart,
    required: true
  },
  {
    id: 'documents',
    title: 'Documents',
    description: 'Upload your CV and documents',
    icon: FileText,
    required: true
  },
  {
    id: 'consent',
    title: 'Privacy & Consent',
    description: 'GDPR compliance and permissions',
    icon: Shield,
    required: true
  },
  {
    id: 'assessments',
    title: 'Skills Assessment',
    description: 'Complete required assessments',
    icon: Sparkles,
    required: true
  }
];

const initialFormData: WidgetFormData = {
  full_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  address_street: '',
  address_city: '',
  address_postal_code: '',
  address_country: 'Netherlands',
  current_position: '',
  current_company: '',
  years_experience: 0,
  education_level: '',
  preferred_positions: [],
  preferred_work_type: '',
  available_start_date: '',
  salary_expectation_min: 0,
  salary_expectation_max: 0,
  privacy_consent: false,
  marketing_consent: false
};

export function HiringWidget({
  positions = [],
  onComplete,
  onAnalytics,
  className,
  theme = 'dark',
  embedded = false,
  sessionId
}: HiringWidgetProps) {
  const [currentStep, setCurrentStep] = useState<WidgetStep>('basic');
  const [formData, setFormData] = useState<WidgetFormData>(initialFormData);
  const [errors, setErrors] = useState<FormValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<WidgetStep>>(new Set());

  const currentStepIndex = WIDGET_STEPS.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / WIDGET_STEPS.length) * 100;

  // Track analytics on step changes
  useEffect(() => {
    if (onAnalytics && sessionId) {
      onAnalytics({
        session_id: sessionId,
        event_type: currentStep === 'basic' ? 'widget_load' : 'form_step',
        event_data: { step: currentStep, step_index: currentStepIndex },
        user_agent: navigator.userAgent,
        referrer_url: document.referrer
      });
    }
  }, [currentStep, currentStepIndex, onAnalytics, sessionId]);

  const validateStep = (step: WidgetStep): boolean => {
    const stepErrors: FormValidationError[] = [];

    switch (step) {
      case 'basic':
        if (!formData.full_name) stepErrors.push({ field: 'full_name', message: 'Full name is required' });
        if (!formData.email) stepErrors.push({ field: 'email', message: 'Email is required' });
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          stepErrors.push({ field: 'email', message: 'Invalid email format' });
        }
        break;

      case 'professional':
        if (!formData.education_level) stepErrors.push({ field: 'education_level', message: 'Education level is required' });
        break;

      case 'preferences':
        if (formData.preferred_positions.length === 0) {
          stepErrors.push({ field: 'preferred_positions', message: 'Please select at least one position' });
        }
        break;

      case 'consent':
        if (!formData.privacy_consent) {
          stepErrors.push({ field: 'privacy_consent', message: 'Privacy consent is required' });
        }
        break;
    }

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < WIDGET_STEPS.length) {
        setCurrentStep(WIDGET_STEPS[nextIndex].id);
      }
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(WIDGET_STEPS[prevIndex].id);
    }
  };

  const updateFormData = (updates: Partial<WidgetFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    setErrors(prev => prev.filter(error => !updatedFields.includes(error.field)));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Track completion analytics
      if (onAnalytics && sessionId) {
        onAnalytics({
          session_id: sessionId,
          event_type: 'form_complete',
          event_data: { completed_steps: Array.from(completedSteps) },
          user_agent: navigator.userAgent
        });
      }

      // TODO: Submit to API
      // const candidate = await createCandidate(formData);
      // const application = await submitApplication(candidate.id, selectedPositionId);

      if (onComplete) {
        // onComplete(candidate, application);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepBaseClasses = embedded
    ? "bg-white/95 border-gray-200"
    : "bg-black/30 backdrop-blur-lg border-purple-500/30";

  const textClasses = embedded
    ? "text-gray-900"
    : "text-white";

  const secondaryTextClasses = embedded
    ? "text-gray-600"
    : "text-purple-300";

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      {/* Header */}
      <Card className={stepBaseClasses}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Users className={cn("h-8 w-8", embedded ? "text-blue-600" : "text-purple-400")} />
                <div className={cn(
                  "absolute -top-1 -right-1 h-3 w-3 rounded-full animate-pulse",
                  embedded ? "bg-blue-500" : "bg-purple-500"
                )} />
              </div>
              <div>
                <CardTitle className={cn("text-2xl font-bold", textClasses)}>
                  Join TeddyKids Team
                </CardTitle>
                <p className={cn("text-sm", secondaryTextClasses)}>
                  Start your journey in quality childcare
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                embedded
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-purple-500/20 text-purple-300 border-purple-500/30"
              )}
            >
              <Clock className="h-3 w-3 mr-1" />
              ~10 minutes
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-2">
              <span className={secondaryTextClasses}>
                Step {currentStepIndex + 1} of {WIDGET_STEPS.length}
              </span>
              <span className={secondaryTextClasses}>
                {Math.round(progress)}% complete
              </span>
            </div>
            <Progress
              value={progress}
              className={cn(
                "h-2",
                embedded ? "bg-gray-200" : "bg-purple-900/30"
              )}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
        {WIDGET_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = completedSteps.has(step.id);
          const isAccessible = index <= currentStepIndex;

          return (
            <Button
              key={step.id}
              variant="outline"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 p-3 h-auto transition-all duration-200",
                isActive && (embedded
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-purple-500/30 border-purple-500/50 text-white"
                ),
                isCompleted && !isActive && (embedded
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-green-500/20 border-green-500/50 text-green-300"
                ),
                !isAccessible && (embedded
                  ? "opacity-50 cursor-not-allowed"
                  : "opacity-30 cursor-not-allowed"
                ),
                embedded
                  ? "border-gray-200 text-gray-600 hover:bg-gray-50"
                  : "border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
              )}
              onClick={() => isAccessible && setCurrentStep(step.id)}
              disabled={!isAccessible}
            >
              <div className="relative">
                <Icon className="h-4 w-4" />
                {isCompleted && (
                  <Check className="h-3 w-3 absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5" />
                )}
              </div>
              <span className="text-xs font-medium hidden md:block">
                {step.title}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Current Step Content */}
      <Card className={stepBaseClasses}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", textClasses)}>
            {(() => {
              const Icon = WIDGET_STEPS[currentStepIndex].icon;
              return <Icon className="h-5 w-5" />;
            })()}
            {WIDGET_STEPS[currentStepIndex].title}
          </CardTitle>
          <p className={secondaryTextClasses}>
            {WIDGET_STEPS[currentStepIndex].description}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step Content Components */}
          {currentStep === 'basic' && (
            <BasicInformationStep
              formData={formData}
              onUpdate={updateFormData}
              errors={errors}
              embedded={embedded}
            />
          )}

          {currentStep === 'address' && (
            <AddressStep
              formData={formData}
              onUpdate={updateFormData}
              errors={errors}
              embedded={embedded}
            />
          )}

          {currentStep === 'professional' && (
            <ProfessionalStep
              formData={formData}
              onUpdate={updateFormData}
              errors={errors}
              embedded={embedded}
            />
          )}

          {currentStep === 'preferences' && (
            <PreferencesStep
              formData={formData}
              onUpdate={updateFormData}
              positions={positions}
              errors={errors}
              embedded={embedded}
            />
          )}

          {currentStep === 'documents' && (
            <DocumentsStep
              formData={formData}
              onUpdate={updateFormData}
              errors={errors}
              embedded={embedded}
            />
          )}

          {currentStep === 'consent' && (
            <ConsentStep
              formData={formData}
              onUpdate={updateFormData}
              errors={errors}
              embedded={embedded}
            />
          )}

          {currentStep === 'assessments' && (
            <AssessmentsStep
              formData={formData}
              onComplete={handleSubmit}
              isSubmitting={isSubmitting}
              embedded={embedded}
            />
          )}

          {/* Error Display */}
          {errors.length > 0 && (
            <div className={cn(
              "p-4 rounded-lg border",
              embedded
                ? "bg-red-50 border-red-200"
                : "bg-red-500/10 border-red-500/30"
            )}>
              <div className="flex items-start gap-2">
                <AlertCircle className={cn("h-4 w-4 mt-0.5", embedded ? "text-red-600" : "text-red-400")} />
                <div>
                  <p className={cn("font-medium text-sm", embedded ? "text-red-800" : "text-red-300")}>
                    Please fix the following errors:
                  </p>
                  <ul className={cn("mt-1 text-sm list-disc list-inside", embedded ? "text-red-700" : "text-red-400")}>
                    {errors.map((error, index) => (
                      <li key={index}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className={cn(
                embedded
                  ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                  : "border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:text-white"
              )}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep !== 'assessments' ? (
              <Button
                onClick={nextStep}
                className={cn(
                  embedded
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                )}
              >
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  embedded
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                {isSubmitting ? "Submitting..." : "Complete Application"}
                <Check className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step Components (simplified for brevity - full implementation would be separate files)
interface StepProps {
  formData: WidgetFormData;
  onUpdate: (updates: Partial<WidgetFormData>) => void;
  errors: FormValidationError[];
  embedded: boolean;
}

function BasicInformationStep({ formData, onUpdate, errors, embedded }: StepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Form fields implementation */}
      <div className="space-y-2">
        <label className={cn("text-sm font-medium", embedded ? "text-gray-700" : "text-white")}>
          Full Name *
        </label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => onUpdate({ full_name: e.target.value })}
          className={cn(
            "w-full px-3 py-2 border rounded-lg",
            embedded
              ? "border-gray-300 bg-white text-gray-900"
              : "border-purple-500/30 bg-black/20 text-white placeholder-purple-300"
          )}
          placeholder="Enter your full name"
        />
      </div>
      {/* Additional fields... */}
    </div>
  );
}

function AddressStep({ formData, onUpdate, errors, embedded }: StepProps) {
  return <div>Address form implementation...</div>;
}

function ProfessionalStep({ formData, onUpdate, errors, embedded }: StepProps) {
  return <div>Professional background form...</div>;
}

interface PreferencesStepProps extends StepProps {
  positions: any[];
}

function PreferencesStep({ formData, onUpdate, positions, errors, embedded }: PreferencesStepProps) {
  return <div>Position preferences form...</div>;
}

function DocumentsStep({ formData, onUpdate, errors, embedded }: StepProps) {
  return <div>Document upload interface...</div>;
}

function ConsentStep({ formData, onUpdate, errors, embedded }: StepProps) {
  return <div>GDPR consent checkboxes...</div>;
}

interface AssessmentsStepProps {
  formData: WidgetFormData;
  onComplete: () => void;
  isSubmitting: boolean;
  embedded: boolean;
}

function AssessmentsStep({ formData, onComplete, isSubmitting, embedded }: AssessmentsStepProps) {
  return <div>Assessment completion interface...</div>;
}