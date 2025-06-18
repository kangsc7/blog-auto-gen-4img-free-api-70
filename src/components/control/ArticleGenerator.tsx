
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool } from 'lucide-react';
import { AppState } from '@/types';

interface ArticleGeneratorProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  selectTopic: (topic: string) => void;
  isGeneratingContent: boolean;
  generateArticleContent: (options?: { topic?: string; keyword?: string }) => Promise<string | null>;
}

export const ArticleGenerator: React.FC<ArticleGeneratorProps> = ({
  appState,
  saveAppState,
  selectTopic,
  isGeneratingContent,
  generateArticleContent,
}) => {
  const handleGenerateArticle = () => {
    if (!appState.selectedTopic) return;
    generateArticleContent({ topic: appState.selectedTopic, keyword: appState.keyword });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-700">
          <PenTool className="h-5 w-5 mr-2" />
          2. 블로그 글 생성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">선택된 주제</label>
          <div className="p-3 bg-gray-50 rounded border min-h-[50px] flex items-center">
            {appState.selectedTopic ? (
              <span className="text-gray-900">{appState.selectedTopic}</span>
            ) : (
              <span className="text-gray-500">먼저 주제를 선택해주세요</span>
            )}
          </div>
        </div>

        <Button 
          onClick={handleGenerateArticle}
          disabled={!appState.selectedTopic || isGeneratingContent || !appState.isApiKeyValidated}
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
            '블로그 글 생성하기'
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          선택한 주제를 바탕으로 SEO 최적화된 블로그 글을 생성합니다
        </div>
      </CardContent>
    </Card>
  );
};
