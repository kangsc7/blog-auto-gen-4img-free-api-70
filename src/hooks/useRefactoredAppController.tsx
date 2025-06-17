
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAppStateManager } from '@/hooks/useAppStateManager';
import { useAuth } from '@/hooks/useAuth';
import { useAllApiKeysManager } from '@/hooks/useAllApiKeysManager';
import { useOneClick } from '@/hooks/useOneClick';
import { useTopicGenerator } from '@/hooks/useTopicGenerator';
import { useArticleGenerator } from '@/hooks/useArticleGenerator';
import { useImagePromptGenerator } from '@/hooks/useImagePromptGenerator';
import { useTopicControls } from '@/hooks/useTopicControls';
import { useAppUtils } from '@/hooks/useAppUtils';
import { useUserAccess } from '@/hooks/useUserAccess';

export const useRefactoredAppController = () => {
  const { toast } = useToast();
  const { appState, saveAppState, deleteApiKeyFromStorage, resetApp, preventDuplicates, setPreventDuplicates } = useAppStateManager();
  const { session, profile, loading: authLoading, handleLogin, handleSignUp, handleLogout, isAdmin } = useAuth();
  const { hasAccess } = useUserAccess();
  const { geminiManager, pixabayManager, huggingFaceManager } = useAllApiKeysManager({ appState, saveAppState });
  
  // 접근 권한이 없으면 기능을 비활성화
  const canUseFeatures = hasAccess || isAdmin;
  
  const { isGeneratingTopics, generateTopics } = useTopicGenerator(appState, saveAppState);
  const { isGeneratingContent, generateArticle } = useArticleGenerator(appState, saveAppState);
  const { isGeneratingPrompt, generateImagePrompt, generateImage } = useImagePromptGenerator(
    appState,
    saveAppState
  );
  
  const {
    manualTopic,
    setManualTopic,
    selectTopic,
    handleManualTopicAdd,
  } = useTopicControls({ 
    appState, 
    saveAppState, 
    preventDuplicates: appState.preventDuplicates,
    canUseFeatures 
  });

  const {
    copyToClipboard,
    openWhisk,
    downloadHTML,
  } = useAppUtils({ appState });

  const handleResetApp = () => {
    if (!canUseFeatures) {
      toast({
        title: "접근 제한",
        description: "이 기능을 사용할 권한이 없습니다.",
        variant: "destructive"
      });
      return;
    }
    resetApp();
    setManualTopic('');
  };

  useEffect(() => {
    if (!appState.preventDuplicates) {
      console.log('중복 허용 모드 활성화 - 모든 중복 제한 해제');
    }
  }, [appState.preventDuplicates]);

  useEffect(() => {
    if (session?.user?.email) {
      saveAppState({ isLoggedIn: true, currentUser: session.user.email });
    } else {
      saveAppState({ isLoggedIn: false, currentUser: '' });
    }
  }, [session?.user?.email, saveAppState]);

  const generateArticleWithPixabay = (options?: { topic?: string; keyword?: string }): Promise<string> => {
    if (!canUseFeatures) {
      toast({
        title: "접근 제한",
        description: "이 기능을 사용할 권한이 없습니다.",
        variant: "destructive"
      });
      return Promise.resolve('');
    }
    
    return generateArticle({
      ...options,
      pixabayConfig: { 
        key: pixabayManager.pixabayApiKey, 
        validated: pixabayManager.isPixabayApiKeyValidated 
      },
    });
  };
  
  const { isOneClickGenerating, handleLatestIssueOneClick, handleEvergreenKeywordOneClick, handleStopOneClick } = useOneClick(
    appState,
    saveAppState,
    generateTopics,
    selectTopic,
    generateArticleWithPixabay,
    profile,
    preventDuplicates,
    canUseFeatures
  );

  const generationStatus = { isGeneratingTopics, isGeneratingContent, isGeneratingImage: isGeneratingPrompt, isDirectlyGenerating: isGeneratingPrompt };

  const generateArticleForManual = (topic?: string): Promise<string> => {
    return generateArticleWithPixabay({ topic: topic || appState.selectedTopic, keyword: appState.keyword });
  };

  const generationFunctions = { generateTopics, generateArticle: generateArticleForManual, createImagePrompt: generateImagePrompt, generateDirectImage: generateImage };
  const topicControls = { manualTopic, setManualTopic, handleManualTopicAdd, selectTopic };
  const utilityFunctions = { copyToClipboard, openWhisk, downloadHTML };

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
    deleteApiKeyFromStorage,
    preventDuplicates: appState.preventDuplicates,
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
    canUseFeatures,
  };
};
