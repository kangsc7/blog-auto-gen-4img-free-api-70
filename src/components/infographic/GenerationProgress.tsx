
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
    <>
      <style>
        {`
          @keyframes wave {
            0%, 60%, 100% {
              transform: translateY(0);
            }
            30% {
              transform: translateY(-10px);
            }
          }
          
          .animate-wave {
            animation: wave 1.5s ease-in-out infinite;
          }
        `}
      </style>
      <Card className="mb-8 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <Brain className="h-12 w-12 text-purple-600 mx-auto mb-3 animate-pulse" />
            <h3 className="text-xl font-semibold text-gray-800">GEM 시스템 작동 중...</h3>
            <p className="text-gray-600 mb-2">{currentStep}</p>
            <p className="text-sm text-gray-500">지능형 웹 컴포넌트 조립 시스템</p>
            
            {/* 파코월드 애니메이션 메시지 */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <div className="flex items-center justify-center space-x-1">
                <span className="inline-block animate-wave text-blue-600 font-bold text-lg">파</span>
                <span className="inline-block animate-wave text-purple-600 font-bold text-lg" style={{animationDelay: '0.1s'}}>코</span>
                <span className="inline-block animate-wave text-pink-600 font-bold text-lg" style={{animationDelay: '0.2s'}}>월</span>
                <span className="inline-block animate-wave text-indigo-600 font-bold text-lg" style={{animationDelay: '0.3s'}}>드</span>
                <span className="text-gray-700 ml-2">가 매력적인 인포그래픽을 작성하고 있습니다...</span>
              </div>
            </div>
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
    </>
  );
};

export default GenerationProgress;
