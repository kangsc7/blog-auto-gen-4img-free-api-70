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
      
      // 핵심 키워드를 더 정확하게 추출하여 검증
      const extractCoreKeywords = (keyword: string) => {
        // 키워드를 단어 단위로 분할하고 중요 단어만 추출
        const stopWords = ['년', '월', '일', '의', '를', '을', '이', '가', '에', '로', '으로', '와', '과', '는', '은', '만', '원'];
        const words = keyword.split(/\s+/).filter(word => 
          word.length > 1 && !stopWords.includes(word)
        );
        
        // 숫자와 년도는 별도 처리
        const yearMatch = keyword.match(/\d{4}년?/);
        const numberMatch = keyword.match(/\d+만?원?/);
        
        return {
          coreWords: words,
          year: yearMatch ? yearMatch[0] : null,
          number: numberMatch ? numberMatch[0] : null,
          originalKeyword: keyword
        };
      };

      const keywordInfo = extractCoreKeywords(keyword);
      console.log('핵심 키워드 분석:', keywordInfo);

      while (allValidTopics.length < count && attempts < maxAttempts) {
        attempts++;
        console.log(`주제 생성 시도 ${attempts}/${maxAttempts}, 현재 유효 주제 수: ${allValidTopics.length}/${count}`);
        
        const remainingCount = count - allValidTopics.length;
        
        // 더 명확한 프롬프트로 키워드 포함 강조
        const enhancedPrompt = `'${keyword}'를(을) 주제로, 2025년 최신 정보를 반영하여 구글과 네이버 검색에 최적화된 블로그 포스팅 제목 ${remainingCount * 2}개를 생성해 주세요.

**절대 지켜야 할 핵심 규칙**:
1. 모든 제목은 반드시 '${keyword}' 키워드의 핵심 구성 요소를 모두 포함해야 합니다.
2. 다른 주제는 절대 포함하지 마세요.
3. 오직 '${keyword}'와 관련된 내용만 생성해주세요.

**핵심 키워드 필수 포함 요소**:
${keywordInfo.coreWords.map(word => `- "${word}"`).join('\n')}
${keywordInfo.year ? `- "${keywordInfo.year}"` : ''}
${keywordInfo.number ? `- "${keywordInfo.number}"` : ''}

각 제목은 위의 핵심 요소들을 자연스럽게 포함하면서 2025년 최신 정보를 반영해야 합니다.
결과는 제목만 줄바꿈으로 구분하여 제공해주세요.`;
        
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contents: [{ parts: [{ text: enhancedPrompt }] }],
            generationConfig: {
              temperature: 0.8,
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
          .filter(topic => topic.length > 5);

        // 개선된 키워드 검증 로직 - 입력된 키워드와 관련된 내용은 허용
        const validTopics = newTopics.filter(topic => {
          // 1. 핵심 단어 포함률 체크 (60% 이상으로 완화)
          const includedCoreWords = keywordInfo.coreWords.filter(word => 
            topic.toLowerCase().includes(word.toLowerCase())
          );
          const coreWordRatio = keywordInfo.coreWords.length > 0 ? 
            includedCoreWords.length / keywordInfo.coreWords.length : 1;
          
          // 2. 년도가 있다면 반드시 포함되어야 함
          const yearCheck = !keywordInfo.year || 
            topic.includes(keywordInfo.year) || 
            topic.includes(keywordInfo.year.replace('년', ''));
          
          // 3. 숫자가 있다면 반드시 포함되어야 함
          const numberCheck = !keywordInfo.number || 
            topic.includes(keywordInfo.number) ||
            topic.includes(keywordInfo.number.replace(/만원?/, ''));
          
          // 4. 입력된 키워드와 관련없는 완전히 다른 주제만 제외
          // 입력된 키워드에 "에너지바우처"가 포함되어 있다면 에너지바우처 관련 주제는 허용
          const isRelatedToInputKeyword = keywordInfo.coreWords.some(word => 
            ['에너지', '바우처', '에너지바우처'].includes(word.toLowerCase())
          );
          
          let excludeOtherTopics = true;
          if (!isRelatedToInputKeyword) {
            // 입력 키워드가 에너지바우처와 관련없을 때만 제외
            excludeOtherTopics = !topic.includes('에너지바우처') && 
              !topic.includes('70만원') &&
              !topic.includes('청년도약계좌') &&
              !topic.includes('국민취업지원제도');
          }
          
          console.log(`주제 검증: "${topic}" - 핵심단어비율: ${coreWordRatio.toFixed(2)}, 년도: ${yearCheck}, 숫자: ${numberCheck}, 다른주제제외: ${excludeOtherTopics}`);
          
          return coreWordRatio >= 0.6 && yearCheck && numberCheck && excludeOtherTopics;
        });

        // preventDuplicates 설정에 따라 중복 제거 여부 결정
        let uniqueValidTopics;
        if (window.preventDuplicates !== undefined ? window.preventDuplicates : true) {
          // 중복 금지 모드: 현재 세션 내에서만 중복 제거 (기존 저장된 주제와는 비교하지 않음)
          uniqueValidTopics = validTopics.filter(topic => 
            !allValidTopics.some(existingTopic => 
              existingTopic.replace(/\s/g, '').toLowerCase() === topic.replace(/\s/g, '').toLowerCase()
            )
          );
          console.log(`중복 금지 모드: ${validTopics.length}개 -> ${uniqueValidTopics.length}개 (현재 세션 내 중복 제거됨)`);
        } else {
          // 중복 허용 모드: 중복 제거하지 않음 (기존 저장된 주제와도 비교하지 않음)
          uniqueValidTopics = validTopics;
          console.log(`중복 허용 모드: ${validTopics.length}개 주제 모두 허용`);
        }

        allValidTopics = [...allValidTopics, ...uniqueValidTopics];
        
        console.log(`시도 ${attempts}: ${validTopics.length}개 유효 주제 생성, 누적: ${allValidTopics.length}개`);
        
        if (validTopics.length === 0) {
          console.warn(`시도 ${attempts}: 키워드 '${keyword}'에 맞는 유효한 주제가 생성되지 않음`);
        }
      }

      // 요청된 수만큼 자르기
      const finalTopics = allValidTopics.slice(0, count);

      if (finalTopics.length === 0) {
        throw new Error(`핵심 키워드 '${keyword}'가 포함된 주제가 생성되지 않았습니다. 키워드를 더 구체적으로 입력해보세요.`);
      }

      // 중복 허용 모드일 때는 기존 주제에 추가, 중복 금지 모드일 때는 완전 교체
      if (window.preventDuplicates !== undefined ? window.preventDuplicates : true) {
        // 중복 금지 모드: 기존 주제들을 완전히 대체
        saveAppState({ topics: finalTopics, selectedTopic: '' });
      } else {
        // 중복 허용 모드: 기존 주제에 새 주제들을 추가
        const combinedTopics = [...appState.topics, ...finalTopics];
        saveAppState({ topics: combinedTopics, selectedTopic: '' });
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
