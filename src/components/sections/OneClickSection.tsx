
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
    // 원클릭 버튼들은 원클릭 생성 중이거나 글 작성 중일 때 비활성화
    const shouldDisableOneClickButtons = isOneClickGenerating || isGeneratingContent || !appState.isApiKeyValidated;
    
    // 중단 버튼은 원클릭 생성 중이거나 글 작성 중일 때 표시
    const shouldShowStopButton = isOneClickGenerating || isGeneratingContent;

    return (
        <div className="max-w-7xl mx-auto my-4 px-4">
            {/* 좌측 정렬된 원클릭 생성 박스 */}
            <div className="flex justify-start mb-4">
                <div className="flex items-center gap-4 p-6 rounded-xl shadow-lg bg-white border border-gray-200 max-w-4xl">
                    <Button 
                        onClick={handleLatestIssueOneClick} 
                        disabled={shouldDisableOneClickButtons} 
                        className="px-8 py-14 text-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 h-28 min-w-[200px] shadow-lg hover:shadow-xl"
                    >
                        <Zap className="mr-3 h-7 w-7" />
                        <span className="text-center leading-tight">
                            최신 이슈
                            <br />
                            원클릭 생성
                        </span>
                    </Button>
                    
                    <div className="flex-grow px-4 max-w-2xl">
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

                    <Button 
                        onClick={handleEvergreenKeywordOneClick} 
                        disabled={shouldDisableOneClickButtons}
                        className="px-8 py-14 text-xl font-bold bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 transition-all duration-300 h-28 min-w-[200px] shadow-lg hover:shadow-xl"
                    >
                        <RefreshCw className="mr-3 h-7 w-7" />
                        <span className="text-center leading-tight">
                            평생 키워드
                            <br />
                            원클릭 생성
                        </span>
                    </Button>
                </div>
            </div>

            {/* 중복금지/허용 및 초기화 버튼 섹션 */}
            <div className="flex justify-start mb-4">
                <div className="flex items-center gap-4">
                    {/* 중복 방지/허용 토글 버튼 - 평생 키워드 버튼과 동일한 크기 */}
                    {onPreventDuplicatesToggle && (
                        <Button
                            onClick={onPreventDuplicatesToggle}
                            variant={preventDuplicates ? "default" : "outline"}
                            className={`px-8 py-14 text-xl font-bold transition-all duration-300 h-28 min-w-[200px] shadow-lg hover:shadow-xl ${
                                preventDuplicates 
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                                    : "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                            }`}
                        >
                            <span className="text-center leading-tight">
                                {preventDuplicates ? "중복금지" : "중복허용"}
                            </span>
                        </Button>
                    )}

                    {/* 초기화 버튼 - 평생 키워드 버튼과 동일한 크기 */}
                    {onResetApp && (
                        <Button
                            onClick={onResetApp}
                            variant="outline"
                            className="px-8 py-14 text-xl font-bold border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white h-28 min-w-[200px] shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <RefreshCw className="mr-3 h-7 w-7" />
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
