import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getHtmlTemplate } from '@/lib/htmlTemplate';
import { generateDynamicHeadings } from '@/lib/dynamicHeadings';
import { AppState } from '@/types';

interface PixabayConfig {
  key: string;
  validated: boolean;
}

export const useArticleGenerator = (appState: AppState, saveAppState: (newState: Partial<AppState>) => void) => {
  const { toast } = useToast();
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const generateArticle = async (options?: { topic?: string; keyword?: string; pixabayConfig?: PixabayConfig }): Promise<string> => {
    const { topic: overrideTopic, keyword: overrideKeyword, pixabayConfig } = options || {};

    if (!appState.selectedTopic && !overrideTopic) {
      toast({
        title: "주제 선택 필요",
        description: "글을 생성하기 전에 주제를 선택해주세요.",
        variant: "destructive"
      });
      return '';
    }

    const finalTopic = overrideTopic || appState.selectedTopic;
    const finalKeyword = overrideKeyword || appState.keyword;
    const finalColors = appState.colorTheme || 'default';

    try {
      setIsGeneratingContent(true);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: finalTopic,
          keyword: finalKeyword,
          apiKey: appState.apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !data.content) {
        throw new Error('API 응답에 content가 없습니다.');
      }

      let generatedContent = data.content;

      // Pixabay API 키가 유효하면 이미지 검색 및 추가
      if (pixabayConfig?.validated && pixabayConfig?.key) {
        const pixabayResponse = await fetch('/api/get-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: finalTopic,
            apiKey: pixabayConfig.key,
          }),
        });

        if (pixabayResponse.ok) {
          const pixabayData = await pixabayResponse.json();
          if (pixabayData.imageUrl) {
            generatedContent += `<img src="${pixabayData.imageUrl}" alt="${finalTopic}" style="margin: 20px 0; max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />`;
          }
        } else {
          console.error('Pixabay API 요청 실패:', pixabayResponse.statusText);
        }
      }

      // 동적 소제목 생성 및 HTML 구조에 맞게 변환 - Fix: Correct parameter order
      const dynamicHeadings = await generateDynamicHeadings(
        finalKeyword, 
        finalTopic, 
        appState.huggingFaceApiKey || ''
      );

      // 최종 HTML 생성 시 AdSense 설정 포함
      const finalHtml = getHtmlTemplate(
        finalColors, 
        finalTopic, 
        finalKeyword, 
        appState.referenceLink || 'https://worldpis.com',
        appState.referenceSentence || '워드프레스 꿀팁 더 보러가기',
        dynamicHeadings,
        appState.adSenseSettings // AdSense 설정 추가
      );

      saveAppState({ generatedContent: finalHtml });
      return finalHtml;

    } catch (error: any) {
      console.error('글 생성 중 오류 발생:', error);
      toast({
        title: "글 생성 오류",
        description: error.message || "글을 생성하는 동안 오류가 발생했습니다.",
        variant: "destructive"
      });
      return '';
    } finally {
      setIsGeneratingContent(false);
    }
  };

  return { isGeneratingContent, generateArticle };
};
