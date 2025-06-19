
import React from 'react';
import { TopicGenerator } from '@/components/control/TopicGenerator';
import { ArticleGenerator } from '@/components/control/ArticleGenerator';
import { ImageCreation } from '@/components/control/ImageCreation';
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
    <div className="lg:col-span-5 space-y-6">
      {/* 주제 생성 */}
      <TopicGenerator
        appState={appState}
        saveAppState={saveAppState}
        isGeneratingTopics={generationStatus.isGeneratingTopics}
        generateTopics={() => generationFunctions.generateTopics()}
        selectTopic={topicControls.selectTopic}
      />

      {/* 블로그 글 생성 */}
      <ArticleGenerator
        appState={appState}
        saveAppState={saveAppState}
        selectTopic={topicControls.selectTopic}
        isGeneratingContent={generationStatus.isGeneratingContent}
        generateArticleContent={generationFunctions.generateArticle}
        stopArticleGeneration={generationFunctions.stopArticleGeneration}
      />

      {/* 이미지 생성 */}
      <ImageCreation
        appState={appState}
        isGeneratingImage={generationStatus.isGeneratingImage}
        isDirectlyGenerating={generationStatus.isDirectlyGenerating}
        createImagePrompt={generationFunctions.createImagePrompt}
        generateDirectImage={generationFunctions.generateDirectImage}
        copyToClipboard={utilityFunctions.copyToClipboard}
        openWhisk={utilityFunctions.openWhisk}
      />

      {/* 외부 링크 및 문장 참조 입력 */}
      <ExternalReferenceInput 
        appState={appState}
        saveAppState={saveAppState}
      />
    </div>
  );
};
