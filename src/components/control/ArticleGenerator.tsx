
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PenTool, Square, Palette, Eye } from 'lucide-react';
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

        {/* 고급 설정 섹션 */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            고급 설정
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">시각 요약 카드</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">활성화</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">섹션별 글자 수</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">200-270자</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">웹 크롤링 기반 콘텐츠</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">활성화</span>
            </div>
          </div>
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

        <div className="text-xs text-gray-500 text-center">
          선택한 주제를 바탕으로 SEO 최적화된 블로그 글을 생성합니다
          {appState.isPixabayApiKeyValidated && (
            <div className="mt-1 text-blue-600">✓ Pixabay 이미지 자동 첨부 활성화</div>
          )}
          <div className="mt-1 text-green-600">✓ 컬러테마, 시각요약카드, 섹션글자수 제한 적용</div>
        </div>
      </CardContent>
    </Card>
  );
};
