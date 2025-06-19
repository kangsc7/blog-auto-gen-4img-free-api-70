
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Image as ImageIcon, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HuggingFaceImageGeneratorProps {
  huggingFaceApiKey: string;
  isApiKeyValidated: boolean;
  hasAccess: boolean;
}

export const HuggingFaceImageGenerator: React.FC<HuggingFaceImageGeneratorProps> = ({
  huggingFaceApiKey,
  isApiKeyValidated,
  hasAccess
}) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const generateImage = async () => {
    if (!hasAccess) {
      toast({
        title: "접근 제한",
        description: "이 기능을 사용할 권한이 없습니다.",
        variant: "destructive"
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "프롬프트 입력 필요",
        description: "이미지 생성을 위한 영어 프롬프트를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!isApiKeyValidated) {
      toast({
        title: "API 키 검증 필요",
        description: "먼저 Hugging Face API 키를 검증해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage('');

    try {
      const { data, error } = await supabase.functions.invoke('generate-image-hf', {
        body: { 
          prompt: prompt.trim(),
          apiKey: huggingFaceApiKey,
        },
      });

      if (error) {
        throw error;
      }
      
      const { image } = data;
      if (!image) {
        throw new Error('API로부터 유효한 이미지를 받지 못했습니다.');
      }

      setGeneratedImage(image);
      toast({
        title: "이미지 생성 완료",
        description: "Hugging Face API를 통해 이미지가 성공적으로 생성되었습니다.",
        duration: 3000
      });

    } catch (error: any) {
      console.error('Hugging Face 이미지 생성 오류:', error);
      let errorMessage = "이미지 생성 중 오류가 발생했습니다.";
      
      if (error.context && typeof error.context.json === 'function') {
        try {
          const functionError = await error.context.json();
          if (functionError.error && functionError.details) {
            errorMessage = `${functionError.error}: ${functionError.details}`;
          } else if (functionError.details) {
            errorMessage = functionError.details;
          } else {
            errorMessage = functionError.error || errorMessage;
          }
        } catch (e) {
          errorMessage = error.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "이미지 생성 실패",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyImageToClipboard = async () => {
    if (!generatedImage) {
      toast({
        title: "복사할 이미지 없음",
        description: "먼저 이미지를 생성해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsCopying(true);

    try {
      // Base64 이미지를 Blob으로 변환
      const base64Data = generatedImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // ClipboardItem으로 이미지 복사
      const clipboardItem = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([clipboardItem]);

      toast({
        title: "이미지 복사 완료",
        description: "이미지가 클립보드에 복사되었습니다. 편집기에서 Ctrl+V로 붙여넣으세요.",
        duration: 3000
      });

    } catch (error) {
      console.error('이미지 복사 오류:', error);
      
      // 폴백: Base64 이미지 HTML 태그를 텍스트로 복사
      try {
        const imageHtml = `<img src="${generatedImage}" alt="Generated Image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />`;
        await navigator.clipboard.writeText(imageHtml);
        
        toast({
          title: "HTML 태그 복사 완료",
          description: "이미지 HTML 태그가 복사되었습니다. 편집기에 붙여넣으세요.",
          duration: 3000
        });
      } catch (fallbackError) {
        toast({
          title: "복사 실패",
          description: "이미지 복사에 실패했습니다. 우클릭으로 이미지를 복사해보세요.",
          variant: "destructive"
        });
      }
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-700">
          <Wand2 className="h-6 w-6 mr-2" />
          Hugging Face 이미지 생성기
        </CardTitle>
        <p className="text-sm text-gray-600">
          영어 프롬프트를 입력하여 AI 이미지를 생성하고, 블로그 글에 추가하세요.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 프롬프트 입력 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 프롬프트 (영어로 입력)
            </label>
            <Textarea
              placeholder="예: A beautiful sunset over mountains, 4k photorealistic style, high detail, natural lighting, cinematic"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* 생성 버튼 */}
          <Button
            onClick={generateImage}
            disabled={!prompt.trim() || isGenerating || !isApiKeyValidated || !hasAccess}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                이미지 생성 중...
              </>
            ) : (
              <>
                <ImageIcon className="h-5 w-5 mr-2" />
                이미지 생성
              </>
            )}
          </Button>
        </div>

        {/* 생성된 이미지 */}
        {generatedImage && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <img
                src={generatedImage}
                alt="Generated"
                className="w-full max-w-md mx-auto rounded-lg shadow-md"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>
            
            <Button
              onClick={copyImageToClipboard}
              disabled={isCopying}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              {isCopying ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  복사 중...
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-2" />
                  이미지 복사 (편집기에 붙여넣기)
                </>
              )}
            </Button>
          </div>
        )}

        {/* 상태 메시지 */}
        {!hasAccess && (
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              이 기능을 사용하려면 접근 권한이 필요합니다.
            </p>
          </div>
        )}

        {!isApiKeyValidated && hasAccess && (
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              먼저 Hugging Face API 키를 설정하고 검증해주세요.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
