
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lightbulb } from 'lucide-react';
import { AppState } from '@/types';

interface TopicGeneratorProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  isGeneratingTopics: boolean;
  generateTopics: () => Promise<void>;
  selectTopic: (topic: string) => void;
}

export const TopicGenerator: React.FC<TopicGeneratorProps> = ({
  appState,
  saveAppState,
  isGeneratingTopics,
  generateTopics,
  selectTopic,
}) => {
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
            value={appState.keyword || ''}
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
          onClick={generateTopics}
          disabled={!(appState.keyword || '').trim() || isGeneratingTopics || !appState.isApiKeyValidated}
          className={`w-full transition-all duration-300 ${
            isGeneratingTopics 
              ? 'bg-orange-500 hover:bg-orange-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isGeneratingTopics ? (
            <span className="flex items-center">
              주제 생성 중
              <span className="ml-1 animate-pulse">
                <span className="animate-bounce inline-block" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce inline-block" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce inline-block" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            </span>
          ) : (
            '주제 생성하기'
          )}
        </Button>

        {/* 주제 목록 표시 */}
        {appState.topics && appState.topics.length > 0 && (
          <div className="border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              생성된 주제 목록 ({appState.topics.length}개)
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {appState.topics.map((topic, index) => (
                <div
                  key={index}
                  onClick={() => selectTopic(topic)}
                  className={`p-3 border rounded cursor-pointer transition-colors text-sm ${
                    appState.selectedTopic === topic 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
