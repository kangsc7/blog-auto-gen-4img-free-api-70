
import React from 'react';
import { TopicGenerator } from '@/components/control/TopicGenerator';
import { ArticleGenerator } from '@/components/control/ArticleGenerator';
import { ImageCreation } from '@/components/control/ImageCreation';
import { HuggingFaceImageGenerator } from '@/components/display/HuggingFaceImageGenerator';
import { ExternalReferenceInput } from '@/components/control/ExternalReferenceInput';
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
  return (
    <div 
      className="h-full"
      style={{
        width: '420px',
        minWidth: '420px',
        maxWidth: '420px'
      }}
    >
      <div 
        className="h-full overflow-y-auto pr-2"
        style={{
          maxHeight: 'calc(100vh - 8rem)'
        }}
      >
        <div className="space-y-6 p-1">
          <TopicGenerator
            appState={appState}
            saveAppState={saveAppState}
            isGeneratingTopics={generationStatus.isGeneratingTopics}
            generateTopicsFromKeyword={generationFunctions.generateTopics}
            manualTopic={topicControls.manualTopic}
            setManualTopic={topicControls.setManualTopic}
            handleManualTopicAdd={topicControls.handleManualTopicAdd}
            preventDuplicates={preventDuplicates}
          />

          <ArticleGenerator
            appState={appState}
            saveAppState={saveAppState}
            isGeneratingContent={generationStatus.isGeneratingContent}
            generateArticleContent={generationFunctions.generateArticle}
            stopArticleGeneration={generationFunctions.stopArticleGeneration}
            selectTopic={topicControls.selectTopic}
          />

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

            <HuggingFaceImageGenerator
              huggingFaceApiKey={appState.huggingFaceApiKey}
              isApiKeyValidated={appState.isHuggingFaceApiKeyValidated}
              hasAccess={true}
            />
          </div>

          <ExternalReferenceInput
            appState={appState}
            saveAppState={saveAppState}
            deleteReferenceData={deleteReferenceData}
          />
        </div>
      </div>
    </div>
  );
};
