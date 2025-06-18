
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

// 간단한 유사도 검사 함수 (70% 기준)
const calculateSimilarity = (str1: string, str2: string): number => {
  const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase();
  const s1 = normalize(str1);
  const s2 = normalize(str2);
  
  if (s1 === s2) return 100;
  
  const maxLength = Math.max(s1.length, s2.length);
  let matches = 0;
  
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) matches++;
  }
  
  return (matches / maxLength) * 100;
};

const getEnhancedTopicPrompt = (keyword: string, count: number): string => {
  return `
당신은 15년차 전문 블로그 카피라이터이자 SEO 마스터입니다.

주어진 키워드: "${keyword}"
생성할 주제 수: ${count}개

다음 조건을 모두 만족하는 블로그 주제를 생성해주세요:

1. **SEO 최적화**: 검색 엔진에서 상위 노출될 수 있는 키워드 조합
2. **실용성**: 독자에게 실질적인 도움이 되는 내용
3. **시의성**: 2025년 현재 시점에서 관심도가 높은 주제
4. **구체성**: 막연한 제목이 아닌 구체적이고 명확한 주제
5. **다양성**: 서로 다른 관점과 접근법을 가진 주제들

각 주제는 다음 형식으로 작성:
- 40자 이내의 간결하고 임팩트 있는 제목
- 검색 의도를 정확히 반영한 키워드 포함
- 클릭을 유도하는 매력적인 표현

출력 형식: 번호 없이 각 주제를 한 줄씩 작성해주세요.

예시:
${keyword} 초보자를 위한 완벽 가이드 2025
${keyword} 전문가가 알려주는 숨겨진 팁 5가지
${keyword} 비용 절약하는 스마트한 방법
`;
};

export const useTopicGenerator = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void
) => {
  const { toast } = useToast();
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [lastGenerationTime, setLastGenerationTime] = useState(0);

  const generateTopics = async (keywordOverride?: string): Promise<string[] | null> => {
    const rawKeyword = (keywordOverride || appState.keyword).trim();
    const cleanedKeyword = rawKeyword.replace(/\s+/g, ' ').trim();
    
    if (!cleanedKeyword) {
      toast({
        title: "키워드 오류",
        description: "핵심 키워드를 입력해주세요.",
        variant: "destructive"
      });
      return null;
    }

    if (!appState.isApiKeyValidated) {
      toast({
        title: "API 키 검증 필요",
        description: "먼저 API 키를 입력하고 검증해주세요.",
        variant: "destructive"
      });
      return null;
    }

    // 3초 딜레이 체크 (완화)
    const currentTime = Date.now();
    const timeSinceLastGeneration = currentTime - lastGenerationTime;
    if (timeSinceLastGeneration < 2000 && lastGenerationTime > 0) {
      const remainingTime = Math.ceil((2000 - timeSinceLastGeneration) / 1000);
      toast({
        title: "잠시만 기다려주세요",
        description: `${remainingTime}초 후에 다시 시도할 수 있습니다.`,
        variant: "default"
      });
      return null;
    }

    setIsGeneratingTopics(true);
    setLastGenerationTime(currentTime);
    
    try {
      const count = appState.topicCount;
      const enhancedPrompt = getEnhancedTopicPrompt(cleanedKeyword, count);
      
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

      // API 요청 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: enhancedPrompt }] }],
          generationConfig: {
            temperature: 0.2, // 온도 조정으로 안정성 향상
            maxOutputTokens: 2048,
            topP: 0.8,
            topK: 40,
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error?.message || `HTTP ${response.status}: API 요청 실패`;
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // API 응답 검증 강화
      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Gemini API 응답 오류:', data);
        throw new Error('API로부터 유효한 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.');
      }
      
      const generatedText = data.candidates[0].content.parts[0].text;
      console.log('Gemini API 원본 응답:', generatedText);
      
      // 텍스트 파싱 개선
      const lines = generatedText.split('\n').filter(line => line.trim().length > 0);
      const newTopics = lines
        .map(topic => topic.replace(/^[0-9-."']+\s*/, '').trim())
        .filter(topic => topic.length > 5 && topic.length < 200)
        .slice(0, count); // 요청한 개수만큼만 선택

      if (newTopics.length === 0) {
        console.error('파싱된 주제가 없음. 원본 텍스트:', generatedText);
        throw new Error('생성된 텍스트에서 유효한 주제를 추출할 수 없습니다. 다시 시도해주세요.');
      }

      let finalTopics = newTopics;

      // Get preventDuplicates from appState
      const preventDuplicates = appState.preventDuplicates || false;

      // 중복 금지 설정이 활성화된 경우에만 유사도 검사
      if (preventDuplicates && appState.topics.length > 0) {
        finalTopics = newTopics.filter(newTopic => {
          return !appState.topics.some(existingTopic => {
            const similarity = calculateSimilarity(newTopic, existingTopic);
            return similarity >= 70;
          });
        });

        const removedCount = newTopics.length - finalTopics.length;
        if (removedCount > 0) {
          console.log(`중복 제거: ${removedCount}개 주제 제거됨`);
          toast({
            title: "중복 주제 제거",
            description: `70% 이상 유사한 ${removedCount}개 주제가 제거되었습니다.`,
            variant: "default"
          });
        }
      }

      // 주제가 전혀 없는 경우 처리
      if (finalTopics.length === 0) {
        if (preventDuplicates) {
          // 중복 방지 모드에서 모든 주제가 중복인 경우, 일부 주제를 허용
          finalTopics = newTopics.slice(0, Math.min(3, newTopics.length));
          toast({
            title: "중복 주제 일부 허용",
            description: `모든 주제가 중복되어 ${finalTopics.length}개 주제를 허용했습니다.`,
            variant: "default"
          });
        } else {
          throw new Error('생성된 주제가 없습니다. 다른 키워드로 시도해주세요.');
        }
      }

      // 상태 업데이트 - 중복 허용/금지에 관계없이 추가
      const combinedTopics = [...appState.topics, ...finalTopics];
      saveAppState({ topics: combinedTopics, selectedTopic: '', keyword: cleanedKeyword });
      
      toast({ 
        title: "AI 기반 주제 생성 완료", 
        description: `${finalTopics.length}개의 주제가 성공적으로 생성되었습니다.` 
      });
      
      return finalTopics;
    } catch (error) {
      console.error('주제 생성 상세 오류:', error);
      let errorMessage = "주제 생성 중 오류가 발생했습니다.";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "요청 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.";
        } else if (error.message.includes('API key')) {
          errorMessage = "API 키에 문제가 있습니다. API 키를 다시 확인해주세요.";
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = "API 사용 한도에 도달했습니다. 잠시 후 다시 시도해주세요.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({ 
        title: "주제 생성 실패", 
        description: errorMessage, 
        variant: "destructive" 
      });
      return null;
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  return { isGeneratingTopics, generateTopics };
};
