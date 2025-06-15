
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { colorThemes } from '@/data/constants';
import { getArticlePrompt } from '@/lib/prompts';
import { integratePixabayImages, generateMetaDescription } from '@/lib/pixabay';

export const useArticleGenerator = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void
) => {
  const { toast } = useToast();
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const generateArticle = async (
    topicOverride?: string,
    pixabayConfig?: { key: string; validated: boolean }
  ): Promise<string | null> => {
    const selectedTopic = topicOverride || appState.selectedTopic;
    if (!selectedTopic) {
      toast({ title: "주제 선택 오류", description: "주제를 먼저 선택해주세요.", variant: "destructive" });
      return null;
    }
    if (!appState.isApiKeyValidated) {
      toast({ title: "API 키 검증 필요", description: "먼저 API 키를 입력하고 검증해주세요.", variant: "destructive" });
      return null;
    }

    setIsGeneratingContent(true);
    saveAppState({ generatedContent: '', imagePrompt: '' });
    
    try {
      const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
      const selectedColorTheme = appState.colorTheme || randomTheme.value;
      
      const prompt = getArticlePrompt({
        topic: selectedTopic,
        keyword: appState.keyword || selectedTopic,
        selectedColorTheme: selectedColorTheme,
        referenceLink: appState.referenceLink,
        referenceSentence: appState.referenceSentence,
      });

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${appState.apiKey}`;

      const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 8192,
        },
      };

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
      
      // For debugging, let's log the finish reason.
      if (data.candidates?.[0]?.finishReason) {
        const finishReason = data.candidates[0].finishReason;
        console.log('Gemini finish reason:', finishReason);
        if (finishReason === 'MAX_TOKENS') {
          toast({
            title: "콘텐츠 길이 초과",
            description: "AI가 생성할 수 있는 최대 글자 수를 초과하여 내용이 잘렸을 수 있습니다. 글의 완성도를 위해 요청 글자 수를 조정했습니다.",
            variant: "warning",
          });
        }
      }
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
      }
      
      const htmlContent = data.candidates[0].content.parts[0].text;
      const cleanedHtml = htmlContent.replace(/^```html\s*/, '').replace(/\s*```$/, '').trim().replace(/,?\s*(\.\.\.|…)\s*(?=<\/)/g, '');

      let finalHtml = cleanedHtml;
      let pixabayImagesAdded = false;

      if (pixabayConfig?.key && pixabayConfig?.validated) {
        toast({ title: "Pixabay 이미지 통합 중...", description: "게시물에 관련 이미지를 추가하고 있습니다." });
        
        const { finalHtml: htmlWithImages, imageCount } = await integratePixabayImages(
          cleanedHtml,
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
        const metaDescription = await generateMetaDescription(cleanedHtml, appState.apiKey!);
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
      toast({ title: "AI 기반 블로그 글 생성 완료", description: "콘텐츠가 준비되었습니다." });
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
