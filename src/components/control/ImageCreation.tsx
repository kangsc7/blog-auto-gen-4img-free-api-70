import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Copy, Info } from 'lucide-react';
import { AppState } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface ImageCreationProps {
  appState: AppState;
  isGeneratingImage: boolean;
  isDirectlyGenerating: boolean;
  createImagePrompt: (text: string) => Promise<boolean>;
  generateDirectImage: (refinedPrompt?: string) => Promise<string | null>;
  copyToClipboard: (text: string, type: string) => void;
  openWhisk: () => void;
}

export const ImageCreation: React.FC<ImageCreationProps> = ({
  appState,
  isGeneratingImage,
  isDirectlyGenerating,
  createImagePrompt,
  generateDirectImage,
  copyToClipboard,
  openWhisk,
}) => {
  const [manualInput, setManualInput] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGeneratePrompt = () => {
    createImagePrompt(manualInput);
  };

  const handleGenerateImage = async () => {
    const refinedPrompt = appState.imagePrompt + ' high detail, photorealistic, accurate, matching blog description';
    const image = await generateDirectImage(refinedPrompt);
    setGeneratedImage(image);
  };

  const handleCopyImageForTistory = async () => {
    if (!generatedImage) return;

    const altText = appState.selectedTopic || appState.keyword || 'generated_image_from_prompt';
    const sanitizedAltText = altText.replace(/[<>]/g, '').trim();

    try {
      const response = await fetch(generatedImage);
      const imageBlob = await response.blob();

      const clipboardItem = new ClipboardItem({
        [imageBlob.type]: imageBlob
      });

      await navigator.clipboard.write([clipboardItem]);

      toast({
        title: '✅ 티스토리 대표이미지용 복사 완료',
        description: '1️⃣ 티스토리에 Ctrl+V로 붙여넣기 → 2️⃣ 이미지 클릭 → 3️⃣ \u0027대표 이미지로 설정\' 버튼 클릭',
        duration: 8000
      });
    } catch (error) {
      console.error('Failed to copy image: ', error);
      try {
        const imgTag = `<img src="${generatedImage}" alt="${sanitizedAltText}" style="max-width: 100%; height: auto; display: block; margin: 20px auto; border-radius: 8px;">`;
        await navigator.clipboard.writeText(imgTag);

        toast({
          title: 'HTML 태그 복사 완료',
          description: '티스토리 HTML 모드에서 붙여넣으세요. (대표이미지 설정은 수동으로 해야 합니다)',
          duration: 5000
        });
      } catch (copyError) {
        toast({
          title: '복사 실패',
          description: '클립보드 복사에 실패했습니다. 우클릭으로 이미지를 저장해서 사용하세요.',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-pink-700">
            <Image className="h-5 w-5 mr-2" />
            3. 이미지 프롬프트 및 생성
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">프롬프트로 변환할 내용</label>
            <Textarea
              placeholder="블로그 글의 서론이나 묘사하고 싶은 문장을 붙여넣으세요..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="min-h-24"
            />
            <p className="text-xs text-gray-500 mt-1">한글로 입력하면 영어 프롬프트로 자동 변환됩니다.</p>
          </div>

          <Button 
            onClick={handleGeneratePrompt}
            disabled={!manualInput.trim() || isGeneratingImage || !appState.isApiKeyValidated}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGeneratingImage ? '이미지 프롬프트 생성 중...' : '1. 이미지 프롬프트 생성'}
          </Button>

          <div className="mt-4 border-t pt-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">생성된 프롬프트</h4>
            {appState.imagePrompt ? (
              <div className="space-y-3">
                <Textarea
                  value={appState.imagePrompt}
                  readOnly
                  className="min-h-24 bg-gray-50"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => {
                      copyToClipboard(appState.imagePrompt, '이미지 프롬프트');
                      openWhisk();
                    }}
                    className="w-full bg-gray-700 hover:bg-gray-800"
                  >
                    Whisk 열기 (복사)
                  </Button>
                  <Button
                    onClick={handleGenerateImage}
                    disabled={isDirectlyGenerating || !appState.imagePrompt}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isDirectlyGenerating ? '이미지 생성중...' : '2. 이미지 생성'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 rounded-lg bg-gray-50">
                <p>프롬프트를 먼저 생성해주세요.</p>
              </div>
            )}
          </div>

          {(isDirectlyGenerating || generatedImage) && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-md font-semibold text-gray-800 mb-2">생성된 이미지</h4>
              {isDirectlyGenerating ? (
                <Skeleton className="w-full h-64 rounded-lg" />
              ) : generatedImage ? (
                <div className="space-y-3">
                  <img src={generatedImage} alt="Generated from prompt" className="rounded-lg w-full" />

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-700">
                        <p className="font-semibold mb-1">💡 티스토리 대표이미지 설정 방법:</p>
                        <p>1️⃣ 아래 버튼으로 이미지 복사</p>
                        <p>2️⃣ 티스토리에 Ctrl+V로 붙여넣기</p>
                        <p>3️⃣ 붙여넣은 이미지 클릭 후 '대표 이미지로 설정' 버튼 클릭</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-primary-foreground"
                    onClick={handleCopyImageForTistory}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    티스토리용 이미지 복사 (대표이미지 설정 가능)
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
