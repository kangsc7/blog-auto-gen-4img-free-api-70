
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
  
  const { geminiManager, pixabayManager, huggingFaceManager } = useAllApiKeysManager({
    appState,
    saveAppState
  });
  
  const [preventDuplicates, setPreventDuplicates] = useState(appState.preventDuplicates || false);
  const { hasAccess } = useUserAccess();

  const { isGeneratingTopics, generateTopics } = useTopicGenerator({ appState, saveAppState });
  
  const pixabayClipboard = usePixabayClipboard();

  const { isGeneratingContent, generateArticle, stopArticleGeneration } = useArticleGenerator(
    appState, 
    saveAppState,
    pixabayClipboard.addImageForClipboard
  );
  
  const { isGeneratingImage: isGeneratingPrompt, createImagePrompt: generateImagePrompt, isDirectlyGenerating, generateDirectImage } = useImagePromptGenerator(
    appState, 
    saveAppState,
    huggingFaceManager?.huggingFaceApiKey || '',
    hasAccess || isAdmin
  );

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

  const [showTopicConfirmDialog, setShowTopicConfirmDialog] = useState(false);
  const [pendingTopic, setPendingTopic] = useState<string>('');

  const handleTopicSelectWithConfirm = (topic: string) => {
    console.log('주제 선택됨:', topic);
    setPendingTopic(topic);
    setShowTopicConfirmDialog(true);
  };

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

  const handleTopicCancel = () => {
    console.log('주제 선택 취소');
    setShowTopicConfirmDialog(false);
    setPendingTopic('');
  };

  const convertToMarkdown = () => {
    const markdown = `# ${appState.selectedTopic}\n\n${appState.generatedContent}`;
    copyToClipboard(markdown, "마크다운");
  };

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

  const handlePreventDuplicatesToggle = () => {
    const newValue = !preventDuplicates;
    console.log('중복금지 설정 변경:', { 이전값: preventDuplicates, 새값: newValue });
    setPreventDuplicates(newValue);
    saveAppState({ preventDuplicates: newValue });
  };

  // 초기화 함수에 편집기 콘텐츠 삭제 기능 추가 - 완전 삭제 보장
  const handleResetAppWithEditor = () => {
    console.log('🔄 앱 및 편집기 전체 초기화 - 완전 삭제');
    
    // localStorage에서 편집기 관련 데이터 완전 삭제
    try {
      localStorage.removeItem('blog_editor_content');
      localStorage.removeItem('blog_generated_content');
      console.log('✅ 편집기 콘텐츠 localStorage 완전 삭제 완료');
    } catch (error) {
      console.error('편집기 콘텐츠 삭제 실패:', error);
    }
    
    // 앱 상태에서 콘텐츠 완전 제거
    saveAppState({ 
      generatedContent: '',
      selectedTopic: '',
      topics: [],
      keyword: ''
    });
    
    // 기본 앱 초기화 실행
    handleResetApp();
    
    // DOM에서도 편집기 내용 강제 삭제
    setTimeout(() => {
      const editorElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
      if (editorElement) {
        editorElement.innerHTML = '';
        console.log('✅ 편집기 DOM 내용 강제 삭제 완료');
      }
    }, 100);
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
    handleResetApp: handleResetAppWithEditor, // 개선된 초기화 함수 사용
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
