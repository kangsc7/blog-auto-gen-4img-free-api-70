
import React from 'react';
import { TopicGenerator } from '@/components/control/TopicGenerator';
import { ArticleGenerator } from '@/components/control/ArticleGenerator';
import { ImageCreation } from '@/components/control/ImageCreation';
import { ImagePaster } from '@/components/control/ImagePaster';
import { TopicList } from '@/components/display/TopicList';
import { ArticlePreview } from '@/components/display/ArticlePreview';
import { SeoAnalyzer } from '@/components/display/SeoAnalyzer';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
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
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex gap-2 justify-center mb-4">
                            <Button
                                onClick={() => utilityFunctions.copyToClipboard(appState.generatedContent, 'HTML')}
                                disabled={!appState.generatedContent}
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                                <Copy className="h-4 w-4 mr-1" />
                                HTML 복사
                            </Button>
                            <Button
                                onClick={() => utilityFunctions.downloadHTML()}
                                disabled={!appState.generatedContent}
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                                <Download className="h-4 w-4 mr-1" />
                                다운로드
                            </Button>
                        </div>
                    </div>
                )}

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
