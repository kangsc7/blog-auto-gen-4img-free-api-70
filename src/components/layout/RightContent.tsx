
import React from 'react';
import { TopicList } from '@/components/display/TopicList';
import { CleanArticleEditor } from '@/components/display/CleanArticleEditor';
import { SeoAnalyzer } from '@/components/display/SeoAnalyzer';
import { ContentActions } from '@/components/control/ContentActions';
import { AppState } from '@/types';

interface RightContentProps {
    appState: AppState;
    saveAppState: (newState: Partial<AppState>) => void;
    selectTopic: (topic: string) => void;
    copyToClipboard: (text: string, type: string) => void;
    downloadHTML: () => void;
    isGeneratingContent: boolean;
    onTopicConfirm?: (topic: string) => void;
}

export const RightContent: React.FC<RightContentProps> = ({
    appState,
    saveAppState,
    selectTopic,
    copyToClipboard,
    downloadHTML,
    isGeneratingContent,
    onTopicConfirm,
}) => {
    const handleContentChange = (content: string) => {
        saveAppState({ generatedContent: content });
    };

    return (
        <div className="lg:col-span-8 space-y-6">
            <TopicList
                topics={appState.topics}
                selectedTopic={appState.selectedTopic}
                selectTopic={selectTopic}
                onTopicConfirm={onTopicConfirm}
            />

            <CleanArticleEditor
                generatedContent={appState.generatedContent}
                isGeneratingContent={isGeneratingContent}
                selectedTopic={appState.selectedTopic}
                onContentChange={handleContentChange}
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
