
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lightbulb, RefreshCcw } from 'lucide-react';
import { AppState } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface TopicGeneratorProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  isGeneratingTopics: boolean;
  generateTopicsFromKeyword: () => void;
  manualTopic: string;
  setManualTopic: React.Dispatch<React.SetStateAction<string>>;
  handleManualTopicAdd: () => void;
}

export const TopicGenerator: React.FC<TopicGeneratorProps> = ({
  appState,
  saveAppState,
  isGeneratingTopics,
  generateTopicsFromKeyword,
  manualTopic,
  setManualTopic,
  handleManualTopicAdd,
}) => {
  const { toast } = useToast();

  const handleDeduplicateTopics = () => {
    if (appState.topics.length === 0) {
      toast({ title: "알림", description: "제거할 주제가 없습니다.", variant: "default" });
      return;
    }
    const uniqueTopics = Array.from(new Set(appState.topics));
    const removedCount = appState.topics.length - uniqueTopics.length;
    if (removedCount > 0) {
      saveAppState({ topics: uniqueTopics });
      toast({
        title: "중복 제거 완료",
        description: `${removedCount}개의 중복된 주제가 제거되었습니다.`
      });
    } else {
      toast({
        title: "중복 없음",
        description: "중복된 주제가 없습니다."
      });
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-700">
          <Lightbulb className="h-5 w-5 mr-2" />
          1. 주제 생성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">핵심 키워드</label>
          <Input
            placeholder="예: 프로그래밍, 요리, 투자, 건강 등"
            value={appState.keyword}
            onChange={(e) => saveAppState({ keyword: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">SEO에 최적화된 주제를 생성합니다</p>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">생성할 주제 수: {appState.topicCount}개</label>
          <input
            type="range"
            min="1"
            max="20"
            value={appState.topicCount}
            onChange={(e) => saveAppState({ topicCount: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1개</span>
            <span>20개</span>
          </div>
        </div>

        <Button 
          onClick={() => generateTopicsFromKeyword()}
          disabled={!appState.keyword.trim() || isGeneratingTopics || !appState.isApiKeyValidated}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isGeneratingTopics ? '주제 생성 중...' : '주제 생성하기'}
        </Button>

        <div className="space-y-2">
            <Button
                onClick={handleDeduplicateTopics}
                disabled={appState.topics.length === 0}
                variant="outline"
                className="w-full"
            >
                <RefreshCcw className="h-4 w-4 mr-2" />
                중복 주제 제거
            </Button>
            <p className="text-xs text-center text-gray-500">AI가 생성한 주제 목록에서 중복된 항목을 제거합니다.</p>
        </div>

        <div className="border-t pt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">수동 주제 입력</label>
          <div className="flex space-x-2">
            <Input
              placeholder="직접 주제를 입력해주세요"
              value={manualTopic}
              onChange={(e) => setManualTopic(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleManualTopicAdd}
              disabled={!manualTopic.trim()}
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              추가
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
