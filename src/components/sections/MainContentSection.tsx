
import React from 'react';
import { TopicGenerator } from '@/components/control/TopicGenerator';
import { ArticleGenerator } from '@/components/control/ArticleGenerator';
import { StickyImageSidebar } from '@/components/layout/StickyImageSidebar';
import { ExternalReferenceInput } from '@/components/control/ExternalReferenceInput';
import { SimpleArticleEditor } from '@/components/display/SimpleArticleEditor';
import { AppState } from '@/types';

interface MainContentSectionProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  isGeneratingTopics: boolean;
  generateTopics: () => Promise<void>;
  isGeneratingContent: boolean;
  generateArticle: (options?: { topic?: string; keyword?: string }) => Promise<string | null>;
  stopArticleGeneration: () => void;
  selectTopic: (topic: string) => void;
  isGeneratingImage: boolean;
  isDirectlyGenerating: boolean;
  createImagePrompt: (text: string) => Promise<boolean>;
  generateDirectImage: () => Promise<string | null>;
  copyToClipboard: (text: string, type: string) => void;
  openWhisk: () => void;
  huggingFaceApiKey: string;
  hasAccess: boolean;
}

export const MainContentSection: React.FC<MainContentSectionProps> = ({
  appState,
  saveAppState,
  isGeneratingTopics,
  generateTopics,
  isGeneratingContent,
  generateArticle,
  stopArticleGeneration,
  selectTopic,
  isGeneratingImage,
  isDirectlyGenerating,
  createImagePrompt,
  generateDirectImage,
  copyToClipboard,
  openWhisk,
  huggingFaceApiKey,
  hasAccess,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 메인 콘텐츠 (왼쪽 2/3) */}
      <div className="lg:col-span-2 space-y-6">
        <TopicGenerator
          appState={appState}
          saveAppState={saveAppState}
          isGeneratingTopics={isGeneratingTopics}
          generateTopics={generateTopics}
          selectTopic={selectTopic}
        />

        <ArticleGenerator
          appState={appState}
          saveAppState={saveAppState}
          selectTopic={selectTopic}
          isGeneratingContent={isGeneratingContent}
          generateArticleContent={generateArticle}
          stopArticleGeneration={stopArticleGeneration}
        />

        <ExternalReferenceInput
          appState={appState}
          saveAppState={saveAppState}
        />

        <SimpleArticleEditor
          generatedContent={appState.generatedContent}
          isGeneratingContent={isGeneratingContent}
          selectedTopic={appState.selectedTopic}
          onContentChange={(content) => saveAppState({ generatedContent: content })}
        />
      </div>

      {/* 이미지 도구 사이드바 (오른쪽 1/3, sticky 지원) */}
      <div className="lg:col-span-1">
        <StickyImageSidebar
          appState={appState}
          isGeneratingImage={isGeneratingImage}
          isDirectlyGenerating={isDirectlyGenerating}
          createImagePrompt={createImagePrompt}
          generateDirectImage={generateDirectImage}
          copyToClipboard={copyToClipboard}
          openWhisk={openWhisk}
          huggingFaceApiKey={huggingFaceApiKey}
          hasAccess={hasAccess}
        />
      </div>
    </div>
  );
};
