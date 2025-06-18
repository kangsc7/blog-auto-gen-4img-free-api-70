
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
    isGeneratingContent?: boolean;
    preventDuplicates?: boolean;
    onPreventDuplicatesToggle?: () => void;
    onResetApp?: () => void;
}

export const OneClickSection: React.FC<OneClickSectionProps> = ({
    handleLatestIssueOneClick,
    handleEvergreenKeywordOneClick,
    isOneClickGenerating,
    handleStopOneClick,
    appState,
    isGeneratingContent = false,
    preventDuplicates,
    onPreventDuplicatesToggle,
    onResetApp,
}) => {
    const shouldDisableOneClickButtons = isOneClickGenerating || isGeneratingContent || !appState.isApiKeyValidated;
    const shouldShowStopButton = isOneClickGenerating || isGeneratingContent;

    console.log('OneClickSection 렌더링 - 중복금지 상태:', { 
        preventDuplicates, 
        appStatePreventDuplicates: appState.preventDuplicates 
    });

    return (
        <div className="max-w-7xl mx-auto my-4 px-4">
            {/* 전체 레이아웃: 왼쪽에 원클릭 생성, 중앙에 진행 상황, 오른쪽에 중복금지/초기화 */}
            <div className="flex items-center justify-between gap-8 p-6 rounded-xl shadow-lg bg-white border border-gray-200">
                
                {/* 왼쪽: 원클릭 생성 버튼들 */}
                <div className="flex items-center gap-6">
                    {/* 최신 이슈 원클릭 생성 */}
                    <Button 
                        onClick={handleLatestIssueOneClick} 
                        disabled={shouldDisableOneClickButtons} 
                        className="px-8 py-14 text-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 h-28 min-w-[200px] shadow-lg hover:shadow-xl"
                    >
                        <Zap className="mr-3 h-7 w-7" />
                        <span className="text-center leading-tight">
                            최신 이슈
                            <br />
                            키워드(적용)
                        </span>
                    </Button>

                    {/* 평생 키워드 원클릭 생성 */}
                    <Button 
                        onClick={handleEvergreenKeywordOneClick} 
                        disabled={shouldDisableOneClickButtons}
                        className="px-8 py-14 text-xl font-bold bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 transition-all duration-300 h-28 min-w-[200px] shadow-lg hover:shadow-xl"
                    >
                        <RefreshCw className="mr-3 h-7 w-7" />
                        <span className="text-center leading-tight">
                            평생 키워드
                            <br />
                            버튼(적용)
                        </span>
                    </Button>
                </div>
                
                {/* 중앙: 진행 상황 트래커 */}
                <div className="flex-grow px-6 max-w-2xl">
                    <ProgressTracker
                        topics={appState.topics}
                        generatedContent={appState.generatedContent}
                        imagePrompt={appState.imagePrompt}
                    />
                    {shouldShowStopButton && (
                         <Button 
                            variant="destructive" 
                            onClick={handleStopOneClick}
                            className="w-full mt-3 py-3 text-lg font-semibold bg-red-500 hover:bg-red-600"
                        >
                            <StopCircle className="mr-2 h-5 w-5" />
                            즉시 중단
                        </Button>
                    )}
                </div>

                {/* 오른쪽: 중복금지/초기화 버튼들 - 넓은 간격으로 가로 배치 */}
                <div className="flex items-center gap-8">
                    {onPreventDuplicatesToggle && (
                        <Button
                            onClick={() => {
                                console.log('중복금지 버튼 클릭 - 현재 상태:', preventDuplicates);
                                onPreventDuplicatesToggle();
                            }}
                            className={`px-8 py-14 text-lg font-bold transition-all duration-300 h-28 min-w-[140px] shadow-lg hover:shadow-xl ${
                                preventDuplicates 
                                    ? "bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-300" 
                                    : "bg-white hover:bg-red-50 text-red-600 border-2 border-red-300"
                            }`}
                        >
                            <span className="text-center leading-tight">
                                {preventDuplicates ? "중복금지" : "중복허용"}
                            </span>
                        </Button>
                    )}

                    {onResetApp && (
                        <Button
                            onClick={() => {
                                console.log('초기화 버튼 클릭');
                                onResetApp();
                            }}
                            className="px-8 py-14 text-lg font-bold bg-green-100 hover:bg-green-200 text-green-700 border-2 border-green-300 h-28 min-w-[140px] shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <RefreshCw className="mr-2 h-6 w-6" />
                            <span className="text-center leading-tight">
                                초기화
                            </span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
