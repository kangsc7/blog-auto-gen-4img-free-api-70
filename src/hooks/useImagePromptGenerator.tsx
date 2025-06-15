
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

export const useImagePromptGenerator = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void
) => {
  const { toast } = useToast();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

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

  return { isGeneratingImage, createImagePrompt };
};
