
import React from 'react';
import { TopicGenerator } from '@/components/control/TopicGenerator';
import { ArticleGenerator } from '@/components/control/ArticleGenerator';
import { ImageCreation } from '@/components/control/ImageCreation';
import { ImagePaster } from '@/components/control/ImagePaster';
import { AppState } from '@/types';

interface GenerationStatus {
    isGeneratingTopics: boolean;
    isGeneratingContent: boolean;
    isGeneratingImage: boolean;
    isDirectlyGenerating: boolean;
}

interface GenerationFunctions {
    generateTopics: () => Promise<string[] | null>;
    generateArticle: (topic?: string) => Promise<string | null>;
    createImagePrompt: (text: string) => Promise<boolean>;
    generateDirectImage: () => Promise<string | null>;
}

interface TopicControls {
    manualTopic: string;
    setManualTopic: (topic: string) => void;
    handleManualTopicAdd: () => void;
    selectTopic: (topic: string) => void;
}

interface UtilityFunctions {
    copyToClipboard: (text: string, type: string) => void;
    openWhisk: () => void;
    downloadHTML: () => void;
}

interface LeftSidebarProps {
    appState: AppState;
    saveAppState: (newState: Partial<AppState>) => void;
    generationStatus: GenerationStatus;
    generationFunctions: GenerationFunctions;
    topicControls: TopicControls;
    utilityFunctions: UtilityFunctions;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
    appState,
    saveAppState,
    generationStatus,
    generationFunctions,
    topicControls,
    utilityFunctions,
}) => {
    return (
        <div className="lg:col-span-4 space-y-6">
            <TopicGenerator
                appState={appState}
                saveAppState={saveAppState}
                isGeneratingTopics={generationStatus.isGeneratingTopics}
                generateTopicsFromKeyword={generationFunctions.generateTopics}
                manualTopic={topicControls.manualTopic}
                setManualTopic={topicControls.setManualTopic}
                handleManualTopicAdd={topicControls.handleManualTopicAdd}
            />

            <ArticleGenerator
                appState={appState}
                saveAppState={saveAppState}
                selectTopic={topicControls.selectTopic}
                isGeneratingContent={generationStatus.isGeneratingContent}
                generateArticleContent={generationFunctions.generateArticle}
            />

            <div className="sticky top-6 space-y-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-lg pr-2">
              <ImageCreation
                  appState={appState}
                  isGeneratingImage={generationStatus.isGeneratingImage}
                  isDirectlyGenerating={generationStatus.isDirectlyGenerating}
                  createImagePrompt={generationFunctions.createImagePrompt}
                  generateDirectImage={generationFunctions.generateDirectImage}
                  copyToClipboard={utilityFunctions.copyToClipboard}
                  openWhisk={utilityFunctions.openWhisk}
              />

              <ImagePaster />
            </div>
        </div>
    );
};
