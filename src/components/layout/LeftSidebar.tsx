
import React from 'react';
import { TopicGenerator } from '@/components/control/TopicGenerator';
import { ArticleGenerator } from '@/components/control/ArticleGenerator';
import { ImageCreation } from '@/components/control/ImageCreation';
import { ImagePaster } from '@/components/control/ImagePaster';
import { AdsenseManager } from '@/components/control/AdsenseManager';
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
        generateTopics: (keyword?: string) => Promise<string[] | null>;
        generateArticle: (topic?: string) => Promise<string>;
        createImagePrompt: () => Promise<void>;
        generateDirectImage: () => Promise<void>;
    };
    topicControls: {
        manualTopic: string;
        setManualTopic: (topic: string) => void;
        handleManualTopicAdd: () => void;
        selectTopic: (topic: string) => void;
    };
    utilityFunctions: {
        copyToClipboard: (text: string, type?: string) => void;
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
            />

            <div className="sticky top-6 space-y-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-lg pr-2">
              <ImageCreation
                  appState={appState}
                  isGeneratingImage={generationStatus.isGeneratingImage}
                  isDirectlyGenerating={generationStatus.isDirectlyGenerating}
                  createImagePrompt={async (text: string) => {
                    await generationFunctions.createImagePrompt();
                    return true;
                  }}
                  generateDirectImage={async () => {
                    await generationFunctions.generateDirectImage();
                    return '';
                  }}
                  copyToClipboard={(text: string, type?: string) => utilityFunctions.copyToClipboard(text, type)}
                  openWhisk={utilityFunctions.openWhisk}
              />

              <ImagePaster />
              
              <AdsenseManager 
                  appState={appState}
                  saveAppState={saveAppState}
              />
            </div>
        </div>
    );
};
