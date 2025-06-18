
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { getEnhancedTopicPrompt } from '@/lib/enhancedPrompts';

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

// 주제 유효성 검사 함수
const isValidTopic = (topic: string): boolean => {
  const cleanTopic = topic.trim();
  
  // 기본 길이 체크
  if (cleanTopic.length < 5 || cleanTopic.length > 200) {
    return false;
  }
  
  // 비정상적인 시작 패턴 체크
  const invalidStartPatterns = [
    /^[0-9]+\s*[월일년]/,  // "1월", "15일", "2024년" 등으로 시작
    /^[월화수목금토일]\s/,  // 요일로 시작
    /^[가-힣]{1}\s+/,      // 한 글자 + 공백으로 시작 (예: "월 가을철")
    /^\d+\./,               // 숫자+점으로 시작 (예: "1.", "2.")
    /^[-•*]\s/,             // 불릿 포인트로 시작
  ];
  
  // 비정상적인 내용 패턴 체크
  const invalidContentPatterns = [
    /^\s*$/, // 빈 문자열 또는 공백만
    /^[^가-힣a-zA-Z]/, // 한글이나 영문이 아닌 문자로 시작
    /\s{3,}/, // 연속된 공백 3개 이상
  ];
  
  // 시작 패턴 검사
  for (const pattern of invalidStartPatterns) {
    if (pattern.test(cleanTopic)) {
      console.log('비정상적인 시작 패턴 감지:', cleanTopic, pattern);
      return false;
    }
  }
  
  // 내용 패턴 검사
  for (const pattern of invalidContentPatterns) {
    if (pattern.test(cleanTopic)) {
      console.log('비정상적인 내용 패턴 감지:', cleanTopic, pattern);
      return false;
    }
  }
  
  return true;
};

// 주제 정리 함수
const cleanTopic = (rawTopic: string): string => {
  return rawTopic
    .replace(/^[0-9-."'•*\s]+/, '') // 앞쪽 번호, 기호, 공백 제거
    .replace(/["\n\r]+/g, '') // 따옴표, 줄바꿈 제거
    .trim();
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
      
      // 향상된 프롬프트로 주제 생성 품질 개선
      const enhancedPrompt = `"${cleanedKeyword}"를 핵심 키워드로 하여 블로그 주제 ${count}개를 생성해주세요.

**중요한 형식 규칙:**
1. 각 주제는 새로운 줄에 하나씩만 작성
2. 번호, 불릿 포인트, 기호 등을 절대 사용하지 마세요
3. 주제는 완전한 문장 형태로 작성 (예: "가을철 건강관리 필수 팁 5가지")
4. 5자 이상 50자 이하로 작성
5. "${cleanedKeyword}" 키워드가 자연스럽게 포함되도록 작성

**주제 특성:**
- 실용적이고 검색 가치가 있는 내용
- 독자들이 클릭하고 싶은 흥미로운 제목
- SEO에 최적화된 키워드 포함
- 계절이나 시기에 맞는 내용

**예시 형식:**
가을철 ${cleanedKeyword} 관리법 완벽 가이드
${cleanedKeyword} 초보자를 위한 시작 가이드
전문가가 추천하는 ${cleanedKeyword} 베스트 방법

각 주제를 한 줄씩 작성해주세요:`;

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
            temperature: 0.3, // 더 낮은 온도로 일관성 있는 결과
            maxOutputTokens: 2048,
            topP: 0.9,
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
      
      // 개선된 텍스트 파싱
      const lines = generatedText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      console.log('파싱된 라인들:', lines);
      
      // 주제 정리 및 검증
      const rawTopics = lines
        .map(topic => cleanTopic(topic))
        .filter(topic => topic.length > 0);
      
      console.log('정리된 주제들:', rawTopics);
      
      // 유효성 검사 적용
      const validTopics = rawTopics
        .filter(topic => isValidTopic(topic))
        .slice(0, count); // 요청한 개수만큼만 선택

      console.log('유효한 주제들:', validTopics);

      if (validTopics.length === 0) {
        console.error('유효한 주제가 없음. 원본 텍스트:', generatedText);
        throw new Error('생성된 텍스트에서 유효한 주제를 추출할 수 없습니다. 다시 시도해주세요.');
      }

      let finalTopics = validTopics;

      // Get preventDuplicates from appState
      const preventDuplicates = appState.preventDuplicates || false;

      // 중복 금지 설정이 활성화된 경우에만 유사도 검사
      if (preventDuplicates && appState.topics.length > 0) {
        finalTopics = validTopics.filter(newTopic => {
          return !appState.topics.some(existingTopic => {
            const similarity = calculateSimilarity(newTopic, existingTopic);
            return similarity >= 70;
          });
        });

        const removedCount = validTopics.length - finalTopics.length;
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
          finalTopics = validTopics.slice(0, Math.min(3, validTopics.length));
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
        description: `${finalTopics.length}개의 고품질 주제가 성공적으로 생성되었습니다.` 
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
