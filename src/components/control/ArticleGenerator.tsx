
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { AppState } from '@/types';

interface ArticleGeneratorProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  selectTopic: (topic: string) => void;
  isGeneratingContent: boolean;
  generateArticleContent: (options?: { topic?: string; keyword?: string }) => Promise<string | null>;
  stopArticleGeneration: () => void;
}

export const ArticleGenerator: React.FC<ArticleGeneratorProps> = ({
  appState,
  saveAppState,
  selectTopic,
  isGeneratingContent,
  generateArticleContent,
  stopArticleGeneration,
}) => {
  const [generatingForTopic, setGeneratingForTopic] = useState<string>('');

  const handleTopicSelect = (topic: string) => {
    console.log('ArticleGenerator - 주제 선택:', topic);
    selectTopic(topic);
    
    if (generatingForTopic === topic) {
      console.log('동일한 주제로 이미 생성 중입니다.');
      return;
    }

    // 이미 생성 중인 경우 중단
    if (isGeneratingContent) {
      console.log('기존 생성 작업 중단 후 새로운 주제로 시작');
      stopArticleGeneration();
      
      setTimeout(() => {
        setGeneratingForTopic(topic);
        generateArticleContent({ topic });
      }, 500);
    } else {
      setGeneratingForTopic(topic);
      generateArticleContent({ topic });
    }
  };

  // API 키 검증 상태 확인 (Gemini는 필수, 나머지는 선택사항)
  const canGenerate = appState.isApiKeyValidated; // Gemini API 키만 필수
  const hasPixabay = appState.isPixabayKeyValidated;
  const hasHuggingFace = appState.isHuggingFaceKeyValidated;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-700">
          <Lightbulb className="h-5 w-5 mr-2" />
          2. 블로그 글 생성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API 키 상태 표시 */}
        <div className="text-xs bg-gray-50 p-3 rounded border">
          <p className="font-semibold mb-2">🔑 API 키 상태:</p>
          <div className="grid grid-cols-1 gap-1">
            <div className={`flex items-center ${appState.isApiKeyValidated ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{appState.isApiKeyValidated ? '✅' : '❌'}</span>
              <span>Gemini API (필수)</span>
            </div>
            <div className={`flex items-center ${hasPixabay ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{hasPixabay ? '✅' : '⚪'}</span>
              <span>Pixabay API (이미지 자동 수집용)</span>
            </div>
            <div className={`flex items-center ${hasHuggingFace ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{hasHuggingFace ? '✅' : '⚪'}</span>
              <span>HuggingFace API (이미지 생성용)</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => handleTopicSelect(appState.selectedTopic)}
          disabled={!appState.selectedTopic || isGeneratingContent || !canGenerate}
          className={`w-full transition-all duration-300 ${
            isGeneratingContent
              ? 'bg-orange-500 hover:bg-orange-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isGeneratingContent ? (
            <span className="flex items-center">
              글 생성 중
              <span className="ml-1 animate-pulse">
                <span className="animate-bounce inline-block" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce inline-block" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce inline-block" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            </span>
          ) : (
            appState.selectedTopic ? `"${appState.selectedTopic}" 주제로 글 생성하기` : '주제를 먼저 선택해주세요'
          )}
        </Button>
        
        {!canGenerate && (
          <p className="text-xs text-red-500 mt-2">
            Gemini API 키를 설정하고 검증해야 글을 생성할 수 있습니다.
          </p>
        )}
        
        {canGenerate && (!hasPixabay || !hasHuggingFace) && (
          <p className="text-xs text-amber-600 mt-2">
            추가 기능 사용 가능: {!hasPixabay ? 'Pixabay API (이미지 자동 수집)' : ''} {!hasHuggingFace ? 'HuggingFace API (이미지 생성)' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
