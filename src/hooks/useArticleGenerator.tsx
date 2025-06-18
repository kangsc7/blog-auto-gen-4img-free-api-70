
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { colorThemes } from '@/data/constants';
import { getEnhancedArticlePrompt } from '@/lib/enhancedPrompts';
import { integratePixabayImages, generateMetaDescription } from '@/lib/pixabay';

export const useArticleGenerator = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>, options?: { source?: 'oneclick' | 'manual' | 'init' }) => void
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
      isOneClickGeneration?: boolean; // 원클릭 생성 여부 추가
    }
  ): Promise<string | null> => {
    const selectedTopic = options?.topic || appState.selectedTopic;
    const isOneClickGeneration = options?.isOneClickGeneration || false;
    
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
    
    // AbortController 생성
    currentController.current = new AbortController();
    
    console.log('🚀 글 생성 시작:', {
      topic: selectedTopic,
      keyword: coreKeyword,
      isOneClickGeneration
    });
    
    // 원클릭 생성이 아닌 경우에만 기존 콘텐츠와 이미지 프롬프트 초기화
    if (!isOneClickGeneration) {
      saveAppState({ imagePrompt: '' }, { source: 'manual' });
    }
    
    try {
      if (cancelArticleGeneration.current) {
        throw new Error("사용자에 의해 중단되었습니다.");
      }

      // 웹 크롤링 단계 알림
      toast({ 
        title: "1단계: 웹 정보 수집 중...", 
        description: "키워드 관련 최신 정보를 크롤링하고 있습니다." 
      });

      const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
      const selectedColorTheme = appState.colorTheme || randomTheme.value;
      
      // 개선된 프롬프트 사용 (웹 크롤링 포함)
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

      // 글 생성 단계 알림
      toast({ 
        title: "2단계: AI 글 작성 중...", 
        description: "수집된 정보를 바탕으로 풍부한 내용의 글을 생성하고 있습니다." 
      });

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
        signal: currentController.current.signal, // AbortController 신호 추가
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
            description: "AI가 생성할 수 있는 최대 글자 수를 초과하여 내용이 잘렸을 수 있습니다. 웹 크롤링된 풍부한 정보로 인해 더 자세한 글이 생성되었습니다.",
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
      let pixabayImagesAdded = false;

      if (cancelArticleGeneration.current) {
        throw new Error("사용자에 의해 중단되었습니다.");
      }

      // Pixabay API 키와 검증 상태를 appState에서 직접 가져오기
      const pixabayApiKey = appState.pixabayApiKey;
      const isPixabayValidated = appState.isPixabayApiKeyValidated;
      
      console.log('Pixabay 설정 확인:', { 
        hasKey: !!pixabayApiKey, 
        isValidated: isPixabayValidated,
        keyLength: pixabayApiKey?.length 
      });

      if (pixabayApiKey && isPixabayValidated) {
        toast({ title: "3단계: 이미지 추가 중...", description: "게시물에 관련 이미지를 추가하고 있습니다." });
        
        try {
          const { finalHtml: htmlWithImages, imageCount } = await integratePixabayImages(
            htmlContent,
            pixabayApiKey,
            appState.apiKey!
          );

          if (cancelArticleGeneration.current) {
            throw new Error("사용자에 의해 중단되었습니다.");
          }

          finalHtml = htmlWithImages;
          
          if (imageCount > 0) {
            pixabayImagesAdded = true;
            toast({ title: "이미지 추가 완료", description: `${imageCount}개의 이미지가 본문에 추가되었습니다.`});
          } else {
            toast({ title: "이미지 추가 실패", description: `게시글에 이미지를 추가하지 못했습니다. Pixabay API 키를 확인하거나 나중에 다시 시도해주세요.`, variant: "default" });
          }
        } catch (imageError) {
          console.error('Pixabay 이미지 통합 오류:', imageError);
          toast({ title: "이미지 추가 오류", description: "이미지 추가 중 오류가 발생했습니다. 글 작성은 계속 진행됩니다.", variant: "default" });
        }
      } else {
        console.log('Pixabay 설정 누락 - 이미지 추가 건너뛰기');
        toast({ title: "이미지 추가 건너뛰기", description: "Pixabay API 키가 설정되지 않아 이미지 없이 글을 생성합니다.", variant: "default" });
      }

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
      
      if (pixabayImagesAdded) {
        stateToSave.imagePrompt = '✅ Pixabay 이미지가 자동으로 적용되었습니다.';
      }

      // 원클릭 생성인지 수동 생성인지에 따라 다른 저장 방식 사용
      const saveSource = isOneClickGeneration ? 'oneclick' : 'manual';
      saveAppState(stateToSave, { source: saveSource });
      
      console.log('✅ 글 생성 완료:', {
        contentLength: finalHtml.length,
        source: saveSource,
        hasImages: pixabayImagesAdded
      });
      
      toast({ 
        title: "웹 크롤링 기반 블로그 글 생성 완료", 
        description: isOneClickGeneration ? 
          "원클릭 생성이 완료되었습니다. 편집기에서 확인하세요!" :
          "최신 정보를 바탕으로 풍부한 내용의 글이 완성되었습니다." 
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

  // 글 생성 중단 함수 (즉시 중단 기능 강화)
  const stopArticleGeneration = () => {
    console.log('글 생성 중단 요청 - 상태:', { 
      isGenerating: isGeneratingContent, 
      hasController: !!currentController.current 
    });
    
    cancelArticleGeneration.current = true;
    
    // 진행 중인 fetch 요청 중단
    if (currentController.current) {
      currentController.current.abort();
      console.log('AbortController.abort() 호출됨');
    }
    
    // 강제로 상태 초기화
    setIsGeneratingContent(false);
    
    toast({
      title: "글 생성 즉시 중단",
      description: "현재 진행 중인 글 생성을 즉시 중단했습니다.",
      variant: "default"
    });
  };

  return { isGeneratingContent, generateArticle, stopArticleGeneration };
};
