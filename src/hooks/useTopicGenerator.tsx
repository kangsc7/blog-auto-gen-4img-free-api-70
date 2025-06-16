import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { getEnhancedTopicPrompt } from '@/lib/enhancedPrompts';

export const useTopicGenerator = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void
) => {
  const { toast } = useToast();
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [lastGenerationTime, setLastGenerationTime] = useState(0);

  const generateTopics = async (keywordOverride?: string): Promise<string[] | null> => {
    // 키워드 정리 및 정규화
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
      let allValidTopics: string[] = [];
      let attempts = 0;
      const maxAttempts = 3;
      
      const preventDuplicatesFromStorage = localStorage.getItem('blog_prevent_duplicates');
      const preventDuplicates = preventDuplicatesFromStorage !== null ? JSON.parse(preventDuplicatesFromStorage) : true;
      
      // 간소화된 키워드 분석
      const extractCoreKeywords = (keyword: string) => {
        const yearMatch = keyword.match(/(\d{4})년?/);
        const words = keyword.split(/\s+/).filter(word => word.length > 1);
        
        return {
          coreWords: words,
          year: yearMatch ? yearMatch[1] + '년' : null,
          originalKeyword: keyword
        };
      };

      const keywordInfo = extractCoreKeywords(cleanedKeyword);
      console.log('키워드 분석:', cleanedKeyword, keywordInfo);

      while (allValidTopics.length < count && attempts < maxAttempts) {
        attempts++;
        console.log(`주제 생성 시도 ${attempts}/${maxAttempts}`);
        
        const remainingCount = count - allValidTopics.length;
        const enhancedPrompt = getEnhancedTopicPrompt(cleanedKeyword, remainingCount * 2);
        
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contents: [{ parts: [{ text: enhancedPrompt }] }],
            generationConfig: {
              temperature: 0.3, // 더 정확한 형식 준수를 위해 온도 낮춤
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

        // 간소화된 검증 로직 - 형식만 체크
        const validTopics = newTopics.filter(topic => {
          // 1. 년도로 올바르게 시작하는지 체크 (4자리숫자+년)
          const startsWithValidYear = /^\d{4}년\s/.test(topic);
          
          // 2. 잘못된 "년 " 형태로 시작하지 않는지 체크
          const startsWithInvalidYear = /^년\s/.test(topic);
          
          // 3. 기본 키워드 포함 체크
          const hasKeywords = keywordInfo.coreWords.some(word => 
            topic.toLowerCase().includes(word.toLowerCase())
          );
          
          const isValid = startsWithValidYear && !startsWithInvalidYear && hasKeywords;
          
          console.log(`주제 검증: "${topic}"`);
          console.log(`- 올바른 년도 시작: ${startsWithValidYear}`);
          console.log(`- 잘못된 년 시작 없음: ${!startsWithInvalidYear}`);
          console.log(`- 키워드 포함: ${hasKeywords}`);
          console.log(`- 최종 결과: ${isValid}`);
          
          return isValid;
        });

        // 중복 처리
        let uniqueValidTopics;
        if (preventDuplicates) {
          uniqueValidTopics = validTopics.filter(topic => 
            !allValidTopics.some(existingTopic => 
              existingTopic.replace(/\s/g, '').toLowerCase() === topic.replace(/\s/g, '').toLowerCase()
            )
          );
        } else {
          uniqueValidTopics = validTopics;
        }

        allValidTopics = [...allValidTopics, ...uniqueValidTopics];
        
        console.log(`시도 ${attempts}: ${validTopics.length}개 유효 주제 생성, 누적: ${allValidTopics.length}개`);
      }

      const finalTopics = allValidTopics.slice(0, count);

      if (finalTopics.length === 0) {
        throw new Error(`키워드 '${cleanedKeyword}'에 맞는 주제가 생성되지 않았습니다. 다시 시도해주세요.`);
      }

      // 상태 업데이트
      if (preventDuplicates) {
        saveAppState({ topics: finalTopics, selectedTopic: '', keyword: cleanedKeyword });
      } else {
        const combinedTopics = [...appState.topics, ...finalTopics];
        saveAppState({ topics: combinedTopics, selectedTopic: '', keyword: cleanedKeyword });
      }
      
      if (finalTopics.length < count) {
        toast({ 
          title: "주제 생성 완료", 
          description: `${finalTopics.length}개의 주제가 생성되었습니다. (요청: ${count}개)`,
          variant: "default"
        });
      } else {
        toast({ 
          title: "AI 기반 주제 생성 완료", 
          description: `${finalTopics.length}개의 주제가 성공적으로 생성되었습니다.` 
        });
      }
      
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
