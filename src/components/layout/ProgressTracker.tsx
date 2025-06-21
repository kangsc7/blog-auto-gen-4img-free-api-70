
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ProgressTrackerProps {
  topics: string[];
  generatedContent: string;
  imagePrompt: string;
}

const steps = ['주제 생성', '글 작성', '이미지 생성', '최종 완성'];

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ topics, generatedContent, imagePrompt }) => {
  let preciseActiveStep = 1;
  if (imagePrompt) {
    preciseActiveStep = 4;
  } else if (generatedContent) {
    preciseActiveStep = 3;
  } else if (topics.length > 0) {
    preciseActiveStep = 2;
  }

  const progressPercentage = preciseActiveStep > 1 ? ((preciseActiveStep - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <div className="w-full mb-4">
      <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100">
        <div className="w-full max-w-lg mx-auto">
          <div className="relative">
            <div className="absolute top-5 left-0 w-full h-2 bg-gray-200 rounded-full"></div>
            <div
              className="absolute top-5 left-0 h-2 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
            <div className="flex justify-between items-start">
              {steps.map((label, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < preciseActiveStep;
                const isActive = stepNumber === preciseActiveStep;
                return (
                  <div key={label} className="relative text-center" style={{ width: '65px' }}>
                    <div
                      className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500 z-10 relative ${
                        isActive
                          ? 'bg-blue-500 text-white border-blue-500 scale-110 shadow-lg'
                          : isCompleted
                          ? 'bg-teal-400 text-white border-teal-400 shadow-md'
                          : 'bg-white text-gray-500 border-gray-300'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : stepNumber}
                    </div>
                    <p
                      className={`mt-2 text-xs font-semibold transition-colors duration-500 ${
                        isActive || isCompleted ? 'text-gray-800' : 'text-gray-500'
                      }`}
                    >
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="text-right text-sm text-gray-700 mt-4 font-medium">
          생성된 주제 목록: {topics.length}개 생성됨
        </div>
      </div>
    </div>
  );
};
