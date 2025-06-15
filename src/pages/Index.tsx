
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { LoginForm } from '@/components/auth/LoginForm';
import { AppHeader } from '@/components/layout/AppHeader';
import { ApiKeysSection } from '@/components/sections/ApiKeysSection';
import { OneClickSection } from '@/components/sections/OneClickSection';
import { MainContentSection } from '@/components/sections/MainContentSection';
import { ScrollToTopButton } from '@/components/layout/ScrollToTopButton';

import { useAppStateManager } from '@/hooks/useAppStateManager';
import { useAuth } from '@/hooks/useAuth';
import { useApiKeyManager } from '@/hooks/useApiKeyManager';
import { useOneClick } from '@/hooks/useOneClick';
import { usePixabayManager } from '@/hooks/usePixabayManager';
import { useTopicGenerator } from '@/hooks/useTopicGenerator';
import { useArticleGenerator } from '@/hooks/useArticleGenerator';
import { useImagePromptGenerator } from '@/hooks/useImagePromptGenerator';
import { useAppHandlers } from '@/hooks/useAppHandlers';

const Index = () => {
  const { toast } = useToast();
  const { appState, saveAppState, saveApiKeyToStorage, deleteApiKeyFromStorage, resetApp } = useAppStateManager();
  const { loginData, setLoginData, handleLogin, handleLogout } = useAuth(saveAppState);
  const { isValidatingApi, validateApiKey } = useApiKeyManager(appState, saveAppState);
  const pixabayManager = usePixabayManager();
  const { isGeneratingTopics, generateTopics } = useTopicGenerator(appState, saveAppState);
  const { isGeneratingContent, generateArticle } = useArticleGenerator(appState, saveAppState);
  const { isGeneratingImage, createImagePrompt } = useImagePromptGenerator(appState, saveAppState);
  
  const {
    manualTopic,
    setManualTopic,
    selectTopic,
    handleManualTopicAdd,
    handleResetApp,
    copyToClipboard,
    openWhisk,
    downloadHTML,
  } = useAppHandlers({ appState, saveAppState, resetApp });

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
    generateArticleWithPixabay
  );
  
  if (!appState.isLoggedIn) {
    return <LoginForm loginData={loginData} setLoginData={setLoginData} handleLogin={handleLogin} />;
  }
  
  const generationStatus = { isGeneratingTopics, isGeneratingContent, isGeneratingImage };
  const generationFunctions = { generateTopics, generateArticle: generateArticleWithPixabay, createImagePrompt };
  const topicControls = { manualTopic, setManualTopic, handleManualTopicAdd, selectTopic };
  const utilityFunctions = { copyToClipboard, openWhisk, downloadHTML };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <AppHeader
        currentUser={appState.currentUser}
        resetApp={handleResetApp}
        handleLogout={handleLogout}
      />
      
      <ApiKeysSection
        appState={appState}
        saveAppState={saveAppState}
        isValidatingApi={isValidatingApi}
        validateApiKey={validateApiKey}
        saveApiKeyToStorage={saveApiKeyToStorage}
        deleteApiKeyFromStorage={deleteApiKeyFromStorage}
        pixabayManager={pixabayManager}
      />

      <OneClickSection
        handleLatestIssueOneClick={handleLatestIssueOneClick}
        handleEvergreenKeywordOneClick={handleEvergreenKeywordOneClick}
        isOneClickGenerating={isOneClickGenerating}
        handleStopOneClick={handleStopOneClick}
        appState={appState}
      />
      
      <MainContentSection
        appState={appState}
        saveAppState={saveAppState}
        generationStatus={generationStatus}
        generationFunctions={generationFunctions}
        topicControls={topicControls}
        utilityFunctions={utilityFunctions}
      />
      <ScrollToTopButton />
    </div>
  );
};

export default Index;
