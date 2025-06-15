import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { colorThemes } from '@/data/constants';
import { getArticlePrompt } from '@/lib/prompts';

export const useGenerationAPI = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void
) => {
  const { toast } = useToast();
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

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
      const prompt = `'${keyword}'를(을) 주제로, 구글과 네이버 검색에 최적화된 블로그 포스팅 제목 ${count}개를 생성해 주세요. 각 제목에는 반드시 핵심 키워드인 '${keyword}'가 포함되어야 합니다. 각 제목은 사람들이 클릭하고 싶게 만드는 흥미로운 내용이어야 합니다. 결과는 각 제목을 줄바꿈으로 구분하여 번호 없이 텍스트만 제공해주세요. 다른 설명 없이 주제 목록만 생성해주세요.`;
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
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
    saveAppState({ generatedContent: '' });
    
    try {
      const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
      const selectedColorTheme = appState.colorTheme || randomTheme.value;
      
      const prompt = getArticlePrompt({
        topic: selectedTopic,
        keyword: appState.keyword || selectedTopic.split(' ')[0],
        selectedColorTheme: selectedColorTheme,
        referenceLink: appState.referenceLink,
      });

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API 요청에 실패했습니다.');
      }
      
      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
      }
      
      const htmlContent = data.candidates[0].content.parts[0].text;
      const cleanedHtml = htmlContent.replace(/^```html\s*/, '').replace(/\s*```$/, '').trim().replace(/(\.\.\.|…)\s*$/, "");

      let finalHtml = cleanedHtml;

      if (pixabayConfig?.key && pixabayConfig?.validated) {
        toast({ title: "Pixabay 이미지 통합 중...", description: "게시물에 관련 이미지를 추가하고 있습니다." });
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(cleanedHtml, 'text/html');
        const h2s = Array.from(doc.querySelectorAll('h2'));
        let imageCount = 0;
        const MAX_IMAGES = 4;

        if (h2s.length > 0) {
          const numImagesToInsert = Math.min(MAX_IMAGES, h2s.length);
          const step = h2s.length / numImagesToInsert;
          const indicesToInsertAt = Array.from({ length: numImagesToInsert }, (_, i) => Math.floor(i * step));

          for (const index of indicesToInsertAt) {
            const h2 = h2s[index];
            if (!h2) continue;

            let contentForSummary = '';
            let currentNode = h2.nextSibling;
            while(currentNode && currentNode.nodeName !== 'H2') {
                contentForSummary += currentNode.textContent || '';
                currentNode = currentNode.nextSibling;
            }
            
            const textToSummarize = (h2.textContent + " " + contentForSummary).replace(/\s+/g, ' ').trim().substring(0, 1000);

            if (textToSummarize.length > 10) {
                 try {
                    const summaryPrompt = `다음 텍스트를 Pixabay 이미지 검색에 적합한 2-3개의 한국어 키워드로 요약해 주세요. 쉼표로 구분된 키워드만 제공하고 다른 설명은 하지 마세요. 텍스트: "${textToSummarize}"`;
                    const summaryResponse = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: summaryPrompt }] }] })
                    });
                    if (!summaryResponse.ok) continue;
                    const summaryData = await summaryResponse.json();
                    const keyword = summaryData.candidates?.[0]?.content?.parts?.[0]?.text.trim();

                    if (!keyword) continue;

                    const imageSearchUrl = `https://pixabay.com/api/?key=${pixabayConfig.key}&q=${encodeURIComponent(keyword)}&image_type=photo&safesearch=true&per_page=10&lang=ko`;
                    const imageResponse = await fetch(imageSearchUrl);
                    if (!imageResponse.ok) continue;
                    const imageData = await imageResponse.json();

                    if (imageData.hits && imageData.hits.length > 0) {
                        const randomImage = imageData.hits[Math.floor(Math.random() * imageData.hits.length)];
                        const imageUrl = randomImage.webformatURL;
                        
                        const imageContainer = doc.createElement('div');
                        imageContainer.style.textAlign = 'center';
                        imageContainer.style.margin = '2em 0';
                        
                        const img = doc.createElement('img');
                        img.src = imageUrl;
                        img.alt = keyword;
                        img.style.maxWidth = '90%';
                        img.style.height = 'auto';
                        img.style.borderRadius = '8px';
                        
                        const caption = doc.createElement('p');
                        caption.style.fontSize = '0.8em';
                        caption.style.color = '#666';
                        caption.textContent = `Image by ${randomImage.user} on Pixabay`;
                        
                        imageContainer.appendChild(img);
                        imageContainer.appendChild(caption);
                        
                        h2.parentNode?.insertBefore(imageContainer, h2.nextSibling);
                        imageCount++;
                    }
                } catch (e) {
                     console.error("Error integrating single image:", e);
                }
            }
          }
        }
        
        finalHtml = doc.body.innerHTML;
        if(imageCount > 0) {
            toast({ title: "이미지 추가 완료", description: `${imageCount}개의 이미지가 본문에 추가되었습니다.`});
        } else {
            toast({ title: "이미지 추가 실패", description: `게시글에 이미지를 추가하지 못했습니다. Pixabay API 키를 확인하거나 나중에 다시 시도해주세요.`, variant: "default" });
        }
      }

      saveAppState({ generatedContent: finalHtml, colorTheme: selectedColorTheme });
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

  const createImagePrompt = async (): Promise<boolean> => {
    if (!appState.selectedTopic || !appState.imageStyle) {
      toast({ title: "선택 오류", description: "주제와 이미지 스타일을 먼저 선택해주세요.", variant: "destructive" });
      return false;
    }
    if (!appState.isApiKeyValidated) {
      toast({ title: "API 키 검증 필요", description: "먼저 API 키를 입력하고 검증해주세요.", variant: "destructive" });
      return false;
    }

    setIsGeneratingImage(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const styleMap: { [key: string]: string } = {
        'realistic': 'photorealistic style with natural lighting and high detail',
        'artistic': 'artistic painting style with creative composition',
        'minimal': 'clean minimal design with simple elements',
        'cinematic': 'cinematic style with dramatic lighting and depth',
        'animation': 'animated style with vibrant colors and dynamic elements',
        'cartoon': 'cartoon illustration style with playful characters'
      };
      const styleDescription = styleMap[appState.imageStyle] || styleMap['realistic'];
      const prompt = `A professional blog content creation scene showing a person writing on a laptop, surrounded by creative elements like floating text, colorful graphics, and digital tools, warm natural lighting, modern workspace environment, ${styleDescription}, 4k photorealistic style with high detail, realistic, and natural lighting`;
      
      saveAppState({ imagePrompt: prompt });
      toast({ title: "이미지 프롬프트 생성 완료", description: "ImageFX에서 사용할 수 있는 프롬프트가 생성되었습니다." });
      return true;
    } catch (error) {
      console.error('이미지 프롬프트 생성 오류:', error);
      toast({ title: "프롬프트 생성 실패", description: "이미지 프롬프트 생성 중 오류가 발생했습니다.", variant: "destructive" });
      return false;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return {
    isGeneratingTopics,
    isGeneratingContent,
    isGeneratingImage,
    generateTopics,
    generateArticle,
    createImagePrompt,
  };
};
