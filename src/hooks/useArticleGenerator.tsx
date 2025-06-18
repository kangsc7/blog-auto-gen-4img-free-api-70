
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getHtmlTemplate } from '@/lib/htmlTemplate';
import { generateDynamicHeadings } from '@/lib/dynamicHeadings';
import { WebCrawlerService } from '@/lib/webCrawler';
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
      
      console.log('글 생성 시작:', { finalTopic, finalKeyword });

      // 웹 크롤링으로 최신 정보 수집 (실패해도 계속 진행)
      let additionalInfo = '';
      try {
        console.log('웹 크롤링 시작...');
        additionalInfo = await WebCrawlerService.crawlForKeyword(finalKeyword, appState.apiKey);
        console.log('웹 크롤링 완료');
      } catch (crawlError) {
        console.error('웹 크롤링 실패, 기본 정보로 진행:', crawlError);
        additionalInfo = `${finalKeyword}에 대한 기본 정보를 바탕으로 글을 작성합니다.`;
      }
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: finalTopic,
          keyword: finalKeyword,
          apiKey: appState.apiKey,
          additionalInfo: additionalInfo,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 요청 실패:', response.status, errorText);
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !data.content) {
        console.error('API 응답 데이터 오류:', data);
        throw new Error('API 응답에 content가 없습니다.');
      }

      let generatedContent = data.content;

      // Pixabay API 키가 유효하면 이미지 검색 및 추가
      if (pixabayConfig?.validated && pixabayConfig?.key) {
        try {
          console.log('Pixabay 이미지 검색 시작...');
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
              console.log('Pixabay 이미지 추가 완료');
            }
          } else {
            console.error('Pixabay API 요청 실패:', pixabayResponse.statusText);
          }
        } catch (pixabayError) {
          console.error('Pixabay 이미지 처리 중 오류:', pixabayError);
          // 이미지 실패해도 글 생성은 계속 진행
        }
      }

      // 동적 소제목 생성 및 HTML 구조에 맞게 변환
      let dynamicHeadings: Array<{ title: string; emoji: string; content: string }> = [];
      try {
        console.log('동적 소제목 생성 시작...');
        dynamicHeadings = await generateDynamicHeadings(
          finalKeyword, 
          finalTopic, 
          appState.huggingFaceApiKey || ''
        );
        console.log('동적 소제목 생성 완료:', dynamicHeadings);
      } catch (headingError) {
        console.error('동적 소제목 생성 실패:', headingError);
        // 기본 소제목으로 대체
        dynamicHeadings = [
          { title: `${finalTopic} 완전 가이드`, emoji: '💡', content: '기본 정보를 완벽 정리합니다' },
          { title: `${finalKeyword} 활용 방법`, emoji: '📝', content: '실제 활용법을 안내합니다' },
          { title: `실제 적용 사례`, emoji: '📈', content: '성공 사례를 공유합니다' },
          { title: `${finalKeyword} 주의사항`, emoji: '⚠️', content: '주의할 점들을 알려드립니다' },
          { title: `자주 묻는 질문`, emoji: '❓', content: '궁금한 점들을 해결합니다' }
        ];
      }

      // 최종 HTML 생성 시 AdSense 설정 포함
      const finalHtml = getHtmlTemplate(
        finalColors, 
        finalTopic, 
        finalKeyword, 
        appState.referenceLink || 'https://worldpis.com',
        appState.referenceSentence || '워드프레스 꿀팁 더 보러가기',
        dynamicHeadings,
        appState.adSenseSettings
      );

      console.log('글 생성 완료');
      saveAppState({ generatedContent: finalHtml });
      return finalHtml;

    } catch (error: any) {
      console.error('글 생성 중 오류 발생:', error);
      toast({
        title: "글 생성 오류",
        description: error.message || "글을 생성하는 동안 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
      return '';
    } finally {
      setIsGeneratingContent(false);
    }
  };

  return { isGeneratingContent, generateArticle };
};
