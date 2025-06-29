
import React from 'react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { RightContent } from '@/components/layout/RightContent';
import { AppState } from '@/types';

interface GenerationStatus {
    isGeneratingTopics: boolean;
    isGeneratingContent: boolean;
    isGeneratingImage: boolean;
    isDirectlyGenerating: boolean;
}

interface GenerationFunctions {
    generateTopics: () => Promise<string[] | null>;
    generateArticle: (topic?: string) => Promise<string>;
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

interface MainContentSectionProps {
    appState: AppState;
    saveAppState: (newState: Partial<AppState>) => void;
    generationStatus: GenerationStatus;
    generationFunctions: GenerationFunctions;
    topicControls: TopicControls;
    utilityFunctions: UtilityFunctions;
    preventDuplicates?: boolean;
}

export const MainContentSection: React.FC<MainContentSectionProps> = ({
    appState,
    saveAppState,
    generationStatus,
    generationFunctions,
    topicControls,
    utilityFunctions,
    preventDuplicates = false,
}) => {
    return (
        <div className="container mx-auto mt-4 px-2 sm:px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-4 md:gap-6">
                <LeftSidebar
                    appState={appState}
                    saveAppState={saveAppState}
                    generationStatus={generationStatus}
                    generationFunctions={generationFunctions}
                    topicControls={topicControls}
                    utilityFunctions={utilityFunctions}
                    preventDuplicates={appState.preventDuplicates}
                />
                
                <RightContent 
                    appState={appState}
                    saveAppState={saveAppState}
                    selectTopic={topicControls.selectTopic}
                    copyToClipboard={utilityFunctions.copyToClipboard}
                    downloadHTML={utilityFunctions.downloadHTML}
                    isGeneratingContent={generationStatus.isGeneratingContent}
                />
            </div>
        </div>
    );
};

