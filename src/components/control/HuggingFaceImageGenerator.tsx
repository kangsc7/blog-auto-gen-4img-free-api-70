
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Image as ImageIcon, Copy, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HuggingFaceImageGeneratorProps {
  huggingFaceApiKey: string;
  isHuggingFaceApiKeyValidated: boolean;
}

export const HuggingFaceImageGenerator: React.FC<HuggingFaceImageGeneratorProps> = ({
  huggingFaceApiKey,
  isHuggingFaceApiKeyValidated
}) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = useCallback(async () => {
    if (!prompt.trim()) {
      toast({
        title: "프롬프트 필요",
        description: "이미지 생성을 위한 프롬프트를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!isHuggingFaceApiKeyValidated) {
      toast({
        title: "API 키 검증 필요",
        description: "먼저 Hugging Face API 키를 검증해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🖼️ Hugging Face 이미지 생성 시작:', prompt);

      const { data, error } = await supabase.functions.invoke('generate-image-hf', {
        body: { 
          prompt: prompt.trim(),
          apiKey: huggingFaceApiKey,
        },
      });

      if (error) {
        console.error('❌ 이미지 생성 오류:', error);
        throw error;
      }
      
      if (!data?.image) {
        throw new Error('API로부터 유효한 이미지를 받지 못했습니다.');
      }

      console.log('✅ 이미지 생성 성공');
      setGeneratedImage(data.image);
      toast({
        title: "이미지 생성 완료",
        description: "프롬프트 기반 이미지가 성공적으로 생성되었습니다.",
        duration: 3000
      });

    } catch (error: any) {
      console.error('❌ 이미지 생성 실패:', error);
      let errorMessage = "이미지 생성 중 오류가 발생했습니다.";
      
      if (error.context && typeof error.context.json === 'function') {
        try {
          const functionError = await error.context.json();
          errorMessage = functionError.details || functionError.error || errorMessage;
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
  }, [prompt, huggingFaceApiKey, isHuggingFaceApiKeyValidated, toast]);

  const copyImageToClipboard = useCallback(async () => {
    if (!generatedImage) {
      toast({
        title: "복사 오류",
        description: "복사할 이미지가 없습니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Base64 데이터를 Blob으로 변환
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      
      // 클립보드에 이미지 복사
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);

      toast({
        title: "이미지 복사 완료",
        description: "이미지가 클립보드에 복사되었습니다. 편집기에 붙여넣기(Ctrl+V)하세요.",
        duration: 3000
      });
    } catch (error) {
      console.error('이미지 복사 실패:', error);
      toast({
        title: "복사 실패",
        description: "이미지 복사에 실패했습니다. 브라우저가 클립보드 API를 지원하지 않을 수 있습니다.",
        variant: "destructive"
      });
    }
  }, [generatedImage, toast]);

  const downloadImage = useCallback(() => {
    if (!generatedImage) {
      toast({
        title: "다운로드 오류",
        description: "다운로드할 이미지가 없습니다.",
        variant: "destructive"
      });
      return;
    }

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "다운로드 완료",
      description: "이미지가 다운로드되었습니다.",
      duration: 3000
    });
  }, [generatedImage, toast]);

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-700">
          <ImageIcon className="h-5 w-5 mr-2" />
          Hugging Face 이미지 생성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이미지 프롬프트 (영어)
          </label>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="A beautiful sunset over mountains..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isGenerating) {
                  generateImage();
                }
              }}
            />
            <Button 
              onClick={generateImage}
              disabled={!prompt.trim() || isGenerating || !isHuggingFaceApiKeyValidated}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  생성 중...
                </>
              ) : (
                '생성'
              )}
            </Button>
          </div>
          {!isHuggingFaceApiKeyValidated && (
            <p className="text-xs text-red-600 mt-1">
              Hugging Face API 키를 먼저 검증해주세요.
            </p>
          )}
        </div>

        {isGenerating && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-purple-600" />
            <p className="text-purple-600 font-semibold">이미지를 생성하고 있습니다...</p>
            <p className="text-sm text-gray-500">잠시만 기다려주세요 (약 10-30초)</p>
          </div>
        )}

        {generatedImage && !isGenerating && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <img 
                src={generatedImage} 
                alt="Generated" 
                className="w-full max-w-md mx-auto rounded-lg shadow-md"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={copyImageToClipboard}
                variant="outline"
                className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
              >
                <Copy className="h-4 w-4 mr-1" />
                이미지 복사
              </Button>
              <Button 
                onClick={downloadImage}
                variant="outline"
                className="flex-1 text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-1" />
                다운로드
              </Button>
            </div>
            
            <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">
              💡 <strong>사용법:</strong> "이미지 복사" 버튼을 클릭한 후 블로그 편집기에서 Ctrl+V로 붙여넣기하세요.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
