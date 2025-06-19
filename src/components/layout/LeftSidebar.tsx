
import React, { useState, useEffect } from 'react';
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
  const [isSticky, setIsSticky] = useState(false);
  const [isHuggingFaceExpanded, setIsHuggingFaceExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const shouldBeSticky = scrollPosition > 1000;
      setIsSticky(shouldBeSticky);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHuggingFaceDoubleClick = () => {
    setIsHuggingFaceExpanded(!isHuggingFaceExpanded);
  };

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
        selectTopic={topicControls.selectTopic}
        isGeneratingContent={generationStatus.isGeneratingContent}
        generateArticleContent={generationFunctions.generateArticle}
        stopArticleGeneration={generationFunctions.stopArticleGeneration}
      />

      <EvergreenKeywordCounter />

      {/* 이미지 생성 창들 - 원래 위치에서 늦은 스크롤시 따라다니기 */}
      <div className={`space-y-4 transition-all duration-500 ${
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

        {/* Hugging Face 이미지 생성기 - 더블클릭으로 접기/펼치기 */}
        <div 
          onDoubleClick={handleHuggingFaceDoubleClick}
          className={`cursor-pointer transition-all duration-300 ${
            isHuggingFaceExpanded ? 'opacity-100' : 'opacity-70'
          }`}
        >
          <div className={`transition-all duration-300 overflow-hidden ${
            isHuggingFaceExpanded ? 'max-h-96' : 'max-h-16'
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
