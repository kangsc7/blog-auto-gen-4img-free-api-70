
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

// 에러 타입 정의
type ArticleGenerationError = 
  | 'NO_TOPIC'
  | 'API_KEY_INVALID'
  | 'WEB_CRAWL_FAILED'
  | 'CONTENT_GENERATION_FAILED'
  | 'IMAGE_FETCH_FAILED'
  | 'HEADING_GENERATION_FAILED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR';

interface DetailedError {
  type: ArticleGenerationError;
  message: string;
  details?: string;
}

export const useArticleGenerator = (appState: AppState, saveAppState: (newState: Partial<AppState>) => void) => {
  const { toast } = useToast();
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const createDetailedError = (type: ArticleGenerationError, message: string, details?: string): DetailedError => {
    return { type, message, details };
  };

  const getErrorMessage = (error: DetailedError): string => {
    switch (error.type) {
      case 'NO_TOPIC':
        return '❌ 주제 선택 오류: 글을 생성하기 전에 주제를 선택해주세요.';
      case 'API_KEY_INVALID':
        return '🔑 API 키 오류: API 키가 유효하지 않습니다. 다시 확인해주세요.';
      case 'WEB_CRAWL_FAILED':
        return '🌐 웹 크롤링 실패: 최신 정보 수집에 실패했지만 기본 정보로 계속 진행합니다.';
      case 'CONTENT_GENERATION_FAILED':
        return '📝 콘텐츠 생성 실패: AI 글 생성에 실패했습니다. 잠시 후 다시 시도해주세요.';
      case 'IMAGE_FETCH_FAILED':
        return '🖼️ 이미지 추가 실패: 이미지 가져오기에 실패했지만 글 생성은 계속됩니다.';
      case 'HEADING_GENERATION_FAILED':
        return '📋 소제목 생성 실패: 동적 소제목 생성에 실패하여 기본 소제목을 사용합니다.';
      case 'NETWORK_ERROR':
        return '🌐 네트워크 오류: 인터넷 연결을 확인하고 다시 시도해주세요.';
      case 'TIMEOUT_ERROR':
        return '⏰ 시간 초과: 요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
      default:
        return '❓ 알 수 없는 오류: 예상치 못한 오류가 발생했습니다.';
    }
  };

  const generateArticle = async (options?: { topic?: string; keyword?: string; pixabayConfig?: PixabayConfig }): Promise<string> => {
    const { topic: overrideTopic, keyword: overrideKeyword, pixabayConfig } = options || {};

    if (!appState.selectedTopic && !overrideTopic) {
      const error = createDetailedError('NO_TOPIC', '주제가 선택되지 않았습니다');
      toast({
        title: "글 생성 실패",
        description: getErrorMessage(error),
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

      // 1단계: 웹 크롤링으로 최신 정보 수집
      let additionalInfo = '';
      try {
        console.log('웹 크롤링 시작...');
        additionalInfo = await WebCrawlerService.crawlForKeyword(finalKeyword, appState.apiKey);
        console.log('웹 크롤링 완료');
      } catch (crawlError: any) {
        console.error('웹 크롤링 실패:', crawlError);
        const error = createDetailedError('WEB_CRAWL_FAILED', '웹 크롤링 실패', crawlError.message);
        toast({
          title: "웹 크롤링 경고",
          description: getErrorMessage(error),
          variant: "default"
        });
        additionalInfo = `${finalKeyword}에 대한 기본 정보를 바탕으로 글을 작성합니다.`;
      }
      
      // 2단계: AI 콘텐츠 생성
      let generatedContent = '';
      try {
        console.log('AI 콘텐츠 생성 시작...');
        
        // 타임아웃 설정
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60초 타임아웃

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            topic: finalTopic,
            keyword: finalKeyword,
            apiKey: appState.apiKey,
            additionalInfo: additionalInfo,
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API 요청 실패:', response.status, errorText);
          
          if (response.status === 401 || response.status === 403) {
            throw createDetailedError('API_KEY_INVALID', 'API 키가 유효하지 않습니다', errorText);
          } else if (response.status >= 500) {
            throw createDetailedError('CONTENT_GENERATION_FAILED', '서버 오류가 발생했습니다', errorText);
          } else {
            throw createDetailedError('CONTENT_GENERATION_FAILED', `API 요청 실패: ${response.status}`, errorText);
          }
        }

        const data = await response.json();

        if (!data || !data.content) {
          console.error('API 응답 데이터 오류:', data);
          throw createDetailedError('CONTENT_GENERATION_FAILED', 'API 응답에 콘텐츠가 없습니다', JSON.stringify(data));
        }

        generatedContent = data.content;
        console.log('AI 콘텐츠 생성 완료');

      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw createDetailedError('TIMEOUT_ERROR', '콘텐츠 생성 시간 초과', '60초');
        } else if (fetchError.type) {
          // 이미 DetailedError인 경우
          throw fetchError;
        } else {
          throw createDetailedError('NETWORK_ERROR', '네트워크 오류', fetchError.message);
        }
      }

      // 3단계: Pixabay 이미지 검색 및 추가 (선택적)
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
        } catch (pixabayError: any) {
          console.error('Pixabay 이미지 처리 중 오류:', pixabayError);
          const error = createDetailedError('IMAGE_FETCH_FAILED', 'Pixabay 이미지 가져오기 실패', pixabayError.message);
          toast({
            title: "이미지 추가 경고",
            description: getErrorMessage(error),
            variant: "default"
          });
          // 이미지 실패해도 글 생성은 계속 진행
        }
      }

      // 4단계: 동적 소제목 생성
      let dynamicHeadings: Array<{ title: string; emoji: string; content: string }> = [];
      try {
        console.log('동적 소제목 생성 시작...');
        dynamicHeadings = await generateDynamicHeadings(
          finalKeyword, 
          finalTopic, 
          appState.huggingFaceApiKey || ''
        );
        console.log('동적 소제목 생성 완료:', dynamicHeadings);
      } catch (headingError: any) {
        console.error('동적 소제목 생성 실패:', headingError);
        const error = createDetailedError('HEADING_GENERATION_FAILED', '동적 소제목 생성 실패', headingError.message);
        toast({
          title: "소제목 생성 경고",
          description: getErrorMessage(error),
          variant: "default"
        });
        
        // 기본 소제목으로 대체
        dynamicHeadings = [
          { title: `${finalTopic} 완전 가이드`, emoji: '💡', content: '기본 정보를 완벽 정리합니다' },
          { title: `${finalKeyword} 활용 방법`, emoji: '📝', content: '실제 활용법을 안내합니다' },
          { title: `실제 적용 사례`, emoji: '📈', content: '성공 사례를 공유합니다' },
          { title: `${finalKeyword} 주의사항`, emoji: '⚠️', content: '주의할 점들을 알려드립니다' },
          { title: `자주 묻는 질문`, emoji: '❓', content: '궁금한 점들을 해결합니다' }
        ];
      }

      // 5단계: 최종 HTML 생성
      try {
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
        
        toast({
          title: "✅ 글 생성 성공!",
          description: `"${finalTopic}" 주제로 글이 성공적으로 생성되었습니다.`,
          variant: "default"
        });
        
        return finalHtml;
      } catch (templateError: any) {
        console.error('HTML 템플릿 생성 오류:', templateError);
        throw createDetailedError('CONTENT_GENERATION_FAILED', 'HTML 템플릿 생성 실패', templateError.message);
      }

    } catch (error: any) {
      console.error('글 생성 중 오류 발생:', error);
      
      let errorMessage = '';
      if (error.type && error.message) {
        // DetailedError인 경우
        errorMessage = getErrorMessage(error as DetailedError);
        if (error.details) {
          console.error('오류 상세:', error.details);
        }
      } else {
        // 일반 오류인 경우
        const detailedError = createDetailedError('UNKNOWN_ERROR', '예상치 못한 오류', error.message);
        errorMessage = getErrorMessage(detailedError);
      }
      
      toast({
        title: "글 생성 오류",
        description: errorMessage,
        variant: "destructive"
      });
      return '';
    } finally {
      setIsGeneratingContent(false);
    }
  };

  return { isGeneratingContent, generateArticle };
};
