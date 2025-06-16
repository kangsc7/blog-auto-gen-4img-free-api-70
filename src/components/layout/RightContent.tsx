
import React from 'react';
import { TopicList } from '@/components/display/TopicList';
import { ArticlePreview } from '@/components/display/ArticlePreview';
import { SeoAnalyzer } from '@/components/display/SeoAnalyzer';
import { ContentActions } from '@/components/control/ContentActions';
import { AppState } from '@/types';

interface GenerationStatus {
    isGeneratingContent: boolean;
}

interface TopicControls {
    selectTopic: (topic: string) => void;
}

interface UtilityFunctions {
    copyToClipboard: (text: string, type: string) => void;
    downloadHTML: () => void;
}

interface RightContentProps {
    appState: AppState;
    generationStatus: GenerationStatus;
    topicControls: TopicControls;
    utilityFunctions: UtilityFunctions;
}

export const RightContent: React.FC<RightContentProps> = ({
    appState,
    generationStatus,
    topicControls,
    utilityFunctions,
}) => {
    return (
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
                <ContentActions
                    generatedContent={appState.generatedContent}
                    copyToClipboard={utilityFunctions.copyToClipboard}
                    downloadHTML={utilityFunctions.downloadHTML}
                />
            )}

            {appState.generatedContent && !generationStatus.isGeneratingContent && (
                <SeoAnalyzer 
                    generatedContent={appState.generatedContent}
                    keyword={appState.keyword}
                    selectedTopic={appState.selectedTopic}
                />
            )}
        </div>
    );
};
