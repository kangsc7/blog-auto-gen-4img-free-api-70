
import React from 'react';
import { ProgressTracker } from '@/components/layout/ProgressTracker';
import { TopicList } from '@/components/display/TopicList';
import { ArticlePreview } from '@/components/display/ArticlePreview';
import { SeoAnalyzer } from '@/components/display/SeoAnalyzer';
import { AppState } from '@/types';

interface RightContentProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  selectTopic: (topic: string) => void;
  copyToClipboard: (text: string, type?: string) => void;
  downloadHTML: () => void;
  isGeneratingContent: boolean;
}

export const RightContent: React.FC<RightContentProps> = ({
  appState,
  saveAppState,
  selectTopic,
  copyToClipboard,
  downloadHTML,
  isGeneratingContent
}) => {
  return (
    <div className="space-y-6">
      <TopicList
        topics={appState.topics}
        selectedTopic={appState.selectedTopic}
        selectTopic={selectTopic}
      />

      <ArticlePreview
        generatedContent={appState.generatedContent}
        isGeneratingContent={isGeneratingContent}
        selectedTopic={appState.selectedTopic}
      />

      <SeoAnalyzer
        generatedContent={appState.generatedContent}
        selectedTopic={appState.selectedTopic}
        keyword={appState.keyword}
      />
    </div>
  );
};
