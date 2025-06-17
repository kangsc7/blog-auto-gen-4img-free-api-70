
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

export const useTopicGenerator = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void,
  preventDuplicates: boolean,
  canUseFeatures: boolean
) => {
  const { toast } = useToast();
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [lastGenerationTime, setLastGenerationTime] = useState(0);

  const generateTopics = async (keywordOverride?: string): Promise<string[] | null> => {
    if (!canUseFeatures) {
      toast({
        title: "접근 제한",
        description: "이 기능을 사용할 권한이 없습니다.",
        variant: "destructive"
      });
      return null;
    }

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

    // 3초 딜레이 체크
    const currentTime = Date.now();
    const timeSinceLastGeneration = currentTime - lastGenerationTime;
    if (timeSinceLastGeneration < 3000 && lastGenerationTime > 0) {
      const remainingTime = Math.ceil((3000 - timeSinceLastGeneration) / 1000);
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

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: enhancedPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API 요청에 실패했습니다.');
      }
      
      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
      }
      
      const generatedText = data.candidates[0].content.parts[0].text;
      const newTopics = generatedText.split('\n')
        .map(topic => topic.replace(/^[0-9-."']+\s*/, '').trim())
        .filter(topic => topic.length > 10);

      let finalTopics = newTopics;

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
          toast({
            title: "중복 주제 제거",
            description: `70% 이상 유사한 ${removedCount}개 주제가 제거되었습니다.`,
            variant: "default"
          });
        }
      }

      if (finalTopics.length === 0) {
        throw new Error(`생성된 모든 주제가 기존 주제와 70% 이상 유사합니다. 다른 키워드로 시도해주세요.`);
      }

      // 상태 업데이트 - 중복 허용/금지에 관계없이 추가
      if (preventDuplicates) {
        // 중복 금지: 기존 주제에 새로운 주제 추가
        const combinedTopics = [...appState.topics, ...finalTopics];
        saveAppState({ topics: combinedTopics, selectedTopic: '', keyword: cleanedKeyword });
      } else {
        // 중복 허용: 모든 제한 없이 추가
        const combinedTopics = [...appState.topics, ...finalTopics];
        saveAppState({ topics: combinedTopics, selectedTopic: '', keyword: cleanedKeyword });
      }
      
      toast({ 
        title: "AI 기반 주제 생성 완료", 
        description: `${finalTopics.length}개의 주제가 성공적으로 생성되었습니다.` 
      });
      
      return finalTopics;
    } catch (error) {
      console.error('주제 생성 오류:', error);
      toast({ 
        title: "주제 생성 실패", 
        description: error instanceof Error ? error.message : "주제 생성 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
      return null;
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  return { isGeneratingTopics, generateTopics };
};
