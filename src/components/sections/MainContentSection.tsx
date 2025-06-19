
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
    <div className="w-full max-w-none px-4 py-6">
      {/* 완전히 안정적인 레이아웃 - 절대 크기와 고정 구조 */}
      <div className="w-full min-h-screen">
        <div 
          className="w-full flex gap-6"
          style={{
            minHeight: 'calc(100vh - 12rem)',
            maxWidth: '100vw'
          }}
        >
          {/* 왼쪽 사이드바 - 절대 고정 크기 */}
          <div 
            className="flex-shrink-0 flex-grow-0"
            style={{ 
              width: '420px',
              minWidth: '420px',
              maxWidth: '420px'
            }}
          >
            <div className="h-full w-full">
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

          {/* 오른쪽 콘텐츠 영역 - 남은 공간 완전 활용 */}
          <div 
            className="flex-1 min-w-0"
            style={{
              minWidth: 'calc(100vw - 460px)', // 420px + 40px gap/padding
              width: 'calc(100vw - 460px)'
            }}
          >
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
    </div>
  );
};
