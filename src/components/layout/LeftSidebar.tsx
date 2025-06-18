
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings, ExternalLink } from 'lucide-react';
import { TopicGenerator } from '@/components/control/TopicGenerator';
import { ArticleGenerator } from '@/components/control/ArticleGenerator';
import { ImageCreation } from '@/components/control/ImageCreation';
import { HuggingFaceApiKeyManager } from '@/components/control/HuggingFaceApiKeyManager';
import { GeminiApiKeyManager } from '@/components/control/GeminiApiKeyManager';
import { PixabayApiKeyManager } from '@/components/control/PixabayApiKeyManager';
import { ExternalReferenceInput } from '@/components/control/ExternalReferenceInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { colorThemes } from '@/data/constants';
import { AppState } from '@/types';

interface LeftSidebarProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  isGeneratingTopics: boolean;
  generateTopics: (keywordOverride?: string) => Promise<string[] | null>;
  isGeneratingContent: boolean;
  generateArticle: (options?: { topic?: string; keyword?: string }) => Promise<string | null>;
  stopArticleGeneration: () => void;
  isGeneratingImage: boolean;
  createImagePrompt: (inputText: string) => Promise<boolean>;
  isDirectlyGenerating: boolean;
  generateDirectImage: () => Promise<string>;
  manualTopic: string;
  setManualTopic: React.Dispatch<React.SetStateAction<string>>;
  handleManualTopicAdd: () => void;
  preventDuplicates: boolean;
  selectTopic: (topic: string) => void;
  copyToClipboard: (text: string, type: string) => void;
  deleteReferenceData?: () => void;
  openWhisk: () => void;
  geminiManager?: any;
  pixabayManager?: any;
  huggingFaceManager?: any;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  appState,
  saveAppState,
  isGeneratingTopics,
  generateTopics,
  isGeneratingContent,
  generateArticle,
  stopArticleGeneration,
  isGeneratingImage,
  createImagePrompt,
  isDirectlyGenerating,
  generateDirectImage,
  manualTopic,
  setManualTopic,
  handleManualTopicAdd,
  preventDuplicates,
  selectTopic,
  copyToClipboard,
  deleteReferenceData,
  openWhisk,
  geminiManager,
  pixabayManager,
  huggingFaceManager,
}) => {
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [showExternalReference, setShowExternalReference] = useState(false);
  const [showColorTheme, setShowColorTheme] = useState(false);

  const handleDoubleClickApiKeys = () => {
    setShowApiKeys(!showApiKeys);
  };

  const handleDoubleClickExternalReference = () => {
    setShowExternalReference(!showExternalReference);
  };
  
  const handleDoubleClickColorTheme = () => {
    setShowColorTheme(!showColorTheme);
  };
  
  // 랜덤 컬러 테마 선택 함수
  const selectRandomColorTheme = () => {
    const randomIndex = Math.floor(Math.random() * colorThemes.length);
    saveAppState({ colorTheme: colorThemes[randomIndex].value });
  };

  return (
    <div className="w-full bg-gray-50 border-r border-gray-200 overflow-y-auto h-full">
      <div className="p-4 space-y-4">
        {/* API 키 설정 */}
        <Card className="shadow-md cursor-pointer" onDoubleClick={handleDoubleClickApiKeys}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-800">
              <span className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                API 키 설정
              </span>
              {showApiKeys ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </CardTitle>
          </CardHeader>
          {showApiKeys && (
            <CardContent className="space-y-4">
              {geminiManager && (
                <GeminiApiKeyManager
                  geminiApiKey={geminiManager.apiKey}
                  setGeminiApiKey={geminiManager.setApiKey}
                  isGeminiApiKeyValidated={geminiManager.isApiKeyValidated}
                  setIsGeminiApiKeyValidated={geminiManager.setIsApiKeyValidated}
                  isGeminiValidating={geminiManager.isValidating}
                  validateGeminiApiKey={geminiManager.validateApiKey}
                  deleteGeminiApiKeyFromStorage={geminiManager.deleteApiKeyFromStorage}
                />
              )}
              {pixabayManager && (
                <PixabayApiKeyManager
                  pixabayApiKey={pixabayManager.pixabayApiKey}
                  setPixabayApiKey={pixabayManager.setPixabayApiKey}
                  isPixabayApiKeyValidated={pixabayManager.isPixabayApiKeyValidated}
                  setIsPixabayApiKeyValidated={pixabayManager.setIsPixabayApiKeyValidated}
                  isPixabayValidating={pixabayManager.isPixabayValidating}
                  validatePixabayApiKey={pixabayManager.validatePixabayApiKey}
                  deletePixabayApiKeyFromStorage={pixabayManager.deletePixabayApiKeyFromStorage}
                />
              )}
              {huggingFaceManager && (
                <HuggingFaceApiKeyManager
                  huggingFaceApiKey={huggingFaceManager.huggingFaceApiKey}
                  setHuggingFaceApiKey={huggingFaceManager.setHuggingFaceApiKey}
                  isHuggingFaceApiKeyValidated={huggingFaceManager.isHuggingFaceApiKeyValidated}
                  setIsHuggingFaceApiKeyValidated={huggingFaceManager.setIsHuggingFaceApiKeyValidated}
                  isHuggingFaceValidating={huggingFaceManager.isHuggingFaceValidating}
                  validateHuggingFaceApiKey={huggingFaceManager.validateHuggingFaceApiKey}
                  deleteHuggingFaceApiKeyFromStorage={huggingFaceManager.deleteHuggingFaceApiKeyFromStorage}
                />
              )}
            </CardContent>
          )}
          {!showApiKeys && (
            <CardContent className="text-xs text-gray-600">
              <p>더블클릭으로 API 키 설정을 열거나 닫을 수 있습니다.</p>
            </CardContent>
          )}
        </Card>

        {/* 컬러 테마 선택 */}
        <Card className="shadow-md cursor-pointer" onDoubleClick={handleDoubleClickColorTheme}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-purple-700">
              <span className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                블로그 컬러 테마
              </span>
              {showColorTheme ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </CardTitle>
          </CardHeader>
          {showColorTheme && (
            <CardContent>
              <Select 
                value={appState.colorTheme || ''} 
                onValueChange={(value) => saveAppState({ colorTheme: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="컬러 테마 선택" />
                </SelectTrigger>
                <SelectContent>
                  {colorThemes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: theme.value }}
                        />
                        <span>{theme.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={selectRandomColorTheme} 
                variant="outline" 
                className="w-full mt-2"
              >
                랜덤 테마 선택
              </Button>
              <p className="text-xs text-gray-500 mt-2">선택한 테마가 블로그 글에 적용됩니다</p>
            </CardContent>
          )}
          {!showColorTheme && (
            <CardContent className="text-xs text-gray-600">
              <p>더블클릭으로 컬러 테마 설정을 열거나 닫을 수 있습니다.</p>
            </CardContent>
          )}
        </Card>

        {/* 주제 생성 */}
        <TopicGenerator
          appState={appState}
          saveAppState={saveAppState}
          isGeneratingTopics={isGeneratingTopics}
          generateTopicsFromKeyword={generateTopics}
          manualTopic={manualTopic}
          setManualTopic={setManualTopic}
          handleManualTopicAdd={handleManualTopicAdd}
          preventDuplicates={preventDuplicates}
        />

        {/* 블로그 글 생성 */}
        <ArticleGenerator
          appState={appState}
          saveAppState={saveAppState}
          selectTopic={selectTopic}
          isGeneratingContent={isGeneratingContent}
          generateArticleContent={generateArticle}
          stopArticleGeneration={stopArticleGeneration}
        />

        {/* 이미지 프롬프트 및 생성 */}
        <ImageCreation
          appState={appState}
          isGeneratingImage={isGeneratingImage}
          createImagePrompt={createImagePrompt}
          isDirectlyGenerating={isDirectlyGenerating}
          generateDirectImage={generateDirectImage}
          copyToClipboard={copyToClipboard}
          openWhisk={openWhisk}
        />

        {/* 외부 링크 설정 */}
        <Card className="shadow-md cursor-pointer" onDoubleClick={handleDoubleClickExternalReference}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-purple-700">
              <span className="flex items-center">
                <ExternalLink className="h-5 w-5 mr-2" />
                외부 링크 설정
              </span>
              {showExternalReference ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </CardTitle>
          </CardHeader>
          {showExternalReference && (
            <CardContent>
              <ExternalReferenceInput
                appState={appState}
                saveAppState={saveAppState}
                deleteReferenceData={deleteReferenceData}
              />
            </CardContent>
          )}
          {!showExternalReference && (
            <CardContent className="text-xs text-gray-600">
              <p>더블클릭으로 외부 링크 설정을 열거나 닫을 수 있습니다.</p>
              {(appState.referenceLink || appState.referenceSentence) && (
                <p className="text-green-600 mt-1">✅ 외부 링크 설정 완료</p>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};
