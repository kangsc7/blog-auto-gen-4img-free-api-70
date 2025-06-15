
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image } from 'lucide-react';
import { AppState } from '@/types';
import { imageStyles } from '@/data/constants';

interface ImageCreationProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  isGeneratingImage: boolean;
  createImagePromptFromTopic: () => void;
  copyToClipboard: (text: string, type: string) => void;
  openWhisk: () => void;
}

export const ImageCreation: React.FC<ImageCreationProps> = ({
  appState,
  saveAppState,
  isGeneratingImage,
  createImagePromptFromTopic,
  copyToClipboard,
  openWhisk,
}) => {
  return (
    <>
      <Card className={`shadow-md ${!appState.generatedContent ? 'opacity-50' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center text-pink-700">
            <Image className="h-5 w-5 mr-2" />
            3. 이미지 생성
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">이미지 스타일</label>
            <div className="grid grid-cols-2 gap-2">
              {imageStyles.map((style) => (
                <label key={style.value} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="imageStyle"
                    value={style.value}
                    checked={appState.imageStyle === style.value}
                    onChange={(e) => saveAppState({ imageStyle: e.target.value })}
                    disabled={!appState.generatedContent}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{style.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button 
            onClick={createImagePromptFromTopic}
            disabled={!appState.generatedContent || isGeneratingImage || !appState.isApiKeyValidated}
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
              <div className="flex space-x-2">
                <Button 
                  onClick={() => copyToClipboard(appState.imagePrompt, '이미지 프롬프트')}
                  className="flex-1 bg-pink-600 hover:bg-pink-700"
                >
                  복사
                </Button>
                <Button 
                  onClick={openWhisk}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Whisk 열기
                </Button>
              </div>
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
