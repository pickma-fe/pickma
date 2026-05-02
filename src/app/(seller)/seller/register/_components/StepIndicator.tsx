interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step} className="flex flex-1 items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                index <= currentStep
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`mt-2 text-xs ${
                index <= currentStep
                  ? 'text-primary-500 font-semibold'
                  : 'text-gray-400'
              }`}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`mb-5 h-[1px] flex-1 ${
                index < currentStep ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
