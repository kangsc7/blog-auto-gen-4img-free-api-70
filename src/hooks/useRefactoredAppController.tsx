
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

export const useRefactoredAppController = () => {
  const { toast } = useToast();
  const { appState, saveAppState, deleteApiKeyFromStorage, resetApp, preventDuplicates, setPreventDuplicates } = useAppStateManager();
  const { session, profile, loading: authLoading, handleLogin, handleSignUp, handleLogout, isAdmin } = useAuth();
  const { geminiManager, pixabayManager, huggingFaceManager } = useAllApiKeysManager();
  const { isGeneratingTopics, generateTopics } = useTopicGenerator(appState, saveAppState, preventDuplicates);
  const { isGeneratingContent, generateArticle } = useArticleGenerator(appState, saveAppState);
  const { isGeneratingImage, createImagePrompt, isDirectlyGenerating, generateDirectImage } = useImagePromptGenerator(
    appState,
    saveAppState,
    huggingFaceManager.huggingFaceApiKey
  );
  
  const {
    manualTopic,
    setManualTopic,
    selectTopic,
    handleManualTopicAdd,
  } = useTopicControls({ appState, saveAppState, preventDuplicates });

  const {
    copyToClipboard,
    openWhisk,
    downloadHTML,
  } = useAppUtils({ appState });

  const handleResetApp = () => {
    resetApp();
    setManualTopic('');
  };

  useEffect(() => {
    if (!preventDuplicates) {
      console.log('중복 허용 모드 활성화 - 모든 중복 제한 해제');
    }
  }, [preventDuplicates]);

  useEffect(() => {
    if (session?.user?.email) {
      saveAppState({ isLoggedIn: true, currentUser: session.user.email });
    } else {
      saveAppState({ isLoggedIn: false, currentUser: '' });
    }
  }, [session?.user?.email, saveAppState]);

  const generateArticleWithPixabay = (options?: { topic?: string; keyword?: string }) => {
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
    preventDuplicates
  );

  const generationStatus = { isGeneratingTopics, isGeneratingContent, isGeneratingImage, isDirectlyGenerating };

  const generateArticleForManual = (topic?: string) => {
    return generateArticleWithPixabay({ topic: topic || appState.selectedTopic, keyword: appState.keyword });
  };

  const generationFunctions = { generateTopics, generateArticle: generateArticleForManual, createImagePrompt, generateDirectImage };
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
  };
};
