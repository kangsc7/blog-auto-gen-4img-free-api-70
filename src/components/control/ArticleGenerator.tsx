
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PenTool, Square, Palette } from 'lucide-react';
import { AppState } from '@/types';
import { colorThemes } from '@/data/constants';
import { getColors } from '@/lib/promptUtils';

interface ArticleGeneratorProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  selectTopic: (topic: string) => void;
  isGeneratingContent: boolean;
  generateArticleContent: (options?: { topic?: string; keyword?: string }) => Promise<string | null>;
  stopArticleGeneration?: () => void;
}

export const ArticleGenerator: React.FC<ArticleGeneratorProps> = ({
  appState,
  saveAppState,
  selectTopic,
  isGeneratingContent,
  generateArticleContent,
  stopArticleGeneration,
}) => {
  const handleGenerateArticle = () => {
    if (!appState.selectedTopic) return;
    generateArticleContent({ topic: appState.selectedTopic, keyword: appState.keyword });
  };

  const handleStopGeneration = () => {
    if (stopArticleGeneration) {
      stopArticleGeneration();
    }
  };

  const handleColorThemeChange = (value: string) => {
    saveAppState({ colorTheme: value });
    // 고급 설정도 localStorage에 저장
    localStorage.setItem('blog_color_theme', value);
  };

  const getSelectedThemeColors = () => {
    return getColors(appState.colorTheme || 'classic-blue');
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

        {/* 컬러 테마 선택 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Palette className="h-4 w-4 mr-1" />
            컬러 테마 선택
          </label>
          <Select value={appState.colorTheme || ''} onValueChange={handleColorThemeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="컬러 테마를 선택하세요 (미선택시 랜덤)" />
            </SelectTrigger>
            <SelectContent>
              {colorThemes.map((theme) => {
                const colors = getColors(theme.value);
                return (
                  <SelectItem key={theme.value} value={theme.value}>
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2 border" 
                        style={{ backgroundColor: colors.primary }}
                      />
                      {theme.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {appState.colorTheme && (
            <div className="mt-2 p-2 rounded border" style={{ backgroundColor: getSelectedThemeColors().secondary }}>
              <div className="flex items-center text-sm">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: getSelectedThemeColors().primary }}
                />
                <span style={{ color: getSelectedThemeColors().primary }}>
                  선택된 테마: {colorThemes.find(t => t.value === appState.colorTheme)?.label}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateArticle}
            disabled={!appState.selectedTopic || isGeneratingContent || !appState.isApiKeyValidated}
            className={`flex-1 transition-all duration-300 ${
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

          {isGeneratingContent && stopArticleGeneration && (
            <Button
              onClick={handleStopGeneration}
              variant="destructive"
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white px-3"
            >
              <Square className="h-4 w-4 mr-1" />
              중단
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
