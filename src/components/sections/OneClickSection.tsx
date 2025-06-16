
import React from 'react';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from '@/components/layout/ProgressTracker';
import { Zap, RefreshCw, StopCircle } from 'lucide-react';
import { AppState } from '@/types';

interface OneClickSectionProps {
    handleLatestIssueOneClick: () => void;
    handleEvergreenKeywordOneClick: () => void;
    isOneClickGenerating: boolean;
    handleStopOneClick: () => void;
    appState: AppState;
}

export const OneClickSection: React.FC<OneClickSectionProps> = ({
    handleLatestIssueOneClick,
    handleEvergreenKeywordOneClick,
    isOneClickGenerating,
    handleStopOneClick,
    appState,
}) => {
    return (
        <div className="max-w-7xl mx-auto my-6">
            <div className="flex justify-between items-center gap-4 p-4 rounded-lg shadow bg-white">
                <Button 
                    onClick={handleLatestIssueOneClick} 
                    disabled={isOneClickGenerating || !appState.isApiKeyValidated} 
                    className="px-8 py-16 text-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 h-32"
                >
                    <Zap className="mr-2 h-8 w-8" />
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
                    {isOneClickGenerating && (
                         <Button 
                            variant="destructive" 
                            onClick={handleStopOneClick}
                            className="w-full mt-2"
                        >
                            <StopCircle className="mr-2 h-4 w-4" />
                            즉시 중단
                        </Button>
                    )}
                </div>

                <Button 
                    onClick={handleEvergreenKeywordOneClick} 
                    disabled={isOneClickGenerating || !appState.isApiKeyValidated}
                    className="px-8 py-16 text-xl font-bold bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 transition-all duration-300 h-32"
                >
                    <RefreshCw className="mr-2 h-8 w-8" />
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
