
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
    generateTopics: (keyword?: string) => Promise<string[] | null>;
    generateArticle: (topic?: string) => Promise<string>;
    createImagePrompt: () => Promise<void>;
    generateDirectImage: () => Promise<void>;
  };
  topicControls: {
    manualTopic: string;
    setManualTopic: (topic: string) => void;
    handleManualTopicAdd: () => void;
    selectTopic: (topic: string) => void;
  };
  utilityFunctions: {
    copyToClipboard: (text: string, type?: string) => void;
    openWhisk: () => void;
    downloadHTML: () => void;
  };
  preventDuplicates: boolean;
}

export const MainContentSection: React.FC<MainContentSectionProps> = ({
  appState,
  saveAppState,
  generationStatus,
  generationFunctions,
  topicControls,
  utilityFunctions,
  preventDuplicates,
}) => {
  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-4">
          <LeftSidebar
            appState={appState}
            saveAppState={saveAppState}
            generationStatus={generationStatus}
            generationFunctions={generationFunctions}
            topicControls={topicControls}
            utilityFunctions={utilityFunctions}
            preventDuplicates={preventDuplicates}
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
          />
        </div>
      </div>
    </div>
  );
};
