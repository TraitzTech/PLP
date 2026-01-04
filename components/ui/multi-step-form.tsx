import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  isComplete?: boolean;
}

interface MultiStepFormProps {
  steps: FormStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext?: () => boolean | Promise<boolean>;
  onPrevious?: () => void;
  onSubmit?: () => Promise<void>;
  isLoading?: boolean;
  submitButtonText?: string;
  showStepIndicator?: boolean;
}

export function MultiStepForm({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  onSubmit,
  isLoading = false,
  submitButtonText = 'Complete',
  showStepIndicator = true,
}: MultiStepFormProps) {
  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    if (onNext) {
      const canProceed = await onNext();
      if (canProceed && currentStep < steps.length - 1) {
        onStepChange(currentStep + 1);
      }
    } else if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    }
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Step Indicator */}
      {showStepIndicator && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <button
                  onClick={() => {
                    // Allow clicking on completed or current steps
                    if (index <= currentStep || step.isComplete) {
                      onStepChange(index);
                    }
                  }}
                  disabled={index > currentStep && !step.isComplete}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    index === currentStep
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                      : step.isComplete || index < currentStep
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {step.isComplete || index < currentStep ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </button>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      index < currentStep
                        ? 'bg-green-600'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex justify-between text-sm">
            {steps.map((step) => (
              <div key={step.id} className="flex-1">
                <p className="font-medium text-gray-900">{step.title}</p>
                {step.description && (
                  <p className="text-xs text-gray-500">{step.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
              {currentStep + 1}
            </span>
            {currentStepData.title}
          </CardTitle>
          {currentStepData.description && (
            <CardDescription>{currentStepData.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStepData.content}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || isLoading}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium">{currentStep + 1}</span>
          <span>/</span>
          <span>{steps.length}</span>
        </div>

        {isLastStep ? (
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </>
            ) : null}
            {submitButtonText}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
