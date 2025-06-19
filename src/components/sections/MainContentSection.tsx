
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
  handleTopicConfirm?: (topic: string) => void;
  deleteReferenceData?: () => void;
}

export const MainContentSection: React.FC<MainContentSectionProps> = (props) => {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* 개선된 레이아웃 컨테이너 - 안정적인 그리드 시스템 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 min-h-screen">
        
        {/* 왼쪽 사이드바 - 고정 너비와 스크롤 */}
        <div className="xl:col-span-4 2xl:col-span-3">
          <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <LeftSidebar
              appState={props.appState}
              saveAppState={props.saveAppState}
              generationStatus={props.generationStatus}
              generationFunctions={props.generationFunctions}
              topicControls={props.topicControls}
              utilityFunctions={props.utilityFunctions}
              preventDuplicates={props.preventDuplicates}
              deleteReferenceData={props.deleteReferenceData}
            />
          </div>
        </div>

        {/* 오른쪽 콘텐츠 영역 - 유연한 너비 */}
        <div className="xl:col-span-8 2xl:col-span-9">
          <RightContent
            appState={props.appState}
            saveAppState={props.saveAppState}
            selectTopic={props.topicControls.selectTopic}
            copyToClipboard={props.utilityFunctions.copyToClipboard}
            downloadHTML={props.utilityFunctions.downloadHTML}
            isGeneratingContent={props.generationStatus.isGeneratingContent}
            onTopicConfirm={props.handleTopicConfirm}
          />
        </div>
      </div>
    </div>
  );
};
