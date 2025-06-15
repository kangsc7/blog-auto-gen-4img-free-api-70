
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Copy } from 'lucide-react';
import { AppState } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageCreationProps {
  appState: AppState;
  isGeneratingImage: boolean;
  isDirectlyGenerating: boolean;
  createImagePrompt: (text: string) => Promise<boolean>;
  generateDirectImage: () => Promise<string | null>;
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

  const handleGeneratePrompt = () => {
    createImagePrompt(manualInput);
  };
  
  const handleGenerateImage = async () => {
    const image = await generateDirectImage();
    setGeneratedImage(image);
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
                <div className="space-y-2">
                  <img src={generatedImage} alt="Generated from prompt" className="rounded-lg w-full" />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => copyToClipboard(generatedImage, '이미지 데이터 URL')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    이미지 데이터 URL 복사
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
