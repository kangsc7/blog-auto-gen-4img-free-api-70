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
  const { session, profile, authLoading, handleLogin, handleSignUp, handleLogout, isAdmin } = useAuth();
  const { appState, saveAppState, handleResetApp } = useAppStateManager();
  const { geminiManager, pixabayManager, huggingFaceManager } = useAllApiKeysManager();
  const [preventDuplicates, setPreventDuplicates] = useState(appState.preventDuplicates || false);
  const { hasAccess } = useUserAccess();

  const { isGeneratingTopics, generateTopics } = useTopicGenerator(appState, saveAppState);
  const { isGeneratingContent, generateArticle, stopArticleGeneration } = useArticleGenerator(appState, saveAppState);
  const { isGeneratingPrompt, generateImagePrompt } = useImagePromptGenerator(appState, saveAppState);

  const topicControls = useTopicControls(appState, saveAppState);
  const { copyToClipboard, downloadAsHtml, shareContent, convertToMarkdown } = useAppUtils(appState);

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

  const handleTopicConfirm = (topic: string) => {
    topicControls.selectTopic(topic);
    setShowTopicSelectionDialog(false);
    
    setTimeout(() => {
      generateArticle({ topic, keyword: appState.keyword });
    }, 1000);
  };

  const generationStatus = {
    isGeneratingTopics,
    isGeneratingContent,
    isGeneratingPrompt,
    isOneClickGenerating,
  };

  const generationFunctions = {
    generateTopics: () => generateTopics(),
    generateArticle,
    generateImagePrompt,
    stopArticleGeneration,
  };

  const utilityFunctions = {
    copyToClipboard,
    downloadAsHtml,
    shareContent,
    convertToMarkdown,
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
  };
};
