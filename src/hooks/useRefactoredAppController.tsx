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

  // 편집기 내용 강제 초기화 함수 개선 - DOM 조작 및 이벤트 기반 초기화
  const handleResetAppWithEditor = () => {
    console.log('🔄 앱 및 편집기 전체 초기화 시작');
    
    // 1. localStorage 완전 삭제
    try {
      localStorage.removeItem('blog_editor_content');
      localStorage.removeItem('blog_generated_content');
      localStorage.removeItem('blog_editor_draft');
      console.log('✅ localStorage 편집기 데이터 완전 삭제');
    } catch (error) {
      console.error('localStorage 삭제 실패:', error);
    }
    
    // 2. 앱 상태 완전 초기화
    saveAppState({ 
      generatedContent: '',
      selectedTopic: '',
      topics: [],
      keyword: '',
      imagePrompt: '',
      referenceLink: '',
      referenceSentence: ''
    });
    
    // 3. 편집기 DOM 강제 초기화 (더 포괄적인 선택자와 이벤트 기반)
    const clearEditorContent = () => {
      const editorSelectors = [
        '[contenteditable="true"]',
        '.blog-editor',
        '.editor-content',
        '[data-editor="true"]',
        '.ql-editor',
        '.prose',
        '.ProseMirror',
        '[role="textbox"]',
        '.rich-text-editor',
        '.markdown-editor'
      ];
      
      editorSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            // 다양한 방법으로 초기화
            element.innerHTML = '';
            element.textContent = '';
            element.innerText = '';
            
            // 입력 이벤트 트리거하여 React 상태 동기화
            const inputEvent = new Event('input', { bubbles: true });
            element.dispatchEvent(inputEvent);
            
            // change 이벤트도 트리거
            const changeEvent = new Event('change', { bubbles: true });
            element.dispatchEvent(changeEvent);
            
            console.log(`✅ 편집기 요소 초기화: ${selector}`);
          }
        });
      });
      
      // iframe 내 편집기도 초기화
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            const iframeEditors = iframeDoc.querySelectorAll('[contenteditable="true"], .editor-content');
            iframeEditors.forEach(editor => {
              if (editor instanceof HTMLElement) {
                editor.innerHTML = '';
                editor.textContent = '';
              }
            });
          }
        } catch (error) {
          console.log('iframe 편집기 접근 불가:', error);
        }
      });
    };
    
    // 4. 다단계 초기화 실행
    clearEditorContent();
    
    setTimeout(() => {
      clearEditorContent();
      console.log('✅ 지연 편집기 초기화 완료');
    }, 100);
    
    setTimeout(() => {
      clearEditorContent();
      console.log('✅ 최종 편집기 초기화 완료');
    }, 500);
    
    // 5. 기본 앱 초기화 실행
    handleResetApp();
    
    console.log('🎉 전체 초기화 완료');
  };

  const generationStatus = {
    isGeneratingTopics,
    isGeneratingContent,
    isGeneratingImage: isGeneratingPrompt,
    isDirectlyGenerating,
    isOneClickGenerating,
  };

  const generationFunctions = {
    generateTopics,
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
    handleResetApp: handleResetAppWithEditor,
    isOneClickGenerating,
    handleLatestIssueOneClick,
    handleEvergreenKeywordOneClick,
    handleStopOneClick: handleUnifiedStop,
    generationStatus,
    generationFunctions,
    topicControls,
    utilityFunctions,
    showTopicSelectionDialog,
    setShowTopicSelectionDialog,
    showDuplicateErrorDialog,
    setShowDuplicateErrorDialog,
    oneClickMode,
    pixabayClipboard,
  };
};
