/**
 * 🔄 SYNC PROGRESS PANEL
 * Real-time progress during sync operations
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2, Clock } from "lucide-react";

interface SyncStep {
  id: string;
  label: string;
  status: 'completed' | 'in_progress' | 'pending' | 'error';
  count?: string;
  error?: string;
}

interface SyncProgressPanelProps {
  isVisible: boolean;
  currentStep: number;
  totalSteps: number;
  progress: number;
  steps: SyncStep[];
}

export function SyncProgressPanel({ 
  isVisible, 
  currentStep, 
  totalSteps, 
  progress, 
  steps 
}: SyncProgressPanelProps) {
  if (!isVisible) return null;

  const getStepIcon = (status: SyncStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-300" />;
      case 'error':
        return <span className="text-red-500">❌</span>;
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🔄 Sync Progress</span>
          <span className="text-sm font-normal text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3" />
          <div className="text-right text-sm text-muted-foreground">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Step List */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                step.status === 'in_progress' 
                  ? 'bg-blue-100 border border-blue-200' 
                  : step.status === 'completed'
                  ? 'bg-green-50'
                  : step.status === 'error'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-gray-50'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getStepIcon(step.status)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-medium ${
                    step.status === 'completed' ? 'text-green-700' :
                    step.status === 'in_progress' ? 'text-blue-700' :
                    step.status === 'error' ? 'text-red-700' :
                    'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {step.count && (
                    <span className="text-sm text-muted-foreground">
                      {step.count}
                    </span>
                  )}
                </div>
                {step.error && (
                  <div className="text-sm text-red-600 mt-1">
                    {step.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Estimated Time */}
        {progress < 100 && (
          <div className="text-center text-sm text-muted-foreground pt-2 border-t">
            Estimated time remaining: ~{Math.max(1, Math.ceil((100 - progress) / 50))} minute{Math.ceil((100 - progress) / 50) === 1 ? '' : 's'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
