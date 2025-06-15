import React from 'react';
import { TopicGenerator } from '@/components/control/TopicGenerator';
import { ArticleGenerator } from '@/components/control/ArticleGenerator';
import { ImageCreation } from '@/components/control/ImageCreation';
import { ImagePaster } from '@/components/control/ImagePaster';
import { TopicList } from '@/components/display/TopicList';
import { ArticlePreview } from '@/components/display/ArticlePreview';
import { SeoAnalyzer } from '@/components/display/SeoAnalyzer';
import { AppState } from '@/types';

interface GenerationStatus {
    isGeneratingTopics: boolean;
    isGeneratingContent: boolean;
    isGeneratingImage: boolean;
}

interface GenerationFunctions {
    generateTopics: () => Promise<string[] | null>;
    generateArticle: (topic?: string) => Promise<string | null>;
    createImagePrompt: () => Promise<boolean>;
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

interface MainContentSectionProps {
    appState: AppState;
    saveAppState: (newState: Partial<AppState>) => void;
    generationStatus: GenerationStatus;
    generationFunctions: GenerationFunctions;
    topicControls: TopicControls;
    utilityFunctions: UtilityFunctions;
}


export const MainContentSection: React.FC<MainContentSectionProps> = ({
    appState,
    saveAppState,
    generationStatus,
    generationFunctions,
    topicControls,
    utilityFunctions,
}) => {
    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
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

                <ImageCreation
                    appState={appState}
                    saveAppState={saveAppState}
                    isGeneratingImage={generationStatus.isGeneratingImage}
                    createImagePromptFromTopic={generationFunctions.createImagePrompt}
                    copyToClipboard={utilityFunctions.copyToClipboard}
                    openWhisk={utilityFunctions.openWhisk}
                />

                <ImagePaster />
            </div>

            <div className="lg:col-span-8 space-y-6">
                <TopicList
                    topics={appState.topics}
                    selectedTopic={appState.selectedTopic}
                    selectTopic={topicControls.selectTopic}
                />

                <ArticlePreview
                    generatedContent={appState.generatedContent}
                    isGeneratingContent={generationStatus.isGeneratingContent}
                    selectedTopic={appState.selectedTopic}
                />

                {appState.generatedContent && !generationStatus.isGeneratingContent && (
                    <SeoAnalyzer 
                        generatedContent={appState.generatedContent}
                        keyword={appState.keyword}
                        selectedTopic={appState.selectedTopic}
                    />
                )}
            </div>
      </div>
    );
};
