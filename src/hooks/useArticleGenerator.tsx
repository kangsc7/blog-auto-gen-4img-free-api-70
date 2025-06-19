
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { colorThemes } from '@/data/constants';
import { getEnhancedArticlePrompt } from '@/lib/enhancedPrompts';
import { integratePixabayImages, generateMetaDescription } from '@/lib/pixabay';

export const useArticleGenerator = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void
) => {
  const { toast } = useToast();
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const cancelArticleGeneration = useRef(false);
  const currentController = useRef<AbortController | null>(null);

  const generateArticle = async (
    options?: {
      topic?: string;
      keyword?: string;
      pixabayConfig?: { key: string; validated: boolean };
    }
  ): Promise<string | null> => {
    const selectedTopic = options?.topic || appState.selectedTopic;
    if (!selectedTopic) {
      toast({ title: "주제 선택 오류", description: "주제를 먼저 선택해주세요.", variant: "destructive" });
      return null;
    }
    if (!appState.isApiKeyValidated) {
      toast({ title: "API 키 검증 필요", description: "먼저 API 키를 입력하고 검증해주세요.", variant: "destructive" });
      return null;
    }

    const coreKeyword = (options?.keyword || appState.keyword).trim();
    if (!coreKeyword) {
      toast({
        title: "핵심 키워드 누락",
        description: "글을 생성하려면 먼저 '주제 생성' 단계에서 핵심 키워드를 입력해야 합니다.",
        variant: "destructive",
      });
      return null;
    }

    setIsGeneratingContent(true);
    cancelArticleGeneration.current = false;
    
    currentController.current = new AbortController();
    
    saveAppState({ imagePrompt: '' });
    
    try {
      if (cancelArticleGeneration.current) {
        throw new Error("사용자에 의해 중단되었습니다.");
      }

      toast({ 
        title: "AI 글 작성 중...", 
        description: "최적화된 알고리즘으로 빠르게 글을 생성하고 있습니다." 
      });

      const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
      const selectedColorTheme = appState.colorTheme || randomTheme.value;
      
      // 성능 최적화: 웹 크롤링 없이 빠른 프롬프트 생성
      const prompt = await getEnhancedArticlePrompt({
        topic: selectedTopic,
        keyword: coreKeyword,
        selectedColorTheme: selectedColorTheme,
        referenceLink: appState.referenceLink,
        referenceSentence: appState.referenceSentence,
        apiKey: appState.apiKey!,
      });

      if (cancelArticleGeneration.current) {
        throw new Error("사용자에 의해 중단되었습니다.");
      }

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

      const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
        },
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: currentController.current.signal,
      });

      if (cancelArticleGeneration.current) {
        throw new Error("사용자에 의해 중단되었습니다.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API 요청에 실패했습니다.');
      }
      
      const data = await response.json();
      
      if (data.candidates?.[0]?.finishReason) {
        const finishReason = data.candidates[0].finishReason;
        console.log('Gemini finish reason:', finishReason);
        if (finishReason === 'MAX_TOKENS') {
          toast({
            title: "콘텐츠 길이 초과",
            description: "AI가 생성할 수 있는 최대 글자 수를 초과하여 내용이 잘렸을 수 있습니다.",
            variant: "default",
          });
        }
      }
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
      }
      
      const rawContent = data.candidates[0].content.parts[0].text;
      const htmlContent = rawContent.trim().replace(/^```html\s*\n?|```\s*$/g, '').trim();
      let finalHtml = htmlContent;

      if (cancelArticleGeneration.current) {
        throw new Error("사용자에 의해 중단되었습니다.");
      }

      // 픽사베이 이미지 추가 기능 임시 비활성화
      console.log('픽사베이 이미지 추가 기능이 임시로 비활성화되었습니다.');
      
      // 메타 설명 생성
      try {
        const metaDescription = await generateMetaDescription(htmlContent, appState.apiKey!);
        if (metaDescription && !cancelArticleGeneration.current) {
          const sanitizedMeta = metaDescription.replace(/-->/g, '-- >');
          const metaComment = `<!-- META DESCRIPTION: ${sanitizedMeta} -->`;
          finalHtml = `${metaComment}\n${finalHtml}`;
        }
      } catch (error) {
        console.error("메타 설명 생성 중 오류:", error);
      }

      if (cancelArticleGeneration.current) {
        throw new Error("사용자에 의해 중단되었습니다.");
      }

      const stateToSave: Partial<AppState> = { 
        generatedContent: finalHtml, 
        colorTheme: selectedColorTheme 
      };

      saveAppState(stateToSave);
      
      // 최종 완료 메시지
      toast({ 
        title: "🎉 블로그 글 생성 완료!", 
        description: "텍스트 콘텐츠가 성공적으로 생성되었습니다. (이미지 추가 기능은 임시 비활성화됨)",
        duration: 4000
      });
      
      return finalHtml;
    } catch (error) {
      console.error('글 생성 오류:', error);
      
      let errorMessage = "블로그 글 생성 중 오류가 발생했습니다.";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "사용자에 의해 중단되었습니다.";
        } else {
          errorMessage = error.message;
        }
      }
      
      if (errorMessage === "사용자에 의해 중단되었습니다.") {
        toast({ 
          title: "글 생성 중단됨", 
          description: "사용자 요청에 따라 글 생성을 중단했습니다.", 
          variant: "default" 
        });
      } else {
        toast({ 
          title: "글 생성 실패", 
          description: errorMessage, 
          variant: "destructive" 
        });
      }
      return null;
    } finally {
      setIsGeneratingContent(false);
      cancelArticleGeneration.current = false;
      currentController.current = null;
    }
  };

  const stopArticleGeneration = () => {
    console.log('글 생성 중단 요청 - 상태:', { 
      isGenerating: isGeneratingContent, 
      hasController: !!currentController.current 
    });
    
    cancelArticleGeneration.current = true;
    
    if (currentController.current) {
      currentController.current.abort();
      console.log('AbortController.abort() 호출됨');
    }
    
    setIsGeneratingContent(false);
    
    toast({
      title: "글 생성 즉시 중단",
      description: "현재 진행 중인 글 생성을 즉시 중단했습니다.",
      variant: "default"
    });
  };

  return { isGeneratingContent, generateArticle, stopArticleGeneration };
};
