
import React from 'react';
import { TopicGenerator } from '@/components/control/TopicGenerator';
import { ArticleGenerator } from '@/components/control/ArticleGenerator';
import { ImageCreation } from '@/components/control/ImageCreation';
import { ExternalReferenceInput } from '@/components/control/ExternalReferenceInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette } from 'lucide-react';
import { AppState } from '@/types';
import { colorThemes } from '@/data/constants';

interface LeftSidebarProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  generationStatus: {
    isGeneratingTopics: boolean;
    isGeneratingContent: boolean;
    isGeneratingImage: boolean;
    isDirectlyGenerating: boolean;
  };
  generationFunctions: {
    generateTopics: (keywordOverride?: string) => Promise<string[] | null>;
    generateArticle: (options?: { topic?: string; keyword?: string }) => Promise<string | null>;
    createImagePrompt: (inputText: string) => Promise<boolean>;
    generateDirectImage: () => Promise<string | null>;
    stopArticleGeneration: () => void;
  };
  topicControls: {
    manualTopic: string;
    setManualTopic: React.Dispatch<React.SetStateAction<string>>;
    handleManualTopicAdd: () => void;
    selectTopic: (topic: string) => void;
  };
  utilityFunctions: {
    copyToClipboard: (text: string, type: string) => void;
    openWhisk: () => void;
    downloadHTML: () => void;
  };
  preventDuplicates: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  appState,
  saveAppState,
  generationStatus,
  generationFunctions,
  topicControls,
  utilityFunctions,
  preventDuplicates,
}) => {
  const handleColorThemeChange = (value: string) => {
    saveAppState({ colorTheme: value });
  };

  return (
    <div className="space-y-6">
      <TopicGenerator
        keyword={appState.keyword}
        setKeyword={(keyword) => saveAppState({ keyword })}
        topics={appState.topics}
        isGeneratingTopics={generationStatus.isGeneratingTopics}
        generateTopics={generationFunctions.generateTopics}
        manualTopic={topicControls.manualTopic}
        setManualTopic={topicControls.setManualTopic}
        handleManualTopicAdd={topicControls.handleManualTopicAdd}
        preventDuplicates={preventDuplicates}
      />

      {/* 컬러테마 선택 섹션 */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-700">
            <Palette className="h-5 w-5 mr-2" />
            블로그 컬러테마 선택
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={appState.colorTheme || 'classic-blue'} onValueChange={handleColorThemeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="컬러테마를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {colorThemes.map((theme) => (
                <SelectItem key={theme.value} value={theme.value}>
                  {theme.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-2">
            선택한 테마가 생성되는 블로그 글의 색상에 적용됩니다
          </p>
        </CardContent>
      </Card>

      <ArticleGenerator
        selectedTopic={appState.selectedTopic}
        isGeneratingContent={generationStatus.isGeneratingContent}
        generateArticle={generationFunctions.generateArticle}
        stopArticleGeneration={generationFunctions.stopArticleGeneration}
        keyword={appState.keyword}
      />

      <ExternalReferenceInput
        appState={appState}
        saveAppState={saveAppState}
      />

      <ImageCreation
        imagePrompt={appState.imagePrompt}
        setImagePrompt={(prompt) => saveAppState({ imagePrompt: prompt })}
        isGeneratingImage={generationStatus.isGeneratingImage}
        createImagePrompt={generationFunctions.createImagePrompt}
        generatedContent={appState.generatedContent}
        isDirectlyGenerating={generationStatus.isDirectlyGenerating}
        generateDirectImage={generationFunctions.generateDirectImage}
      />
    </div>
  );
};
