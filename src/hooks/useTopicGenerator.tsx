
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import similarity from 'string-similarity';
import { AppState } from '@/types';
import { RealTimeTrendCrawler } from '@/lib/realTimeTrendCrawler';

interface UseTopicGeneratorProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
}

export const useTopicGenerator = ({ appState, saveAppState }: UseTopicGeneratorProps) => {
  const { toast } = useToast();
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);

  const generateTopics = async (): Promise<string[] | null> => {
    if (!appState.keyword) {
      toast({
        title: "키워드 누락",
        description: "주제를 생성하려면 먼저 핵심 키워드를 입력해야 합니다.",
        variant: "destructive",
      });
      return null;
    }

    if (!appState.isApiKeyValidated) {
      toast({
        title: "API 키 검증 필요",
        description: "먼저 API 키를 입력하고 검증해주세요.",
        variant: "destructive",
      });
      return null;
    }

    setIsGeneratingTopics(true);

    try {
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;
      
      // 최신 이슈 키워드인 경우 실시간 크롤링 수행
      let enhancedKeyword = appState.keyword;
      if (appState.keyword.includes('최신 이슈') || appState.keyword.includes('뉴스') || appState.keyword.includes('트렌드')) {
        try {
          console.log('실시간 이슈 크롤링 시작...');
          const latestTrends = await RealTimeTrendCrawler.getLatestTrends(appState.apiKey!);
          if (latestTrends.length > 0) {
            enhancedKeyword = `${appState.keyword}, 실시간 이슈: ${latestTrends.slice(0, 5).join(', ')}`;
            console.log('크롤링된 실시간 이슈:', latestTrends.slice(0, 5));
          }
        } catch (error) {
          console.error('실시간 이슈 크롤링 오류:', error);
        }
      }
      
      const prompt = `주어진 키워드를 기반으로 블로그 주제 5개만 추천해주세요.

**절대 금지 사항 (매우 중요!):**
- 모든 연도 표기 절대 금지 (2023, 2024, 2025, 2026 등 어떤 연도든 절대 포함 금지)
- "년" 단어가 포함된 모든 표현 절대 금지 (올해, 내년, 작년, 해당년도 등)
- 시기 표현 금지 (하반기, 상반기, 분기 등)

**주제 생성 규칙:**
- 5가지 주제만 제공
- 간결하고 명확한 제목
- 번호나 다른 설명 없이 제목만 제공
- 시간에 구애받지 않는 주제로 생성
- 연도나 "년"이 포함되지 않은 키워드만 사용

키워드: ${enhancedKeyword}

각 주제는 연도 표기 없이 현재 시점에서 유용한 내용으로 작성해주세요.`;

      const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API 요청에 실패했습니다.');
      }

      const data = await response.json();
      const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawContent) {
        throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
      }

      // 정규 표현식을 사용하여 각 줄에서 제목만 추출합니다.
      const topicRegex = /^(?:[0-9]+\.\s)?(.+)$/gm;
      let match;
      const topics: string[] = [];

      while ((match = topicRegex.exec(rawContent)) !== null) {
        const topic = match[1].trim();
        if (topic) {
          topics.push(topic);
        }
      }

      // 연도가 포함된 주제 필터링
      const filteredTopics = topics.filter(topic => 
        !topic.includes('2023') && 
        !topic.includes('2024') && 
        !topic.includes('2025') && 
        !topic.includes('2026') && 
        !topic.includes('년') &&
        !topic.includes('올해') &&
        !topic.includes('내년') &&
        !topic.includes('작년')
      );

      if (appState.preventDuplicates) {
        const existingTopics = new Set(appState.topics);
        const newTopics = filteredTopics.filter(topic => !existingTopics.has(topic));

        if (newTopics.length < filteredTopics.length) {
          toast({
            title: "중복 주제 감지",
            description: "기존 주제와 유사한 주제를 제외하고 새로운 주제만 추가했습니다.",
          });
        }
        saveAppState({ topics: [...appState.topics, ...newTopics] });
        return newTopics;
      } else {
        saveAppState({ topics: [...appState.topics, ...filteredTopics] });
        return filteredTopics;
      }

    } catch (error) {
      console.error('주제 생성 오류:', error);
      toast({
        title: "주제 생성 실패",
        description: `주제 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  return { isGeneratingTopics, generateTopics };
};
