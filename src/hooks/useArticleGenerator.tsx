import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { colorThemes } from '@/data/constants';
import { getEnhancedArticlePrompt } from '@/lib/enhancedPrompts';
import { integratePixabayImages, generateMetaDescription } from '@/lib/pixabay';

// 후처리용 템플릿 변수 치환 함수
const postProcessContent = (content: string, keyword: string): string => {
  console.log('🔧 후처리 시작 - 템플릿 변수 치환');
  
  // 미치환된 대괄호 패턴 감지
  const bracketMatches = content.match(/\[[^\]]+\]/g);
  if (bracketMatches) {
    console.warn('⚠️ 미치환된 템플릿 변수 발견:', bracketMatches);
  }
  
  // 일반적인 fallback 매핑
  const fallbackReplacements: Record<string, string> = {
    '[챗봇 이름]': '파코월드',
    '[설정 단계 1]': '첫 번째 단계',
    '[설정 단계 2]': '두 번째 단계',
    '[설정 단계 3]': '세 번째 단계',
    '[퍼센트]': '80',
    '[기간]': '1개월',
    '[금액]': '적정 금액',
    '[주요 내용 요약]': `${keyword}의 핵심 포인트를 확인하세요`,
    '[실제 활용 방법]': `${keyword}을 단계별로 진행하세요`,
    '[주의할 점]': `${keyword} 사용 시 주의사항을 꼼꼼히 확인하세요`,
    '[예상되는 효과]': `${keyword}을 통해 긍정적인 결과를 기대할 수 있습니다`,
    '[추천 대상]': `${keyword}에 관심 있는 모든 분들께 추천합니다`,
    '[항목1]': '주요 항목',
    '[내용1]': '상세 내용'
  };
  
  let processedContent = content;
  let replacementCount = 0;
  
  // 정확한 매칭부터 치환
  Object.entries(fallbackReplacements).forEach(([placeholder, replacement]) => {
    const beforeCount = processedContent.split(placeholder).length - 1;
    processedContent = processedContent.replace(new RegExp(placeholder.replace(/[[\]]/g, '\\$&'), 'g'), replacement);
    const afterCount = processedContent.split(replacement).length - 1;
    if (beforeCount > 0) {
      replacementCount += beforeCount;
      console.log(`✅ 치환 완료: ${placeholder} → ${replacement} (${beforeCount}개)`);
    }
  });
  
  // 여전히 남은 대괄호 패턴을 일반적인 텍스트로 치환
  const remainingBrackets = processedContent.match(/\[[^\]]+\]/g);
  if (remainingBrackets) {
    console.warn('🔄 남은 대괄호 패턴을 기본값으로 치환:', remainingBrackets);
    processedContent = processedContent.replace(/\[[^\]]+\]/g, '관련 정보');
    replacementCount += remainingBrackets.length;
  }
  
  console.log(`🎯 후처리 완료 - 총 ${replacementCount}개 치환됨`);
  return processedContent;
};

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
        title: "🚀 1단계: 블로그 글 생성 중", 
        description: "컬러테마, 시각카드, 외부링크 연동하여 고품질 글 작성 중입니다." 
      });

      // 매번 랜덤으로 컬러테마 선택
      const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
      const selectedColorTheme = randomTheme.value;
      
      console.log('🎨 랜덤 선택된 컬러테마:', selectedColorTheme);
      console.log('🔗 외부 참조 링크:', appState.referenceLink);
      console.log('📝 외부 참조 문장:', appState.referenceSentence);

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
      
      // 🔧 후처리: 템플릿 변수 치환
      const processedContent = postProcessContent(htmlContent, coreKeyword);
      
      let finalHtml = processedContent;
      let pixabayImagesAdded = false;
      let imageCount = 0;

      console.log('✅ 기본 블로그 글 생성 완료 (후처리 포함)');

      if (cancelArticleGeneration.current) {
        throw new Error("사용자에 의해 중단되었습니다.");
      }

      // 픽사베이 이미지 추가 기능 - 강화된 버전
      const pixabayApiKey = appState.pixabayApiKey;
      const isPixabayValidated = appState.isPixabayApiKeyValidated;
      
      console.log('🖼️ Pixabay 설정 확인:', { 
        hasKey: !!pixabayApiKey, 
        isValidated: isPixabayValidated,
        keyLength: pixabayApiKey?.length 
      });

      if (pixabayApiKey && isPixabayValidated) {
        toast({ 
          title: "🖼️ 2단계: 이미지 추가 중", 
          description: "소제목별로 페이지별 순차 검색하여 최적의 이미지를 삽입 중입니다." 
        });
        
        try {
          const { finalHtml: htmlWithImages, imageCount: addedImages, clipboardImages } = await integratePixabayImages(
            finalHtml,
            pixabayApiKey,
            appState.apiKey!
          );

          if (cancelArticleGeneration.current) {
            throw new Error("사용자에 의해 중단되었습니다.");
          }

          finalHtml = htmlWithImages;
          imageCount = addedImages;
          
          if (imageCount > 0) {
            pixabayImagesAdded = true;
            toast({ 
              title: "✅ 이미지 추가 완료", 
              description: `${imageCount}개의 이미지가 소제목별로 페이지별 순차 검색으로 삽입되었습니다. 클릭 시 티스토리 복사 가능!`,
              duration: 4000
            });
          } else {
            toast({ 
              title: "⚠️ 이미지 추가 실패", 
              description: `적합한 이미지를 찾지 못했습니다. 텍스트 콘텐츠는 정상 생성되었습니다.`, 
              variant: "default" 
            });
          }
        } catch (imageError) {
          console.error('❌ Pixabay 이미지 통합 오류:', imageError);
          toast({ 
            title: "⚠️ 이미지 추가 오류", 
            description: "이미지 추가 중 오류가 발생했습니다. 글 작성은 계속 진행됩니다.", 
            variant: "default" 
          });
        }
      } else {
        console.log('⚠️ Pixabay 설정 누락 - 이미지 추가 건너뛰기');
      }

      // 메타 설명 생성
      try {
        const metaDescription = await generateMetaDescription(finalHtml, appState.apiKey!);
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

      console.log('🔄 편집기 동기화 - 상태 저장 시작:', finalHtml.length + '자');
      saveAppState(stateToSave);
      
      // 편집기와 완전 동기화 - 통합된 저장 키 사용
      const UNIFIED_EDITOR_KEY = 'blog_editor_content_permanent_v3';
      try {
        localStorage.setItem(UNIFIED_EDITOR_KEY, finalHtml);
        console.log('✅ 편집기 완전 동기화 저장 완료:', finalHtml.length + '자');
        
        // 편집기에 새 콘텐츠 알림 이벤트 발송
        window.dispatchEvent(new CustomEvent('editor-content-updated', { 
          detail: { content: finalHtml } 
        }));
        console.log('📢 편집기 콘텐츠 업데이트 이벤트 발송됨');
      } catch (error) {
        console.error('❌ 편집기 동기화 저장 실패:', error);
      }
      
      // 최종 완료 메시지
      toast({ 
        title: "🎉 블로그 글 생성 완료!", 
        description: `랜덤 컬러테마(${selectedColorTheme}), 시각카드, 외부링크가 모두 적용된 완성된 글입니다. ${pixabayImagesAdded ? `(${imageCount}개 이미지 포함)` : '(텍스트만)'}`,
        duration: 5000
      });
      
      return finalHtml;
    } catch (error) {
      console.error('❌ 글 생성 오류:', error);
      
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
