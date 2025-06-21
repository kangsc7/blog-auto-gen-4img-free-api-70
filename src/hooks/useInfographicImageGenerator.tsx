
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageGenerationResult {
  imageUrl: string;
  layoutType: 'left' | 'right' | 'background' | 'top';
}

export const useInfographicImageGenerator = (huggingFaceApiKey?: string) => {
  const { toast } = useToast();
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  const generateImageForSection = async (sectionTitle: string, sectionContent: string): Promise<ImageGenerationResult | null> => {
    try {
      // 섹션 내용을 기반으로 이미지 프롬프트 생성
      const imagePrompt = createOptimizedImagePrompt(sectionTitle, sectionContent);
      
      const { data, error } = await supabase.functions.invoke('generate-image-hf', {
        body: { 
          prompt: imagePrompt,
          apiKey: huggingFaceApiKey || undefined,
        },
      });

      if (error) throw error;
      
      const { image } = data;
      if (!image) throw new Error('이미지 생성 실패');

      // 랜덤 레이아웃 타입 선택
      const layoutTypes: Array<'left' | 'right' | 'background' | 'top'> = ['left', 'right', 'background', 'top'];
      const randomLayout = layoutTypes[Math.floor(Math.random() * layoutTypes.length)];

      return {
        imageUrl: image,
        layoutType: randomLayout
      };

    } catch (error) {
      console.error('이미지 생성 오류:', error);
      return null;
    }
  };

  const generateImagesForInfographic = async (subtitles: string[], content: string): Promise<ImageGenerationResult[]> => {
    setIsGeneratingImages(true);
    const results: ImageGenerationResult[] = [];

    try {
      for (const subtitle of subtitles.slice(0, 3)) { // 최대 3개 이미지
        const sectionContent = extractContentBySubtitle(content, subtitle);
        const imageResult = await generateImageForSection(subtitle, sectionContent);
        if (imageResult) {
          results.push(imageResult);
        }
        // 각 이미지 생성 사이에 짧은 딜레이
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('이미지 생성 전체 오류:', error);
    } finally {
      setIsGeneratingImages(false);
    }

    return results;
  };

  const createOptimizedImagePrompt = (title: string, content: string): string => {
    // HTML 태그 제거
    const cleanContent = content.replace(/<[^>]*>/g, '').trim();
    const firstSentence = cleanContent.split('.')[0] || title;
    
    // 한국어 제목을 영어 키워드로 변환
    const keywords = extractKeywords(title + ' ' + firstSentence);
    
    return `Professional infographic illustration of ${keywords}, modern flat design style, clean minimalist aesthetic, soft corporate colors, high quality digital art, 4k resolution, suitable for business presentation`;
  };

  const extractKeywords = (text: string): string => {
    // 간단한 키워드 추출 로직
    const keywordMap: { [key: string]: string } = {
      '월급': 'salary management',
      '재테크': 'financial investment',
      '관리': 'management strategy',
      '투자': 'investment planning',
      '금융': 'financial services',
      '자산': 'asset management',
      '저축': 'savings plan',
      '신청': 'application process',
      '조건': 'requirements',
      '서류': 'documentation',
      '주의사항': 'important notes'
    };

    let englishKeywords = '';
    for (const [korean, english] of Object.entries(keywordMap)) {
      if (text.includes(korean)) {
        englishKeywords += english + ' ';
      }
    }

    return englishKeywords.trim() || 'business strategy';
  };

  const extractContentBySubtitle = (content: string, subtitle: string): string => {
    const regex = new RegExp(`<h2[^>]*>${subtitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^<]*</h2>(.*?)(?=<h2|$)`, 'si');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  };

  return {
    generateImagesForInfographic,
    isGeneratingImages
  };
};
