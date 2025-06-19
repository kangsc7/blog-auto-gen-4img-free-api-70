
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface TopNavigationProps {
  resetAppState?: () => void;
  preventDuplicates?: boolean;
  setPreventDuplicates?: (value: boolean) => void;
  canUseFeatures?: boolean;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  resetAppState,
  preventDuplicates,
  setPreventDuplicates,
  canUseFeatures
}) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">AI 블로그 생성기</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 중복 방지 토글 */}
            {setPreventDuplicates && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">중복 방지:</span>
                <Button
                  variant={preventDuplicates ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreventDuplicates(!preventDuplicates)}
                >
                  {preventDuplicates ? "켜짐" : "꺼짐"}
                </Button>
              </div>
            )}
            
            {/* 초기화 버튼 */}
            {resetAppState && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetAppState}
                className="flex items-center space-x-1"
              >
                <RotateCcw className="h-4 w-4" />
                <span>초기화</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
