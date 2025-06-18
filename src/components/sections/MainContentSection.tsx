
import React from 'react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { RightContent } from '@/components/layout/RightContent';
import { AppState } from '@/types';

interface MainContentSectionProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  generationStatus: {
    isGeneratingTopics: boolean;
    isGeneratingContent: boolean;
    isGeneratingImage: boolean;
    isDirectlyGenerating: boolean;
    isOneClickGenerating: boolean;
  };
  generationFunctions: {
    generateTopics: () => Promise<string[] | null>;
    generateArticle: (options?: { topic?: string; keyword?: string }) => Promise<string | null>;
    createImagePrompt: (inputText: string) => Promise<boolean>;
    generateDirectImage: () => Promise<string>;
    stopArticleGeneration: () => void;
  };
  topicControls: {
    manualTopic: string;
    setManualTopic: React.Dispatch<React.SetStateAction<string>>;
    selectTopic: (topic: string) => void;
    handleManualTopicAdd: () => void;
  };
  utilityFunctions: {
    copyToClipboard: (text: string, type: string) => void;
    downloadHTML: () => void;
    openWhisk: () => void;
  };
  preventDuplicates: boolean;
  handleTopicConfirm?: (topic: string) => void;
  deleteReferenceData?: () => void;
}

export const MainContentSection: React.FC<MainContentSectionProps> = ({
  appState,
  saveAppState,
  generationStatus,
  generationFunctions,
  topicControls,
  utilityFunctions,
  preventDuplicates,
  handleTopicConfirm,
  deleteReferenceData,
}) => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <LeftSidebar
            appState={appState}
            saveAppState={saveAppState}
            isGeneratingTopics={generationStatus.isGeneratingTopics}
            generateTopics={generationFunctions.generateTopics}
            isGeneratingContent={generationStatus.isGeneratingContent}
            generateArticle={generationFunctions.generateArticle}
            stopArticleGeneration={generationFunctions.stopArticleGeneration}
            isGeneratingImage={generationStatus.isGeneratingImage}
            createImagePrompt={generationFunctions.createImagePrompt}
            isDirectlyGenerating={generationStatus.isDirectlyGenerating}
            generateDirectImage={generationFunctions.generateDirectImage}
            manualTopic={topicControls.manualTopic}
            setManualTopic={topicControls.setManualTopic}
            handleManualTopicAdd={topicControls.handleManualTopicAdd}
            preventDuplicates={preventDuplicates}
            selectTopic={topicControls.selectTopic}
            copyToClipboard={utilityFunctions.copyToClipboard}
            deleteReferenceData={deleteReferenceData}
            openWhisk={utilityFunctions.openWhisk}
          />
        </div>
        <div className="lg:col-span-8">
          <RightContent
            appState={appState}
            saveAppState={saveAppState}
            selectTopic={topicControls.selectTopic}
            copyToClipboard={utilityFunctions.copyToClipboard}
            downloadHTML={utilityFunctions.downloadHTML}
            isGeneratingContent={generationStatus.isGeneratingContent}
            onTopicConfirm={handleTopicConfirm}
          />
        </div>
      </div>
    </div>
  );
};
