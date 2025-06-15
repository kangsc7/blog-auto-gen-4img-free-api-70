
import React from 'react';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from '@/components/layout/ProgressTracker';
import { Zap, RefreshCw } from 'lucide-react';
import { AppState } from '@/types';

interface OneClickSectionProps {
    handleLatestIssueOneClick: () => void;
    handleEvergreenKeywordOneClick: () => void;
    isOneClickGenerating: boolean;
    appState: AppState;
}

export const OneClickSection: React.FC<OneClickSectionProps> = ({
    handleLatestIssueOneClick,
    handleEvergreenKeywordOneClick,
    isOneClickGenerating,
    appState,
}) => {
    return (
        <div className="max-w-7xl mx-auto my-6">
            <div className="flex justify-between items-center gap-4 p-4 rounded-lg shadow bg-white">
                <Button 
                    onClick={handleLatestIssueOneClick} 
                    disabled={isOneClickGenerating || !appState.isApiKeyValidated} 
                    className="px-8 py-12 text-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all duration-300"
                >
                    <Zap className="mr-2 h-6 w-6" />
                    <span className="text-center">
                        최신 이슈
                        <br />
                        원클릭 생성
                    </span>
                </Button>
                
                <div className="flex-grow px-4">
                    <ProgressTracker
                        topics={appState.topics}
                        generatedContent={appState.generatedContent}
                        imagePrompt={appState.imagePrompt}
                    />
                </div>

                <Button 
                    onClick={handleEvergreenKeywordOneClick} 
                    disabled={isOneClickGenerating || !appState.isApiKeyValidated}
                    className="px-8 py-12 text-xl font-bold bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 transition-all duration-300"
                >
                    <RefreshCw className="mr-2 h-6 w-6" />
                    <span className="text-center">
                        평생 키워드
                        <br />
                        원클릭 생성
                    </span>
                </Button>
            </div>
        </div>
    );
};
