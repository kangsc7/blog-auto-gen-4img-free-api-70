
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
    
    saveAppState({ saveReferenceTrigger: true });
    toast({
      title: "외부 링크 정보 저장 완료",
      description: "외부 링크 정보가 성공적으로 저장되었습니다."
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">외부 링크</label>
                <Input
                    placeholder="예: https://worldpis.com"
                    value={appState.referenceLink}
                    onChange={(e) => saveAppState({ referenceLink: e.target.value })}
                    disabled={!appState.selectedTopic}
                />
                <p className="text-xs text-gray-500 mt-1">예: https://worldpis.com</p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">외부 링크 문장</label>
                <Input
                    placeholder="예: 워드프레스 꿀팁 더 보러가기"
                    value={appState.referenceSentence}
                    onChange={(e) => saveAppState({ referenceSentence: e.target.value })}
                    disabled={!appState.selectedTopic}
                />
                <p className="text-xs text-gray-500 mt-1">글 마지막에 삽입될 링크의 텍스트입니다.</p>
            </div>

            <Button
              variant="outline"
              className="w-full bg-white"
              onClick={handleSaveReferenceInfo}
              disabled={!appState.selectedTopic}
            >
              외부 링크 정보 저장
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
