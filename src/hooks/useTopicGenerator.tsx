
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
      
      // 개선된 프롬프트 사용
      const prompt = getEnhancedTopicPrompt(keyword, count);
      
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }],
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
      const newTopics = generatedText.split('\n').map(topic => topic.replace(/^[0-9-."']+\s*/, '').trim()).filter(topic => topic.length > 0);

      // 키워드 누락 검증
      const keywordMissingTopics = newTopics.filter(topic => {
        const keywordParts = keyword.split(' ');
        return !keywordParts.every(part => topic.includes(part));
      });

      if (keywordMissingTopics.length > 0) {
        console.warn('키워드 누락된 주제들:', keywordMissingTopics);
        toast({
          title: "키워드 누락 감지",
          description: `일부 주제에서 핵심 키워드가 누락되었습니다. 다시 생성을 시도합니다.`,
          variant: "default"
        });
        
        // 키워드가 포함된 주제만 필터링
        const validTopics = newTopics.filter(topic => {
          const keywordParts = keyword.split(' ');
          return keywordParts.every(part => topic.includes(part));
        });
        
        if (validTopics.length === 0) {
          throw new Error(`핵심 키워드 '${keyword}'가 포함된 주제가 생성되지 않았습니다. 다시 시도해주세요.`);
        }
        
        saveAppState({ topics: validTopics });
        toast({ 
          title: "AI 기반 주제 생성 완료", 
          description: `${validTopics.length}개의 키워드가 포함된 주제가 생성되었습니다.` 
        });
        return validTopics;
      }

      saveAppState({ topics: newTopics });
      toast({ title: "AI 기반 주제 생성 완료", description: `${newTopics.length}개의 새로운 주제가 생성되었습니다.` });
      return newTopics;
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
