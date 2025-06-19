
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

export const useTopicGenerator = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void
) => {
  const { toast } = useToast();
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);

  // 주제 유효성 검사 함수
  const isValidTopic = (topic: string): boolean => {
    const cleanedTopic = topic.trim();
    
    // 너무 짧은 주제 제외
    if (cleanedTopic.length < 10) return false;
    
    // 비정상적인 시작 패턴 제외
    const invalidStartPatterns = [
      /^월\s/, // "월 " 로 시작
      /^일\s/, // "일 " 로 시작  
      /^년\s/, // "년 " 로 시작
      /^\d+\.\s/, // "1. " 같은 번호로 시작
      /^-\s/, // "- " 로 시작
      /^\*\s/, // "* " 로 시작
      /^제\d+/, // "제1", "제2" 로 시작
    ];
    
    return !invalidStartPatterns.some(pattern => pattern.test(cleanedTopic));
  };

  // 주제 정리 함수
  const cleanTopic = (topic: string): string => {
    return topic
      .replace(/^[0-9]+[.\-)\s]*/, '') // 앞의 번호 제거
      .replace(/^[-*•]\s*/, '') // 앞의 기호 제거
      .replace(/^제\d+[호번]?\s*:?\s*/, '') // "제1호", "제2번" 등 제거
      .replace(/^주제\s*\d*\s*:?\s*/, '') // "주제 1:", "주제:" 등 제거
      .replace(/^월\s+/, '') // 앞의 "월 " 제거
      .trim();
  };

  const generateTopics = async (keywordOverride?: string): Promise<string[] | null> => {
    const keyword = keywordOverride || appState.keyword;
    if (!keyword) {
      toast({ title: "키워드 입력 오류", description: "먼저 키워드를 입력해주세요.", variant: "destructive" });
      return null;
    }
    if (!appState.isApiKeyValidated) {
      toast({ title: "API 키 검증 필요", description: "먼저 API 키를 입력하고 검증해주세요.", variant: "destructive" });
      return null;
    }

    setIsGeneratingTopics(true);
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear(); // 2025
      const currentMonth = currentDate.getMonth() + 1;

      const prompt = `"${keyword}"를 키워드로 하여 ${currentYear}년 ${currentMonth}월 현재 기준으로 블로그 포스팅에 적합한 주제 10개를 생성해주세요.

생성 규칙:
1. 각 주제는 완전한 문장 형태로 15-25자 내외
2. "${keyword}" 키워드가 자연스럽게 포함되어야 함
3. ${currentYear}년 최신 트렌드와 정보를 반영
4. 실용적이고 검색 가치가 높은 내용
5. 독자의 관심을 끌 수 있는 매력적인 제목

형식:
각 주제는 번호나 기호 없이 제목만 작성하고, 한 줄에 하나씩 작성해주세요.

예시 형태:
"${keyword} 완벽 가이드: ${currentYear}년 최신 정보 총정리"
"${keyword} 활용법: 초보자도 쉽게 따라하는 단계별 방법"

주의사항:
- 정치적, 종교적, 논란의 여지가 있는 주제 제외
- 과도한 상업적 표현 자제
- 각 주제가 서로 다른 관점에서 접근하도록 구성`;

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 1.0,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API 요청에 실패했습니다.');
      }
      
      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
      }
      
      const rawTopics = data.candidates[0].content.parts[0].text;
      
      // 주제 파싱 및 정리
      const topics = rawTopics
        .split('\n')
        .map(line => cleanTopic(line))
        .filter(topic => topic.length > 0 && isValidTopic(topic))
        .slice(0, 10);

      console.log('정리된 주제들:', topics);

      if (topics.length === 0) {
        throw new Error('유효한 주제를 생성하지 못했습니다.');
      }

      // 키워드 저장 (덮어쓰기 방지)
      const stateUpdate: Partial<AppState> = { topics };
      if (keywordOverride) {
        stateUpdate.keyword = keywordOverride;
      }
      
      saveAppState(stateUpdate);
      toast({ title: "주제 생성 완료", description: `${topics.length}개의 주제가 생성되었습니다.` });
      return topics;
    } catch (error) {
      console.error('주제 생성 오류:', error);
      toast({ title: "주제 생성 실패", description: error instanceof Error ? error.message : "주제 생성 중 오류가 발생했습니다.", variant: "destructive" });
      return null;
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  return { isGeneratingTopics, generateTopics };
};
