
import React from 'react';
import { TopicList } from '@/components/display/TopicList';
import { ArticlePreview } from '@/components/display/ArticlePreview';
import { SeoAnalyzer } from '@/components/display/SeoAnalyzer';
import { ContentActions } from '@/components/control/ContentActions';
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
    isGeneratingContent,
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

            {appState.generatedContent && (
                <ContentActions
                    generatedContent={appState.generatedContent}
                    copyToClipboard={copyToClipboard}
                    downloadHTML={downloadHTML}
                />
            )}

            {appState.generatedContent && (
                <SeoAnalyzer 
                    generatedContent={appState.generatedContent}
                    keyword={appState.keyword}
                    selectedTopic={appState.selectedTopic}
                />
            )}
        </div>
    );
};
