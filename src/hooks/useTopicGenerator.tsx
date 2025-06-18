
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import stringSimilarity from 'string-similarity';

export const useTopicGenerator = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void
) => {
  const { toast } = useToast();
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);

  const filterAndDeduplicateTopics = (topics: string[], existingTopics: string[] = [], preventDuplicates = true): string[] => {
    // 1. 정제: 특수문자, 연도 및 시기 표현 제거
    const cleanedTopics = topics.map(topic => {
      return topic.trim()
        .replace(/\(\d+\)/g, '') // (2023) 형태 제거
        .replace(/\[.*?\]/g, '') // [2023] 형태 제거
        .replace(/\d{4}년/g, '') // 2023년 형태 제거
        .replace(/\d{4}-\d{4}/g, '') // 2023-2024 형태 제거
        .replace(/\d{4}-\d{2}/g, '') // 2023-24 형태 제거
        .replace(/\d{4}~\d{4}/g, '') // 2023~2024 형태 제거
        .replace(/\d{4}~\d{2}/g, '') // 2023~24 형태 제거
        .replace(/\d{4}\s*년\s*(상반기|하반기)/g, '') // 2023년 상반기/하반기 제거
        .replace(/(상반기|하반기|분기)/g, '') // 상반기/하반기/분기 표현 제거
        .replace(/상하반기/g, '') // '상하반기' 표현 제거
        .replace(/최신 현황/g, '') // '최신 현황' 제거
        .replace(/20\d{2}/g, '') // 2019, 2020, 2021 등 연도 제거
        .replace(/\d+(월|주)/g, '') // 1월, 2월, 1주, 2주 등 제거
        .replace(/웹사이트/g, '') // 웹사이트 제거
        .replace(/홈페이지/g, '') // 홈페이지 제거
        .replace(/\s+/g, ' ') // 다중 공백을 단일 공백으로
        .trim();
    });

    // 2. 필터링: 빈 문자열이나 너무 짧은 주제 제거
    const filteredTopics = cleanedTopics.filter(topic => topic.length > 5);

    // 3. 중복 제거 (중복 방지 설정이 켜져 있는 경우에만)
    let result: string[] = [];
    
    if (preventDuplicates) {
      // 중복 방지: 유사도 70% 이상은 중복으로 처리
      const allTopics = [...existingTopics, ...filteredTopics];
      
      filteredTopics.forEach(topic => {
        // 이미 존재하는 주제와 유사한지 확인
        const isAlreadyExists = existingTopics.some(existingTopic => {
          const similarity = stringSimilarity.compareTwoStrings(
            existingTopic.toLowerCase(), 
            topic.toLowerCase()
          );
          return similarity > 0.7;
        });
        
        // 현재 처리 중인 결과에 이미 추가된 주제와 유사한지 확인
        const isDuplicateInCurrentResult = result.some(addedTopic => {
          const similarity = stringSimilarity.compareTwoStrings(
            addedTopic.toLowerCase(), 
            topic.toLowerCase()
          );
          return similarity > 0.7;
        });
        
        if (!isAlreadyExists && !isDuplicateInCurrentResult) {
          result.push(topic);
        }
      });
    } else {
      // 중복 방지 없이 모든 주제 추가
      result = filteredTopics;
    }
    
    return result;
  };

  const generateTopics = async (keywordOverride?: string): Promise<string[] | null> => {
    const keyword = keywordOverride || appState.keyword;
    
    if (!keyword || !keyword.trim()) {
      toast({
        title: "키워드 누락",
        description: "주제를 생성하기 위해서는 키워드가 필요합니다.",
        variant: "destructive"
      });
      return null;
    }
    
    if (!appState.isApiKeyValidated) {
      toast({
        title: "API 키 검증 필요",
        description: "API 키를 입력하고 검증한 후 다시 시도해주세요.",
        variant: "destructive"
      });
      return null;
    }
    
    setIsGeneratingTopics(true);
    
    try {
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;
      
      const topicCount = appState.topicCount || 5;
      const prompt = `
당신은 주어진 키워드를 바탕으로 다양하고 독창적인 블로그 주제를 생성하는 AI 전문가입니다. 
키워드: "${keyword}"

다음 조건을 정확히 준수하세요:
1. 정확히 ${topicCount}개의 블로그 주제를 생성하세요.
2. 각 주제는 최소 6글자, 최대 40글자로 제한하세요.
3. 주제는 "제목:" 없이 순수 주제 텍스트만 작성하세요.
4. 주제 앞에는 번호만 매겨주세요 (예: "1. 주제내용").
5. 주제와 키워드의 관련성을 높게 유지하세요.
6. 주제는 한국어로 작성하세요.
7. 질문형 주제를 포함하여 다양한 형식의 주제를 제시하세요.

**절대적 금지사항**:
1. 연도 표기(2023년, 2024년 등)를 포함하지 마세요!
2. 계절이나 "상반기/하반기" 같은 시기 표현을 포함하지 마세요!
3. "웹사이트"나 "홈페이지"라는 단어를 사용하지 마세요!
4. "월", "주" 등의 시간 표현을 사용하지 마세요!
5. 설명이나 해설을 추가하지 마세요.
6. 제목을 생성하지 말고 순수 주제만 작성하세요.

예시 형식:
1. 주제 내용
2. 주제 내용
...

위의 지침에 따라 ${topicCount}개의 블로그 주제를 생성해주세요.
`;
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.0,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
          },
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 오류: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
      }
      
      const rawTopics = data.candidates[0].content.parts[0].text
        .split('\n')
        .filter((line: string) => /^\d+\./.test(line.trim()))
        .map((line: string) => line.replace(/^\d+\.\s*/, '').trim());
      
      // 기존 주제와 새 주제의 중복 제거
      const existingTopics = appState.topics || [];
      const preventDuplicates = appState.preventDuplicates !== undefined ? appState.preventDuplicates : true;
      const filteredTopics = filterAndDeduplicateTopics(rawTopics, existingTopics, preventDuplicates);
      
      if (filteredTopics.length === 0) {
        toast({
          title: "주제 생성 결과 없음",
          description: "필터링 후 남은 주제가 없습니다. 다른 키워드로 다시 시도해주세요.",
          variant: "destructive"
        });
        return null;
      }
      
      // 기존 주제와 새 주제 합치기
      const combinedTopics = [...existingTopics, ...filteredTopics];
      
      // 상태 업데이트
      saveAppState({ topics: combinedTopics });
      
      toast({
        title: "주제 생성 완료",
        description: `${filteredTopics.length}개의 새로운 주제가 생성되었습니다.`
      });
      
      return filteredTopics;
    } catch (error) {
      console.error("주제 생성 오류:", error);
      toast({
        title: "주제 생성 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  return { isGeneratingTopics, generateTopics };
};
