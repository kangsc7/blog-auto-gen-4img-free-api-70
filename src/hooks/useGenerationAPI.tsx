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

  const generateArticle = async (topicOverride?: string): Promise<string | null> => {
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

      saveAppState({ generatedContent: cleanedHtml, colorTheme: selectedColorTheme });
      toast({ title: "AI 기반 블로그 글 생성 완료", description: "콘텐츠가 준비되었습니다." });
      return cleanedHtml;
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
