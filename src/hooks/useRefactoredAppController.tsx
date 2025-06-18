
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

  // 주제 확인 다이얼로그 상태 - 더 안정적인 관리
  const [showTopicConfirmDialog, setShowTopicConfirmDialog] = useState(false);
  const [pendingTopic, setPendingTopic] = useState<string>('');
  const [isProcessingConfirm, setIsProcessingConfirm] = useState(false);

  // 주제 선택 시 확인 다이얼로그 표시
  const handleTopicSelect = (topic: string) => {
    console.log('주제 선택됨:', topic);
    setPendingTopic(topic);
    setShowTopicConfirmDialog(true);
    setIsProcessingConfirm(false); // 초기화
  };

  // 주제 확인 다이얼로그에서 "네, 작성하겠습니다" 클릭 시 - 개선된 처리
  const handleTopicConfirm = () => {
    console.log('주제 확인 버튼 클릭:', { pendingTopic, isProcessingConfirm });
    
    // 이미 처리 중이거나 주제가 없으면 무시
    if (isProcessingConfirm || !pendingTopic) {
      console.log('처리 중이거나 주제 없음 - 무시');
      return;
    }
    
    // 처리 시작 플래그 설정
    setIsProcessingConfirm(true);
    
    try {
      console.log('주제 확인 처리 시작:', pendingTopic);
      
      // 1. 먼저 주제를 선택 (appState 업데이트)
      console.log('topicControls.selectTopic 호출:', pendingTopic);
      topicControls.selectTopic(pendingTopic);
      
      // 2. 다이얼로그 닫기 및 상태 초기화
      setShowTopicConfirmDialog(false);
      setPendingTopic('');
      
      // 3. 즉시 글 생성 시작 (약간의 딜레이 후)
      setTimeout(() => {
        console.log('자동 글 생성 시작:', { topic: pendingTopic, keyword: appState.keyword });
        generateArticle({ topic: pendingTopic, keyword: appState.keyword });
        setIsProcessingConfirm(false); // 처리 완료
      }, 100);
      
    } catch (error) {
      console.error('주제 확인 처리 중 오류:', error);
      setIsProcessingConfirm(false);
    }
  };

  // 주제 확인 다이얼로그 취소
  const handleTopicCancel = () => {
    console.log('주제 선택 취소');
    setShowTopicConfirmDialog(false);
    setPendingTopic('');
    setIsProcessingConfirm(false);
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
    handleResetApp,
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
    isProcessingConfirm, // 추가된 상태
  };
};
