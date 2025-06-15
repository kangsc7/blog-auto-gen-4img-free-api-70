
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image } from 'lucide-react';
import { AppState } from '@/types';

interface ImageCreationProps {
  appState: AppState;
  isGeneratingImage: boolean;
  createImagePrompt: (text: string) => Promise<boolean>;
  copyToClipboard: (text: string, type: string) => void;
  openWhisk: () => void;
}

export const ImageCreation: React.FC<ImageCreationProps> = ({
  appState,
  isGeneratingImage,
  createImagePrompt,
  copyToClipboard,
  openWhisk,
}) => {
  const [manualInput, setManualInput] = useState('');

  const handleGenerate = () => {
    createImagePrompt(manualInput);
  };

  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-pink-700">
            <Image className="h-5 w-5 mr-2" />
            3. 이미지 프롬프트 생성 (수동)
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
            onClick={handleGenerate}
            disabled={!manualInput.trim() || isGeneratingImage || !appState.isApiKeyValidated}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGeneratingImage ? '이미지 프롬프트 생성 중...' : '이미지 프롬프트 생성'}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-pink-700">
            <Image className="h-5 w-5 mr-2" />
            이미지 프롬프트
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appState.imagePrompt ? (
            <div className="space-y-3">
              <Textarea
                value={appState.imagePrompt}
                readOnly
                className="min-h-32 bg-gray-50"
              />
              <Button 
                onClick={() => {
                  copyToClipboard(appState.imagePrompt, '이미지 프롬프트');
                  openWhisk();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Whisk 열기 (프롬프트 자동 복사)
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>이미지 프롬프트를 생성해보세요!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
