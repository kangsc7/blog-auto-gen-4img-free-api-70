
import React from 'react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { RightContent } from '@/components/layout/RightContent';
import { AppState } from '@/types';

interface MainContentSectionProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  isGeneratingTopics: boolean;
  generateTopics: (keywordOverride?: string) => Promise<string[] | null>;
  isGeneratingContent: boolean;
  generateArticle: (options?: { topic?: string; keyword?: string }) => Promise<string | null>;
  isGeneratingImage: boolean;
  createImagePrompt: (inputText: string) => Promise<boolean>;
  isDirectlyGenerating: boolean;
  generateDirectImage: () => Promise<string>;
  stopArticleGeneration: () => void;
  manualTopic: string;
  setManualTopic: React.Dispatch<React.SetStateAction<string>>;
  handleManualTopicAdd: () => void;
  selectTopic: (topic: string) => void;
  copyToClipboard: (text: string, type: string) => void;
  downloadHTML: () => void;
  preventDuplicates: boolean;
  handleTopicConfirm?: (topic: string) => void;
  deleteReferenceData?: () => void;
}

export const MainContentSection: React.FC<MainContentSectionProps> = ({
  appState,
  saveAppState,
  isGeneratingTopics,
  generateTopics,
  isGeneratingContent,
  generateArticle,
  isGeneratingImage,
  createImagePrompt,
  isDirectlyGenerating,
  generateDirectImage,
  stopArticleGeneration,
  manualTopic,
  setManualTopic,
  handleManualTopicAdd,
  selectTopic,
  copyToClipboard,
  downloadHTML,
  preventDuplicates,
  handleTopicConfirm,
  deleteReferenceData,
}) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <LeftSidebar
            appState={appState}
            saveAppState={saveAppState}
            isGeneratingTopics={isGeneratingTopics}
            generateTopics={generateTopics}
            isGeneratingContent={isGeneratingContent}
            generateArticle={generateArticle}
            stopArticleGeneration={stopArticleGeneration}
            isGeneratingImage={isGeneratingImage}
            createImagePrompt={createImagePrompt}
            isDirectlyGenerating={isDirectlyGenerating}
            generateDirectImage={generateDirectImage}
            manualTopic={manualTopic}
            setManualTopic={setManualTopic}
            handleManualTopicAdd={handleManualTopicAdd}
            preventDuplicates={preventDuplicates}
            selectTopic={selectTopic}
            deleteReferenceData={deleteReferenceData}
          />
        </div>
        <div className="lg:col-span-8">
          <RightContent
            appState={appState}
            saveAppState={saveAppState}
            selectTopic={selectTopic}
            copyToClipboard={copyToClipboard}
            downloadHTML={downloadHTML}
            isGeneratingContent={isGeneratingContent}
            onTopicConfirm={handleTopicConfirm}
          />
        </div>
      </div>
    </div>
  );
};
