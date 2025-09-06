import React from 'react';
import EnrollmentStepIcon from './StepIcon';

function EnrollmentProgressBar({
  currentStep,
  completedSteps,
  isStepCompleted,
  isStepCurrent,
  isStepRejected
}) {
  const stepLabels = [
    'Enrollment Form',
    'Verification',
    'Payment',
    'Verification',
    ''
  ];

  const step4Completed = isStepCompleted(4);

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto">
      <ol className="flex flex-col sm:flex-row sm:justify-between w-full relative">
        {/* Step 1 */}
        <li className="flex items-start gap-x-4 sm:block sm:shrink relative pb-2 sm:pb-0 sm:flex-1">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 flex items-center justify-center rounded-full lg:h-12 lg:w-12 relative z-10 bg-green-100">
              <EnrollmentStepIcon
                stepNumber={1}
                isCompleted={true}
                isCurrent={false}
              />
            </div>
          </div>
          <div className="flex-1 sm:mt-2.5">
            <span className="block text-sm font-medium text-green-600">Step 1</span>
            <span className="block text-sm text-green-600">{stepLabels[0]}</span>
          </div>
          <div className={`hidden sm:block absolute top-5 lg:top-6 left-10 lg:left-12 right-0 h-1 bg-green-100 z-0`}></div>
        </li>

        {/* Steps 2-4 */}
        {[2, 3, 4].map(stepNumber => (
          <li key={stepNumber} className="flex items-start gap-x-4 sm:block sm:shrink relative pb-2 sm:pb-0 sm:flex-1">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full lg:h-12 lg:w-12 relative z-10 ${(stepNumber === 2 || stepNumber === 4) && isStepRejected && isStepRejected(stepNumber) ? 'bg-red-100' :
                isStepCompleted(stepNumber) ? 'bg-green-100' :
                  isStepCurrent(stepNumber) ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                {(stepNumber === 2 || stepNumber === 4) && isStepRejected && isStepRejected(stepNumber) ? (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <EnrollmentStepIcon
                    stepNumber={stepNumber}
                    isCompleted={isStepCompleted(stepNumber)}
                    isCurrent={isStepCurrent(stepNumber)}
                  />
                )}
              </div>
            </div>
            <div className="flex-1 sm:mt-2.5">
              <span className={`block text-sm font-medium ${(stepNumber === 2 || stepNumber === 4) && isStepRejected && isStepRejected(stepNumber) ? 'text-red-600' :
                isStepCompleted(stepNumber) ? 'text-green-600' :
                  isStepCurrent(stepNumber) ? 'text-yellow-600' : 'text-gray-500'
                }`}>
                Step {stepNumber}
              </span>
              <span className={`block text-sm ${(stepNumber === 2 || stepNumber === 4) && isStepRejected && isStepRejected(stepNumber) ? 'text-red-600' :
                isStepCompleted(stepNumber) ? 'text-green-600' :
                  isStepCurrent(stepNumber) ? 'text-yellow-600' : 'text-gray-500'
                }`}>
                {stepLabels[stepNumber - 1]}
              </span>
            </div>
            
            {/* Connection line */}
            {stepNumber < 5 && (
              <div className={`hidden sm:block absolute top-5 lg:top-6 left-10 lg:left-12 right-0 h-1 ${stepNumber === 2 ? (isStepCurrent(3) || isStepCompleted(3) ? 'bg-green-100' : 'bg-gray-300') :
                stepNumber === 3 ? (isStepCurrent(4) || isStepCompleted(4) ? 'bg-green-100' : 'bg-gray-300') :
                  stepNumber === 4 ? (isStepCompleted(4) ? 'bg-green-100' : 'bg-gray-300') :
                    'bg-gray-300'
                } z-0`}></div>
            )}
          </li>
        ))}

        {/* Step 5 */}
        <li className="flex items-start gap-x-4 sm:block sm:shrink relative">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full lg:h-12 lg:w-12 relative z-10 ${(step4Completed || isStepCompleted(5)) ? 'bg-green-100' :
              isStepCurrent(5) ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
              <EnrollmentStepIcon
                stepNumber={5}
                isCompleted={step4Completed || isStepCompleted(5)}
                isCurrent={isStepCurrent(5)}
              />
            </div>
          </div>
          <div className="flex-1 sm:mt-2.5">
            <span className={`block text-sm font-medium ${(step4Completed || isStepCompleted(5)) ? 'text-green-600' :
              isStepCurrent(5) ? 'text-yellow-600' : 'text-gray-500'
              }`}>
              Complete
            </span>
          </div>
        </li>
      </ol>
    </div>
  );
}

export default EnrollmentProgressBar;