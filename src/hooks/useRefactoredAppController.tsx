
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
import { usePixabayClipboard } from '@/hooks/usePixabayClipboard';

export const useRefactoredAppController = () => {
  const { session, profile, loading: authLoading, handleLogin, handleSignUp, handleLogout, isAdmin } = useAuth();
  const { appState, saveAppState, resetApp: handleResetApp } = useAppStateManager();
  
  // useAllApiKeysManager에 올바른 매개변수 전달
  const { geminiManager, pixabayManager, huggingFaceManager } = useAllApiKeysManager(
    appState,
    saveAppState
  );
  
  const [preventDuplicates, setPreventDuplicates] = useState(appState.preventDuplicates || false);
  const { hasAccess } = useUserAccess();

  const { isGeneratingTopics, generateTopics } = useTopicGenerator({ appState, saveAppState });
  
  // 픽사베이 클립보드 훅
  const pixabayClipboard = usePixabayClipboard();

  // articleGenerator에 이미지 콜백 추가
  const { isGeneratingContent, generateArticle, stopArticleGeneration } = useArticleGenerator(
    appState, 
    saveAppState,
    pixabayClipboard.addImageForClipboard
  );
  
  const { isGeneratingImage: isGeneratingPrompt, createImagePrompt: generateImagePrompt, isDirectlyGenerating, generateDirectImage } = useImagePromptGenerator(appState, saveAppState, huggingFaceManager.huggingFaceApiKey, hasAccess || isAdmin);

  const topicControls = useTopicControls({ appState, saveAppState });
  const { copyToClipboard, downloadHTML, openWhisk } = useAppUtils({ appState });

  const {
    isOneClickGenerating,
    handleLatestIssueOneClick,
    handleEvergreenKeywordOneClick,
    handleStopOneClick,
    showTopicSelectionDialog,
    setShowTopicSelectionDialog,
    showDuplicateErrorDialog,
    setShowDuplicateErrorDialog,
    handleTopicSelect,
    handleTopicSelectionCancel,
    oneClickMode
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

  // 주제 확인 다이얼로그 상태
  const [showTopicConfirmDialog, setShowTopicConfirmDialog] = useState(false);
  const [pendingTopic, setPendingTopic] = useState<string>('');

  // 주제 선택 시 확인 다이얼로그 표시
  const handleTopicSelectWithConfirm = (topic: string) => {
    console.log('주제 선택됨:', topic);
    setPendingTopic(topic);
    setShowTopicConfirmDialog(true);
  };

  // 주제 확인 다이얼로그에서 "네, 작성하겠습니다" 클릭 시
  const handleTopicConfirm = () => {
    console.log('주제 확인 및 선택:', pendingTopic);
    
    if (!pendingTopic) {
      console.error('선택된 주제가 없습니다');
      return;
    }
    
    try {
      console.log('topicControls.selectTopic 호출:', pendingTopic);
      topicControls.selectTopic(pendingTopic);
      
      setShowTopicConfirmDialog(false);
      
      console.log('자동 글 생성 시작:', { topic: pendingTopic, keyword: appState.keyword });
      generateArticle({ topic: pendingTopic, keyword: appState.keyword });
      
      setPendingTopic('');
    } catch (error) {
      console.error('주제 확인 처리 중 오류:', error);
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

  // 통합된 중단 기능
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

  // 중복 방지 토글 핸들러
  const handlePreventDuplicatesToggle = () => {
    const newValue = !preventDuplicates;
    setPreventDuplicates(newValue);
    saveAppState({ preventDuplicates: newValue });
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
    handlePreventDuplicatesToggle,
    handleResetApp,
    isOneClickGenerating,
    handleLatestIssueOneClick,
    handleEvergreenKeywordOneClick,
    handleStopOneClick: handleUnifiedStop,
    generationStatus,
    generationFunctions,
    topicControls: {
      ...topicControls,
      selectTopic: handleTopicSelectWithConfirm,
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
    handleTopicSelect,
    oneClickMode,
    pixabayClipboard,
  };
};
