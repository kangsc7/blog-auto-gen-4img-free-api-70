
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

export const useImagePromptGenerator = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void
) => {
  const { toast } = useToast();
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const generateImagePrompt = async () => {
    if (!appState.selectedTopic) {
      toast({
        title: "주제 선택 오류",
        description: "주제를 먼저 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!appState.isApiKeyValidated) {
      toast({
        title: "API 키 검증 필요",
        description: "먼저 API 키를 입력하고 검증해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPrompt(true);
    saveAppState({ imagePrompt: '' });

    try {
      const prompt = `주제: ${appState.selectedTopic}

위 주제에 최적화된 이미지 생성 프롬프트를 작성해주세요. 다음 지침을 따라주세요:

1. 영어로 작성 (AI 이미지 생성툴 호환성)
2. 한국인 독자들이 선호할만한 시각적 요소 포함
3. 블로그 글에 어울리는 전문적이고 깔끔한 스타일
4. 구체적이고 명확한 묘사
5. 50-80단어 내외

응답은 오직 이미지 프롬프트만 작성해주세요.`;

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

      const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.8,
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
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
      }

      const generatedPrompt = data.candidates[0].content.parts[0].text.trim();
      saveAppState({ imagePrompt: generatedPrompt });
      
      toast({
        title: "이미지 프롬프트 생성 완료",
        description: "이미지 생성 프롬프트가 생성되었습니다."
      });

    } catch (error) {
      console.error('이미지 프롬프트 생성 오류:', error);
      toast({
        title: "프롬프트 생성 실패",
        description: error instanceof Error ? error.message : "이미지 프롬프트 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const generateImage = async () => {
    if (!appState.imagePrompt) {
      toast({
        title: "프롬프트 누락",
        description: "먼저 이미지 프롬프트를 생성해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!appState.isHuggingfaceApiKeyValidated) {
      toast({
        title: "HuggingFace API 키 필요",
        description: "이미지 생성을 위해 HuggingFace API 키를 입력하고 검증해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "이미지 생성 중...",
        description: "AI가 이미지를 생성하고 있습니다. 잠시만 기다려주세요."
      });

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: appState.imagePrompt,
          apiKey: appState.huggingfaceApiKey
        }),
      });

      if (!response.ok) {
        throw new Error('이미지 생성에 실패했습니다.');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      // 이미지 다운로드 링크 생성
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "이미지 생성 완료",
        description: "이미지가 생성되어 다운로드되었습니다."
      });

    } catch (error) {
      console.error('이미지 생성 오류:', error);
      toast({
        title: "이미지 생성 실패",
        description: error instanceof Error ? error.message : "이미지 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  return {
    isGeneratingPrompt,
    generateImagePrompt,
    generateImage
  };
};
