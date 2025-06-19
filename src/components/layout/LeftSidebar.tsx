
import React, { useState } from 'react';
import { TopicGenerator } from '@/components/control/TopicGenerator';
import { ArticleGenerator } from '@/components/control/ArticleGenerator';
import { ImageCreation } from '@/components/control/ImageCreation';
import { HuggingFaceImageGenerator } from '@/components/display/HuggingFaceImageGenerator';
import { ExternalReferenceInput } from '@/components/control/ExternalReferenceInput';
import { EvergreenKeywordCounter } from '@/components/display/EvergreenKeywordCounter';
import { AppState } from '@/types';

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
  deleteReferenceData?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  appState,
  saveAppState,
  generationStatus,
  generationFunctions,
  topicControls,
  utilityFunctions,
  preventDuplicates,
  deleteReferenceData,
}) => {
  const [isHuggingFaceExpanded, setIsHuggingFaceExpanded] = useState(false);

  const handleHuggingFaceDoubleClick = () => {
    setIsHuggingFaceExpanded(!isHuggingFaceExpanded);
  };

  return (
    <div className="space-y-6">
      <TopicGenerator
        appState={appState}
        saveAppState={saveAppState}
        isGeneratingTopics={generationStatus.isGeneratingTopics}
        manualTopic={topicControls.manualTopic}
        setManualTopic={topicControls.setManualTopic}
        handleManualTopicAdd={topicControls.handleManualTopicAdd}
        preventDuplicates={preventDuplicates}
        generateTopicsFromKeyword={generationFunctions.generateTopics}
      />

      <ArticleGenerator
        appState={appState}
        saveAppState={saveAppState}
        isGeneratingContent={generationStatus.isGeneratingContent}
        stopArticleGeneration={generationFunctions.stopArticleGeneration}
        selectTopic={topicControls.selectTopic}
        generateArticleContent={generationFunctions.generateArticle}
      />

      <EvergreenKeywordCounter />

      <div className="space-y-4">
        <ImageCreation
          appState={appState}
          isGeneratingImage={generationStatus.isGeneratingImage}
          isDirectlyGenerating={generationStatus.isDirectlyGenerating}
          createImagePrompt={generationFunctions.createImagePrompt}
          generateDirectImage={generationFunctions.generateDirectImage}
          copyToClipboard={utilityFunctions.copyToClipboard}
          openWhisk={utilityFunctions.openWhisk}
        />

        {/* Hugging Face 이미지 생성기 - 더블클릭으로 접기/펼치기 */}
        <div 
          onDoubleClick={handleHuggingFaceDoubleClick}
          className={`cursor-pointer transition-all duration-300 ${
            isHuggingFaceExpanded ? 'opacity-100' : 'opacity-70'
          }`}
        >
          <div className={`transition-all duration-300 overflow-hidden ${
            isHuggingFaceExpanded ? 'max-h-[800px]' : 'max-h-16'
          }`}>
            <HuggingFaceImageGenerator
              huggingFaceApiKey={appState.huggingFaceApiKey}
              isApiKeyValidated={appState.isHuggingFaceApiKeyValidated}
              hasAccess={true}
            />
          </div>
          {!isHuggingFaceExpanded && (
            <div className="text-center text-xs text-gray-500 bg-gray-50 rounded p-2 mt-1">
              💡 더블클릭해서 Hugging Face 이미지 생성기 열기
            </div>
          )}
        </div>
      </div>

      <ExternalReferenceInput
        appState={appState}
        saveAppState={saveAppState}
        deleteReferenceData={deleteReferenceData}
      />
    </div>
  );
};
