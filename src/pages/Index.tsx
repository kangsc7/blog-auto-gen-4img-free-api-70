
import React, { useEffect } from 'react';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { MainContentSection } from '@/components/sections/MainContentSection';
import { TopicConfirmDialog } from '@/components/dialog/TopicConfirmDialog';
import { OneClickSection } from '@/components/sections/OneClickSection';
import { RefactoredApiKeysSection } from '@/components/sections/RefactoredApiKeysSection';
import { useRefactoredAppController } from '@/hooks/useRefactoredAppController';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const {
    appState,
    saveAppState,
    session,
    profile,
    authLoading,
    handleLogin,
    handleSignUp,
    handleLogout,
    isAdmin,
    geminiManager,
    pixabayManager,
    huggingFaceManager,
    preventDuplicates,
    setPreventDuplicates,
    handleResetApp,
    isOneClickGenerating,
    handleLatestIssueOneClick,
    handleEvergreenKeywordOneClick,
    handleStopOneClick,
    generationStatus,
    generationFunctions,
    topicControls,
    utilityFunctions,
    handleTopicConfirm,
    showTopicSelectionDialog,
    setShowTopicSelectionDialog,
    showDuplicateErrorDialog,
    setShowDuplicateErrorDialog,
    showTopicConfirmDialog,
    setShowTopicConfirmDialog,
    pendingTopic,
    handleTopicCancel,
  } = useRefactoredAppController();

  // 구독 확인 효과
  useEffect(() => {
    // 기본적으로 모든 기능 사용 가능하도록 설정
    console.log('앱 로드 완료');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <TopNavigation />

      {/* API 키 설정 섹션 */}
      <RefactoredApiKeysSection
        geminiManager={geminiManager}
        pixabayManager={pixabayManager}
        huggingFaceManager={huggingFaceManager}
      />

      {/* 원클릭 생성 섹션 */}
      <OneClickSection
        handleLatestIssueOneClick={handleLatestIssueOneClick}
        handleEvergreenKeywordOneClick={handleEvergreenKeywordOneClick}
        isOneClickGenerating={isOneClickGenerating}
        handleStopOneClick={handleStopOneClick}
        appState={appState}
        isGeneratingContent={generationStatus.isGeneratingContent}
      />

      <MainContentSection
        appState={appState}
        saveAppState={saveAppState}
        generationStatus={generationStatus}
        generationFunctions={generationFunctions}
        topicControls={topicControls}
        utilityFunctions={utilityFunctions}
        preventDuplicates={preventDuplicates}
        handleTopicConfirm={handleTopicConfirm}
      />

      {/* 주제 확인 다이얼로그 */}
      <TopicConfirmDialog
        isOpen={showTopicConfirmDialog}
        topic={pendingTopic}
        onConfirm={handleTopicConfirm}
        onCancel={handleTopicCancel}
      />
    </div>
  );
};

export default Index;
