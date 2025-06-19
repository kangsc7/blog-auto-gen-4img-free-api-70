
import React, { useState, useEffect } from 'react';
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
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const shouldBeSticky = scrollPosition > 3700;
      setIsSticky(shouldBeSticky);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="space-y-6">
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

      {/* 이미지 생성 창들 - 스크롤시 따라다니기 (임계값: 3700) */}
      <div className={`space-y-4 transition-all duration-300 ${
        isSticky 
          ? 'fixed top-4 left-4 z-50 w-[380px] max-h-[calc(100vh-2rem)] overflow-y-auto bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-200 p-4' 
          : 'relative'
      }`}>
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
  );
};
