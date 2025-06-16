
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

  const generateTopics = async (keywordOverride?: string): Promise<string[] | null> => {
    const keyword = (keywordOverride || appState.keyword).trim();
    if (!keyword) {
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

    setIsGeneratingTopics(true);
    
    try {
      const count = appState.topicCount;
      let allValidTopics: string[] = [];
      let attempts = 0;
      const maxAttempts = 3;
      
      // 키워드를 더 유연하게 검증하기 위한 핵심 단어 추출
      const extractKeywords = (keyword: string) => {
        // 년도, 숫자, 고유명사 등 핵심 요소 추출
        const yearMatch = keyword.match(/\d{4}년?/);
        const numberMatch = keyword.match(/\d+만?원?/);
        const mainWords = keyword.split(' ').filter(word => 
          word.length > 1 && 
          !['년', '월', '일', '의', '를', '을', '이', '가', '에', '로', '으로'].includes(word)
        );
        
        return {
          year: yearMatch ? yearMatch[0] : null,
          number: numberMatch ? numberMatch[0] : null,
          mainWords: mainWords
        };
      };

      const keywordComponents = extractKeywords(keyword);
      console.log('키워드 구성요소:', keywordComponents);

      while (allValidTopics.length < count && attempts < maxAttempts) {
        attempts++;
        console.log(`주제 생성 시도 ${attempts}/${maxAttempts}, 현재 유효 주제 수: ${allValidTopics.length}/${count}`);
        
        // 개선된 프롬프트 사용
        const remainingCount = count - allValidTopics.length;
        const prompt = getEnhancedTopicPrompt(keyword, remainingCount * 2); // 여분으로 더 많이 생성
        
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7 + (attempts * 0.1), // 시도할 때마다 창의성 증가
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
          .filter(topic => topic.length > 0);

        // 개선된 키워드 검증 로직
        const validTopics = newTopics.filter(topic => {
          // 년도 검증 (더 유연하게)
          if (keywordComponents.year) {
            const hasYear = topic.includes(keywordComponents.year) || 
                           topic.includes(keywordComponents.year.replace('년', ''));
            if (!hasYear) return false;
          }
          
          // 숫자 검증
          if (keywordComponents.number) {
            const hasNumber = topic.includes(keywordComponents.number) ||
                             topic.includes(keywordComponents.number.replace('만원', '')) ||
                             topic.includes(keywordComponents.number.replace('원', ''));
            if (!hasNumber) return false;
          }
          
          // 주요 단어 검증 (70% 이상 포함되어야 함)
          const includedWords = keywordComponents.mainWords.filter(word => 
            topic.includes(word) || 
            // 유사한 단어도 허용 (예: 에너지바우처, 에너지 바우처)
            topic.replace(/\s/g, '').includes(word.replace(/\s/g, ''))
          );
          
          const inclusionRate = includedWords.length / keywordComponents.mainWords.length;
          return inclusionRate >= 0.7; // 70% 이상의 주요 단어가 포함되어야 함
        });

        // 중복 제거하면서 추가
        const uniqueValidTopics = validTopics.filter(topic => 
          !allValidTopics.some(existingTopic => 
            existingTopic.replace(/\s/g, '') === topic.replace(/\s/g, '')
          )
        );

        allValidTopics = [...allValidTopics, ...uniqueValidTopics];
        
        console.log(`시도 ${attempts}: ${validTopics.length}개 유효 주제 생성, 누적: ${allValidTopics.length}개`);
        
        if (validTopics.length === 0) {
          console.warn(`시도 ${attempts}: 유효한 주제가 생성되지 않음`);
        }
      }

      // 요청된 수만큼 자르기
      const finalTopics = allValidTopics.slice(0, count);

      if (finalTopics.length === 0) {
        throw new Error(`핵심 키워드 '${keyword}'가 포함된 주제가 생성되지 않았습니다. 키워드를 더 단순하게 입력해보세요.`);
      }

      saveAppState({ topics: finalTopics });
      
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
