
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
  generateTopicsFromKeyword: (keywordOverride?: string) => Promise<string[] | null>;
  manualTopic: string;
  setManualTopic: React.Dispatch<React.SetStateAction<string>>;
  handleManualTopicAdd: () => void;
  preventDuplicates: boolean;
}

export const TopicGenerator: React.FC<TopicGeneratorProps> = ({
  appState,
  saveAppState,
  isGeneratingTopics,
  generateTopicsFromKeyword,
  manualTopic,
  setManualTopic,
  handleManualTopicAdd,
  preventDuplicates,
}) => {
  // Safely access keyword with fallback to empty string
  const keyword = appState?.keyword || '';
  const topicCount = appState?.topicCount || 5;

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
            value={keyword}
            onChange={(e) => saveAppState({ keyword: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">SEO에 최적화된 주제를 생성합니다</p>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">생성할 주제 수: {topicCount}개</label>
          <input
            type="range"
            min="1"
            max="20"
            value={topicCount}
            onChange={(e) => saveAppState({ topicCount: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1개</span>
            <span>20개</span>
          </div>
        </div>

        {/* 중복 설정 상태 표시 */}
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          현재 설정: {preventDuplicates ? '중복 금지 (70% 유사도 기준)' : '중복 허용'}
        </div>

        {/* 주제 생성 규칙 안내 - 강화된 버전 */}
        <div className="text-xs text-red-600 bg-red-50 p-3 rounded border border-red-200">
          <p className="font-bold">🚫 주제 생성 절대 금지 규칙</p>
          <ul className="list-disc pl-4 mt-1 space-y-1">
            <li><strong>모든 연도 숫자 절대 금지</strong> (2023, 2024, 2025, 2026 등)</li>
            <li><strong>"년" 단어 완전 금지</strong> (올해, 내년, 작년, 해당년도 등)</li>
            <li><strong>시기 표현 금지</strong> (상반기, 하반기, 분기 등)</li>
            <li>시간에 구애받지 않는 영구적 주제로만 생성</li>
          </ul>
        </div>

        {/* 실시간 이슈 크롤링 안내 */}
        {keyword.includes('최신 이슈') || keyword.includes('뉴스') || keyword.includes('트렌드') ? (
          <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
            <p className="font-bold">🔴 실시간 이슈 크롤링 활성</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>현재 시간대의 실시간 트렌드를 자동 크롤링합니다</li>
              <li>연도 표기 없이 현재 핫한 이슈들을 반영합니다</li>
              <li>네이버 트렌드와 구글 트렌드 데이터를 활용합니다</li>
            </ul>
          </div>
        ) : null}

        <Button 
          onClick={() => generateTopicsFromKeyword()}
          disabled={!keyword?.trim() || isGeneratingTopics || !appState.isApiKeyValidated}
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
              disabled={!manualTopic?.trim()}
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
