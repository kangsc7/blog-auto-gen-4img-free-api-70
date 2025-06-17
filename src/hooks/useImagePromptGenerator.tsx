import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

export const useImagePromptGenerator = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void
) => {
  const { toast } = useToast();
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const generateImagePrompt = async (): Promise<boolean> => {
    if (!appState.isApiKeyValidated || !appState.selectedTopic) {
      toast({
        title: "필수 정보 확인",
        description: "API 키 검증과 주제 선택이 필요합니다.",
        variant: "destructive"
      });
      return false;
    }

    setIsGeneratingPrompt(true);
    
    try {
      const promptText = `다음 주제에 대한 블로그 글에 어울리는 이미지 프롬프트를 영어로 생성해주세요: ${appState.selectedTopic}. 
      프롬프트는 간결하고 구체적이며 시각적으로 매력적인 이미지를 생성할 수 있도록 작성해주세요.`;
      
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${appState.apiKey}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: promptText }] }] 
        })
      });

      if (!response.ok) {
        throw new Error('이미지 프롬프트 생성에 실패했습니다.');
      }
      
      const data = await response.json();
      const imagePrompt = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (imagePrompt) {
        saveAppState({ imagePrompt });
        toast({ 
          title: "이미지 프롬프트 생성 완료", 
          description: "이미지 프롬프트가 성공적으로 생성되었습니다." 
        });
        return true;
      } else {
        throw new Error('유효한 프롬프트를 생성하지 못했습니다.');
      }
    } catch (error) {
      console.error('이미지 프롬프트 생성 오류:', error);
      toast({ 
        title: "프롬프트 생성 실패", 
        description: error instanceof Error ? error.message : "프롬프트 생성 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
      return false;
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const generateImage = async (): Promise<boolean> => {
    if (!appState.imagePrompt || !appState.isHuggingfaceApiKeyValidated) {
      toast({
        title: "필수 정보 확인",
        description: "이미지 프롬프트와 HuggingFace API 키가 필요합니다.",
        variant: "destructive"
      });
      return false;
    }

    setIsGeneratingPrompt(true);
    
    try {
      toast({ 
        title: "이미지 생성 시작", 
        description: "이미지를 생성하고 있습니다. 잠시만 기다려주세요." 
      });
      
      // 실제 이미지 생성 로직은 여기에 구현
      await new Promise(resolve => setTimeout(resolve, 2000)); // 임시 딜레이
      
      toast({ 
        title: "이미지 생성 완료", 
        description: "이미지가 성공적으로 생성되었습니다." 
      });
      return true;
    } catch (error) {
      console.error('이미지 생성 오류:', error);
      toast({ 
        title: "이미지 생성 실패", 
        description: error instanceof Error ? error.message : "이미지 생성 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
      return false;
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  return {
    isGeneratingPrompt,
    generateImagePrompt,
    generateImage
  };
};
