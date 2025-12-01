import { FiCheck } from "react-icons/fi";

const SignupStepper = ({ currentStep, steps }) => {
  return (
    <div className="w-full mb-4 sm:mb-6 md:mb-8">
      <div className="flex items-center justify-between overflow-x-auto pb-2 sm:pb-4 scrollbar-hide">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-colors ${
                    isCompleted
                      ? "bg-sky-500 dark:bg-sky-600 border-sky-500 dark:border-sky-600 text-white"
                      : isCurrent
                      ? "bg-sky-100 dark:bg-sky-900/30 border-sky-500 dark:border-sky-400 text-sky-500 dark:text-sky-400"
                      : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <FiCheck className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  ) : (
                    <span className="font-semibold text-xs sm:text-sm md:text-base">
                      {stepNumber}
                    </span>
                  )}
                </div>
                <span
                  className={`mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium text-center px-0.5 sm:px-1 break-words transition-colors ${
                    isCurrent
                      ? "text-sky-500 dark:text-sky-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{stepNumber}</span>
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-0.5 sm:mx-1 md:mx-2 min-w-[10px] sm:min-w-[60px] transition-colors ${
                    isCompleted
                      ? "bg-sky-500 dark:bg-sky-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SignupStepper;
