
import { useState } from 'react';
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
    // 글 생성 시작할 때 기존 콘텐츠와 이미지 프롬프트만 초기화 (불필요한 초기화 제거)
    saveAppState({ imagePrompt: '' });
    
    try {
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

      // 글 생성 단계 알림
      toast({ 
        title: "2단계: AI 글 작성 중...", 
        description: "수집된 정보를 바탕으로 풍부한 내용의 글을 생성하고 있습니다." 
      });

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

      // 태그까지 안정적으로 생성되도록 토큰 한도 최적화
      const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 8000, // 토큰 한도 조정 (태그 섹션 보장)
          temperature: 0.3, // 온도 더 낮춤으로 일관성 향상
          topK: 15,
          topP: 0.7,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      };

      console.log('🚀 Gemini API 요청 시작 - 토큰 한도:', requestBody.generationConfig.maxOutputTokens);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API 요청에 실패했습니다.');
      }
      
      const data = await response.json();
      
      // 토큰 한도 관련 상태 체크 및 로깅 강화
      if (data.candidates?.[0]?.finishReason) {
        const finishReason = data.candidates[0].finishReason;
        console.log('🎯 Gemini finish reason:', finishReason);
        
        if (finishReason === 'MAX_TOKENS') {
          console.error('❌ 토큰 한도 초과! 글이 잘렸을 가능성 높음');
          toast({
            title: "⚠️ 토큰 한도 초과",
            description: "글이 너무 길어서 태그가 누락되었습니다. 다시 생성해주세요.",
            variant: "destructive",
          });
          return null; // 토큰 한도 초과 시 재생성 요구
        } else if (finishReason === 'STOP') {
          console.log('✅ 정상적으로 글 생성 완료');
        }
      }
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
      }
      
      const rawContent = data.candidates[0].content.parts[0].text;
      console.log('📝 생성된 콘텐츠 길이:', rawContent.length, '글자');
      
      // 태그 섹션이 포함되었는지 체크 (더 정확한 검증)
      const hasTagsSection = rawContent.includes('style="font-size: 14px; line-height: 1.4; color: #666; text-align: left;"');
      const hasGeneratedTagsPlaceholder = rawContent.includes('[GENERATED_TAGS]');
      
      console.log('🏷️ 태그 섹션 포함 여부:', hasTagsSection);
      console.log('🏷️ GENERATED_TAGS 플레이스홀더 여부:', hasGeneratedTagsPlaceholder);
      
      if (!hasTagsSection || hasGeneratedTagsPlaceholder) {
        console.warn('⚠️ 태그 섹션이 누락되거나 플레이스홀더가 치환되지 않았습니다!');
        toast({
          title: "⚠️ 태그 생성 실패",
          description: "태그 섹션이 누락되었습니다. 다시 생성을 시도해주세요.",
          variant: "destructive",
        });
        return null; // 태그 누락 시 재생성 요구
      }
      
      const htmlContent = rawContent.trim().replace(/^```html\s*\n?|```\s*$/g, '').trim();
      let finalHtml = htmlContent;
      let pixabayImagesAdded = false;

      const pixabayConfig = options?.pixabayConfig;
      if (pixabayConfig?.key && pixabayConfig?.validated) {
        toast({ title: "3단계: 이미지 추가 중...", description: "게시물에 관련 이미지를 추가하고 있습니다." });
        
        const { finalHtml: htmlWithImages, imageCount } = await integratePixabayImages(
          htmlContent,
          pixabayConfig.key,
          appState.apiKey!
        );

        finalHtml = htmlWithImages;
        
        if (imageCount > 0) {
            pixabayImagesAdded = true;
            toast({ title: "이미지 추가 완료", description: `${imageCount}개의 이미지가 본문에 추가되었습니다.`});
        } else {
            toast({ title: "이미지 추가 실패", description: `게시글에 이미지를 추가하지 못했습니다. Pixabay API 키를 확인하거나 나중에 다시 시도해주세요.`, variant: "default" });
        }
      }

      try {
        const metaDescription = await generateMetaDescription(htmlContent, appState.apiKey!);
        if (metaDescription) {
          const sanitizedMeta = metaDescription.replace(/-->/g, '-- >');
          const metaComment = `<!-- META DESCRIPTION: ${sanitizedMeta} -->`;
          finalHtml = `${metaComment}\n${finalHtml}`;
        }
      } catch (error) {
        console.error("메타 설명 생성 중 오류:", error);
      }

      const stateToSave: Partial<AppState> = { 
        generatedContent: finalHtml, 
        colorTheme: selectedColorTheme 
      };
      
      if (pixabayImagesAdded) {
        stateToSave.imagePrompt = '✅ Pixabay 이미지가 자동으로 적용되었습니다.';
      }

      saveAppState(stateToSave);
      
      toast({ 
        title: "✅ 태그까지 완전한 글 생성 완료", 
        description: "최신 정보를 바탕으로 태그까지 포함된 완전한 글이 완성되었습니다." 
      });
      return finalHtml;
    } catch (error) {
      console.error('글 생성 오류:', error);
      toast({ title: "글 생성 실패", description: error instanceof Error ? error.message : "블로그 글 생성 중 오류가 발생했습니다.", variant: "destructive" });
      return null;
    } finally {
      setIsGeneratingContent(false);
    }
  };

  return { isGeneratingContent, generateArticle };
};
