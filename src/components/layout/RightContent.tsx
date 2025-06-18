
import React from 'react';
import { SimpleArticleEditor } from '@/components/display/SimpleArticleEditor';
import { TopicList } from '@/components/display/TopicList';
import { AppState } from '@/types';

interface RightContentProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  selectTopic: (topic: string) => void;
  copyToClipboard: (text: string, type: string) => void;
  downloadHTML: () => void;
  isGeneratingContent: boolean;
  onTopicConfirm?: (topic: string) => void;
  onOpenImageClipboard?: () => void;
  hasImages?: boolean;
}

export const RightContent: React.FC<RightContentProps> = ({
  appState,
  saveAppState,
  selectTopic,
  copyToClipboard,
  downloadHTML,
  isGeneratingContent,
  onTopicConfirm,
  onOpenImageClipboard,
  hasImages = false,
}) => {
  return (
    <div className="space-y-6">
      <TopicList
        topics={appState.topics}
        selectedTopic={appState.selectedTopic}
        selectTopic={selectTopic}
        copyToClipboard={copyToClipboard}
        onTopicConfirm={onTopicConfirm}
      />
      
      <SimpleArticleEditor
        generatedContent={appState.generatedContent}
        isGeneratingContent={isGeneratingContent}
        selectedTopic={appState.selectedTopic}
        onContentChange={(content) => saveAppState({ generatedContent: content })}
        onOpenImageClipboard={onOpenImageClipboard}
        hasImages={hasImages}
      />
    </div>
  );
};
