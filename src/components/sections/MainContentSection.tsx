
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
  };
  generationFunctions: {
    generateTopics: (keywordOverride?: string) => Promise<string[] | null>;
    generateArticle: (options?: { topic?: string; keyword?: string }) => Promise<string | null>;
    createImagePrompt: (inputText: string) => Promise<boolean>;
    generateDirectImage: () => Promise<string | null>;
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
  handleTopicConfirm?: (topic: string) => void;
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
}) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <LeftSidebar
          appState={appState}
          saveAppState={saveAppState}
          generationStatus={generationStatus}
          generationFunctions={generationFunctions}
          topicControls={topicControls}
          utilityFunctions={utilityFunctions}
          preventDuplicates={preventDuplicates}
        />
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
  );
};
