
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

export const useImagePromptGenerator = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void
) => {
  const { toast } = useToast();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDirectlyGenerating, setIsDirectlyGenerating] = useState(false);

  const createImagePrompt = async (inputText: string): Promise<boolean> => {
    if (!inputText.trim()) {
      toast({
        title: "입력 오류",
        description: "프롬프트로 변환할 텍스트를 입력해주세요.",
        variant: "destructive"
      });
      return false;
    }

    if (!appState.isApiKeyValidated) {
      toast({
        title: "API 키 검증 필요",
        description: "먼저 Gemini API 키를 입력하고 검증해주세요.",
        variant: "destructive"
      });
      return false;
    }

    setIsGeneratingImage(true);

    try {
      const prompt = `다음 한글 텍스트를 영어 이미지 생성 프롬프트로 변환해주세요. 구체적이고 시각적인 묘사를 포함하여 AI 이미지 생성에 최적화된 영어 프롬프트를 만들어주세요. 다른 설명 없이 영어 프롬프트만 출력하세요:

"${inputText}"`;

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
        })
      });

      if (!response.ok) {
        throw new Error('이미지 프롬프트 생성 API 요청 실패');
      }

      const data = await response.json();
      const imagePrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!imagePrompt) {
        throw new Error('유효한 이미지 프롬프트를 생성하지 못했습니다.');
      }

      saveAppState({ imagePrompt });
      toast({
        title: "이미지 프롬프트 생성 완료",
        description: "영어 이미지 프롬프트가 성공적으로 생성되었습니다."
      });
      return true;

    } catch (error) {
      console.error('이미지 프롬프트 생성 오류:', error);
      toast({
        title: "프롬프트 생성 실패",
        description: error instanceof Error ? error.message : "이미지 프롬프트 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const generateDirectImage = async (): Promise<string | null> => {
    if (!appState.imagePrompt.trim()) {
      toast({
        title: "프롬프트 없음",
        description: "먼저 이미지 프롬프트를 생성해주세요.",
        variant: "destructive"
      });
      return null;
    }

    if (!appState.isHuggingFaceApiKeyValidated) {
      toast({
        title: "HuggingFace API 키 필요",
        description: "이미지 생성을 위해 HuggingFace API 키가 필요합니다.",
        variant: "destructive"
      });
      return null;
    }

    setIsDirectlyGenerating(true);

    try {
      // Supabase Edge Function 호출
      const response = await fetch('/api/generate-image-hf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: appState.imagePrompt,
          huggingface_api_key: appState.huggingFaceApiKey
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '이미지 생성 실패');
      }

      const data = await response.json();
      
      if (!data.image_url) {
        throw new Error('이미지 URL을 받지 못했습니다.');
      }

      toast({
        title: "이미지 생성 완료",
        description: "이미지가 성공적으로 생성되었습니다."
      });

      return data.image_url;

    } catch (error) {
      console.error('이미지 생성 오류:', error);
      toast({
        title: "이미지 생성 실패",
        description: error instanceof Error ? error.message : "이미지 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsDirectlyGenerating(false);
    }
  };

  return {
    isGeneratingImage,
    isDirectlyGenerating,
    createImagePrompt,
    generateDirectImage
  };
};
