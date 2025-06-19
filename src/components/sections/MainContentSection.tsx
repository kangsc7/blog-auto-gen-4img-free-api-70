
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
      {/* 개선된 레이아웃 - 고정 비율과 안정적인 플렉스 시스템 */}
      <div className="flex flex-col lg:flex-row gap-8 min-h-screen w-full">
        
        {/* 왼쪽 사이드바 - 고정 너비와 최적화된 스크롤 */}
        <div className="lg:w-[400px] xl:w-[450px] 2xl:w-[500px] flex-shrink-0">
          <div className="h-full max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
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

        {/* 오른쪽 콘텐츠 영역 - 남은 공간 활용 */}
        <div className="flex-1 min-w-0">
          <div className="h-full w-full">
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
    </div>
  );
};
