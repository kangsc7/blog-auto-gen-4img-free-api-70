
import React from 'react';
import { ProgressTracker } from '@/components/layout/ProgressTracker';
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
    copyToClipboard: (text: string) => void;
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
      <ProgressTracker
        topics={appState.topics}
        generatedContent={appState.generatedContent}
        imagePrompt={appState.imagePrompt}
        isGeneratingTopics={generationStatus.isGeneratingTopics}
        isGeneratingContent={generationStatus.isGeneratingContent}
        isGeneratingImage={generationStatus.isGeneratingImage || generationStatus.isDirectlyGenerating}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
          copyToClipboard={(text: string, type: string) => utilityFunctions.copyToClipboard(text)}
          downloadHTML={utilityFunctions.downloadHTML}
          isGeneratingContent={generationStatus.isGeneratingContent}
        />
      </div>
    </div>
  );
};
