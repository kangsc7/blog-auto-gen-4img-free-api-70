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

  const canGenerate = 
    appState.isApiKeyValidated && 
    appState.isPixabayKeyValidated && 
    appState.isHuggingFaceKeyValidated;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-700">
          <Lightbulb className="h-5 w-5 mr-2" />
          2. 블로그 글 생성
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            API 키를 모두 설정하고 검증해야 글을 생성할 수 있습니다.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
