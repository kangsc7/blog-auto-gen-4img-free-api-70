
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { AppState } from '@/types';
import { colorThemes } from '@/data/constants';
import { useToast } from '@/hooks/use-toast';

interface ArticleGeneratorProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  selectTopic: (topic: string) => void;
  isGeneratingContent: boolean;
  generateArticleContent: (topic?: string) => Promise<string | null>;
}

export const ArticleGenerator: React.FC<ArticleGeneratorProps> = ({
  appState,
  saveAppState,
  selectTopic,
  isGeneratingContent,
  generateArticleContent
}) => {
  const { toast } = useToast();

  const handleSaveReferenceInfo = () => {
    if (!appState.referenceLink && !appState.referenceSentence) {
      toast({
        title: "저장할 정보가 없습니다",
        description: "외부 링크 또는 링크 문장을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    // 외부 링크 정보를 즉시 appState에 저장
    const updates: Partial<AppState> = {};
    
    if (appState.referenceLink) {
      updates.referenceLink = appState.referenceLink;
    }
    
    if (appState.referenceSentence) {
      updates.referenceSentence = appState.referenceSentence;
    }
    
    // saveReferenceTrigger를 true로 설정하여 저장 트리거
    updates.saveReferenceTrigger = true;
    
    saveAppState(updates);
    
    toast({
      title: "외부 링크 정보 저장 완료",
      description: `외부 링크: ${appState.referenceLink || '미설정'}, 링크 문장: ${appState.referenceSentence || '미설정'}`
    });
  };

  return (
    <Card className={`shadow-md ${appState.topics.length === 0 ? 'opacity-50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center text-green-700">
          <Edit className="h-5 w-5 mr-2" />
          2. 글 작성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">선택된 주제</label>
          <Select
            value={appState.selectedTopic}
            onValueChange={(value) => selectTopic(value)}
            disabled={appState.topics.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="주제를 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              {appState.topics.map((topic, index) => (
                <SelectItem key={index} value={topic}>{topic}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">컬러 테마</label>
          <Select
            value={appState.colorTheme}
            onValueChange={(value) => saveAppState({ colorTheme: value })}
            disabled={!appState.selectedTopic}
          >
            <SelectTrigger>
              <SelectValue placeholder="랜덤 선택 (권장)" />
            </SelectTrigger>
            <SelectContent>
              {colorThemes.map((theme) => (
                <SelectItem key={theme.value} value={theme.value}>{theme.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border p-4 rounded-lg space-y-4 bg-gray-50/50 shadow-inner">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  외부 링크 
                  <span className="text-xs text-gray-500 ml-2">(글 하단에 표시됩니다)</span>
                </label>
                <Input
                    placeholder="예: https://worldpis.com"
                    value={appState.referenceLink || ''}
                    onChange={(e) => saveAppState({ referenceLink: e.target.value })}
                    disabled={!appState.selectedTopic}
                />
                <p className="text-xs text-gray-500 mt-1">완전한 URL을 입력해주세요 (http:// 또는 https:// 포함)</p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  외부 링크 문장
                  <span className="text-xs text-gray-500 ml-2">(클릭 가능한 텍스트)</span>
                </label>
                <Input
                    placeholder="예: 더 많은 정보 확인하기"
                    value={appState.referenceSentence || ''}
                    onChange={(e) => saveAppState({ referenceSentence: e.target.value })}
                    disabled={!appState.selectedTopic}
                />
                <p className="text-xs text-gray-500 mt-1">사용자가 클릭할 링크의 텍스트입니다.</p>
            </div>

            <Button
              variant="outline"
              className="w-full bg-white hover:bg-gray-50"
              onClick={handleSaveReferenceInfo}
              disabled={!appState.selectedTopic}
            >
              외부 링크 정보 즉시 적용
            </Button>
        </div>

        <Button 
          onClick={() => generateArticleContent()}
          disabled={!appState.selectedTopic || isGeneratingContent || !appState.isApiKeyValidated}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isGeneratingContent ? '글 생성 중...' : '글 생성하기'}
        </Button>
      </CardContent>
    </Card>
  );
};
