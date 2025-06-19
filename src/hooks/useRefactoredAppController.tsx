
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStateManager } from '@/hooks/useAppStateManager';
import { useAllApiKeysManager } from '@/hooks/useAllApiKeysManager';
import { useTopicGenerator } from '@/hooks/useTopicGenerator';
import { useArticleGenerator } from '@/hooks/useArticleGenerator';
import { useImagePromptGenerator } from '@/hooks/useImagePromptGenerator';
import { useTopicControls } from '@/hooks/useTopicControls';
import { useAppUtils } from '@/hooks/useAppUtils';
import { useOneClick } from '@/hooks/useOneClick';
import { useUserAccess } from '@/hooks/useUserAccess';

export const useRefactoredAppController = () => {
  const { session, profile, loading: authLoading, handleLogin, handleSignUp, handleLogout, isAdmin } = useAuth();
  const { appState, saveAppState, resetApp: handleResetApp } = useAppStateManager();
  
  // useAllApiKeysManager 올바른 단일 파라미터 전달
  const { geminiManager, pixabayManager, huggingFaceManager } = useAllApiKeysManager({
    appState,
    saveAppState,
  });
  
  const [preventDuplicates, setPreventDuplicates] = useState(appState.preventDuplicates || false);
  const { hasAccess } = useUserAccess();

  const { isGeneratingTopics, generateTopics } = useTopicGenerator(appState, saveAppState);
  const { isGeneratingContent, generateArticle, stopArticleGeneration } = useArticleGenerator(appState, saveAppState);
  const { isGeneratingImage: isGeneratingPrompt, createImagePrompt: generateImagePrompt, isDirectlyGenerating, generateDirectImage } = useImagePromptGenerator(appState, saveAppState, huggingFaceManager.huggingFaceApiKey, hasAccess || isAdmin);

  // topicControls에 올바른 파라미터 전달 (appState, saveAppState)
  const topicControls = useTopicControls(appState, saveAppState);
  const { copyToClipboard, downloadHTML, openWhisk } = useAppUtils({ appState });

  const {
    isOneClickGenerating,
    handleLatestIssueOneClick,
    handleEvergreenKeywordOneClick,
    handleStopOneClick,
    showTopicSelectionDialog,
    setShowTopicSelectionDialog,
    showDuplicateErrorDialog,
    setShowDuplicateErrorDialog
  } = useOneClick(
    appState,
    saveAppState,
    generateTopics,
    topicControls.selectTopic,
    generateArticle,
    profile,
    preventDuplicates,
    hasAccess || isAdmin
  );

  // 주제 확인 다이얼로그 상태 - 단순화된 구현
  const [showTopicConfirmDialog, setShowTopicConfirmDialog] = useState(false);
  const [pendingTopic, setPendingTopic] = useState<string>('');

  // 주제 선택 시 확인 다이얼로그 표시
  const handleTopicSelect = (topic: string) => {
    console.log('주제 선택됨:', topic);
    setPendingTopic(topic);
    setShowTopicConfirmDialog(true);
  };

  // 주제 확인 다이얼로그에서 "네, 작성하겠습니다" 클릭 시
  const handleTopicConfirm = async () => {
    console.log('주제 확인 처리 시작:', pendingTopic);
    
    if (!pendingTopic) {
      console.log('처리할 주제가 없음 - 무시');
      return;
    }
    
    try {
      // 주제 선택
      topicControls.selectTopic(pendingTopic);
      
      // 약간 지연 후 글 생성 시작
      setTimeout(() => {
        console.log('자동 글 생성 시작:', { topic: pendingTopic, keyword: appState.keyword });
        generateArticle({ topic: pendingTopic, keyword: appState.keyword });
      }, 200);
      
      // 상태 초기화
      setPendingTopic('');
    } catch (error) {
      console.error('주제 확인 처리 오류:', error);
      throw error; // TopicConfirmDialog에서 처리하도록 다시 throw
    }
  };

  // 주제 확인 다이얼로그 취소
  const handleTopicCancel = () => {
    console.log('주제 선택 취소');
    setShowTopicConfirmDialog(false);
    setPendingTopic('');
  };

  const convertToMarkdown = () => {
    const markdown = `# ${appState.selectedTopic}\n\n${appState.generatedContent}`;
    copyToClipboard(markdown, "마크다운");
  };

  // 통합된 중단 기능 - 원클릭과 일반 글 생성 모두 중단
  const handleUnifiedStop = () => {
    console.log('통합 중단 버튼 클릭 - 상태:', { 
      isOneClickGenerating, 
      isGeneratingContent 
    });
    
    if (isOneClickGenerating) {
      handleStopOneClick();
    }
    
    if (isGeneratingContent) {
      stopArticleGeneration();
    }
  };

  // 초기화 함수 개선 - 편집기에 이벤트 발송
  const enhancedResetApp = () => {
    console.log('🔄 향상된 초기화 시작');
    
    // 편집기에 초기화 이벤트 발송
    window.dispatchEvent(new Event('app-reset'));
    
    // 기존 초기화 실행
    handleResetApp();
    
    console.log('✅ 향상된 초기화 완료');
  };

  const generationStatus = {
    isGeneratingTopics,
    isGeneratingContent,
    isGeneratingImage: isGeneratingPrompt,
    isDirectlyGenerating,
    isOneClickGenerating,
  };

  const generationFunctions = {
    generateTopics: () => generateTopics(),
    generateArticle,
    createImagePrompt: generateImagePrompt,
    generateDirectImage,
    stopArticleGeneration,
  };

  const utilityFunctions = {
    copyToClipboard,
    downloadHTML,
    openWhisk,
  };

  return {
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
    handleResetApp: enhancedResetApp, // 향상된 초기화 함수 사용
    isOneClickGenerating,
    handleLatestIssueOneClick,
    handleEvergreenKeywordOneClick,
    handleStopOneClick: handleUnifiedStop, // 통합된 중단 기능 사용
    generationStatus,
    generationFunctions,
    topicControls: {
      ...topicControls,
      selectTopic: handleTopicSelect, // 주제 선택 시 확인 다이얼로그 표시
    },
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
    convertToMarkdown,
  };
};
