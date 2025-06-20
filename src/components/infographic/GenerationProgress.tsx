
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain } from 'lucide-react';

interface GenerationProgressProps {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({ 
  isGenerating, 
  progress, 
  currentStep 
}) => {
  if (!isGenerating) return null;

  return (
    <Card className="mb-8 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <Brain className="h-12 w-12 text-purple-600 mx-auto mb-3 animate-pulse" />
          <h3 className="text-xl font-semibold text-gray-800">GEM 시스템 작동 중...</h3>
          <p className="text-gray-600 mb-2">{currentStep}</p>
          <p className="text-sm text-gray-500">지능형 웹 컴포넌트 조립 시스템</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-center mt-2 text-sm text-gray-600">{Math.floor(progress)}% 완료</p>
      </CardContent>
    </Card>
  );
};

export default GenerationProgress;
