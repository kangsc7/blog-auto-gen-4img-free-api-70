
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

export const useImagePromptGenerator = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void,
  huggingFaceApiKey: string,
  hasAccess: boolean
) => {
  const { toast } = useToast();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDirectlyGenerating, setIsDirectlyGenerating] = useState(false);
  
  // 이미지 프롬프트 생성 함수 (한글 -> 영어 프롬프트로 변환)
  const createImagePrompt = async (inputText: string): Promise<boolean> => {
    if (!inputText.trim()) {
      toast({ 
        title: "입력 텍스트 없음", 
        description: "이미지 프롬프트를 생성하려면 텍스트를 입력해주세요.",
        variant: "destructive" 
      });
      return false;
    }
    
    if (!appState.isApiKeyValidated) {
      toast({ 
        title: "API 키 검증 필요", 
        description: "먼저 API 키를 입력하고 검증해주세요.", 
        variant: "destructive" 
      });
      return false;
    }
    
    setIsGeneratingImage(true);
    
    try {
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;
      
      const prompt = `
당신은 텍스트를 받아 고품질의 이미지 생성 프롬프트로 변환하는 AI입니다.
다음 한글 텍스트를 받아 Stable Diffusion과 같은 이미지 생성 AI가 아름답고 상세한 이미지를 생성할 수 있는 영어 프롬프트로 변환해주세요.
영어로만 출력하고, 설명이나 주석은 달지 마세요. 오직 영어 프롬프트만 출력하세요.
프롬프트는 다음 형식을 따라야 합니다:
- 이미지 스타일, 분위기, 미학적 특징을 포함합니다. (예: photorealistic, cinematic, studio lighting, 8k, detailed)
- 구체적인 장면 설명을 포함합니다.
- 색상, 구도, 시점 등의 세부 사항을 포함합니다.

다음 텍스트를 영어 프롬프트로 변환해주세요:
"${inputText}"
`;
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2048,
          },
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 오류: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('API로부터 유효한 응답을 받지 못했습니다.');
      }
      
      const generatedPrompt = data.candidates[0].content.parts[0].text.trim();
      saveAppState({ imagePrompt: generatedPrompt });
      
      toast({ 
        title: "이미지 프롬프트 생성 완료", 
        description: "프롬프트가 성공적으로 생성되었습니다.",
      });
      
      return true;
    } catch (error) {
      console.error("이미지 프롬프트 생성 오류:", error);
      toast({
        title: "프롬프트 생성 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  const generateDirectImage = async (): Promise<string> => {
    if (!appState.imagePrompt) {
      toast({ 
        title: "프롬프트 없음", 
        description: "먼저 이미지 프롬프트를 생성해주세요.", 
        variant: "destructive" 
      });
      return '';
    }
    
    if (!appState.isHuggingFaceKeyValidated) {
      toast({ 
        title: "Hugging Face API 키 검증 필요", 
        description: "이미지를 생성하려면 Hugging Face API 키를 입력하고 검증해주세요.", 
        variant: "destructive" 
      });
      return '';
    }
    
    if (!hasAccess) {
      toast({ 
        title: "접근 제한", 
        description: "이 기능을 사용할 권한이 없습니다.", 
        variant: "destructive" 
      });
      return '';
    }
    
    setIsDirectlyGenerating(true);
    
    try {
      const response = await fetch('/api/generate-image-hf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: appState.imagePrompt,
          apiKey: huggingFaceApiKey,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || '이미지 생성에 실패했습니다.');
      }
      
      const data = await response.json();
      
      if (!data.image) {
        throw new Error('이미지 데이터를 받지 못했습니다.');
      }
      
      toast({ 
        title: "이미지 생성 완료", 
        description: "이미지가 성공적으로 생성되었습니다.",
      });
      
      return data.image;
    } catch (error) {
      console.error("이미지 생성 오류:", error);
      toast({
        title: "이미지 생성 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
      return '';
    } finally {
      setIsDirectlyGenerating(false);
    }
  };
  
  return {
    isGeneratingImage,
    createImagePrompt,
    isDirectlyGenerating,
    generateDirectImage,
  };
};
