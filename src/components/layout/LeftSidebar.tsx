
import React from 'react';
import { TopicGenerator } from '@/components/control/TopicGenerator';
import { ArticleGenerator } from '@/components/control/ArticleGenerator';
import { ImageCreation } from '@/components/control/ImageCreation';
import { HuggingFaceImageGenerator } from '@/components/display/HuggingFaceImageGenerator';
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
  return (
    <div className="space-y-6">
      <TopicGenerator
        appState={appState}
        saveAppState={saveAppState}
        isGeneratingTopics={generationStatus.isGeneratingTopics}
        generateTopics={generationFunctions.generateTopics}
        manualTopic={topicControls.manualTopic}
        setManualTopic={topicControls.setManualTopic}
        handleManualTopicAdd={topicControls.handleManualTopicAdd}
        preventDuplicates={preventDuplicates}
      />

      <ArticleGenerator
        appState={appState}
        isGeneratingContent={generationStatus.isGeneratingContent}
        generateArticle={generationFunctions.generateArticle}
        stopArticleGeneration={generationFunctions.stopArticleGeneration}
      />

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
        appState={appState}
        saveAppState={saveAppState}
      />
    </div>
  );
};
