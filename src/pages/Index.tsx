import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthForm } from '@/components/auth/AuthForm';
import { AppHeader } from '@/components/layout/AppHeader';
import { ApiKeysSection } from '@/components/sections/ApiKeysSection';
import { OneClickSection } from '@/components/sections/OneClickSection';
import { MainContentSection } from '@/components/sections/MainContentSection';
import { ScrollToTopButton } from '@/components/layout/ScrollToTopButton';
import { Button } from '@/components/ui/button';

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
  const { session, profile, loading: authLoading, handleLogin, handleSignUp, handleLogout, isAdmin } = useAuth();
  const { isValidatingApi, validateApiKey } = useApiKeyManager(appState, saveAppState);
  const pixabayManager = usePixabayManager();
  const { isGeneratingTopics, generateTopics } = useTopicGenerator(appState, saveAppState);
  const { isGeneratingContent, generateArticle } = useArticleGenerator(appState, saveAppState);
  const { isGeneratingImage, createImagePrompt, isDirectlyGenerating, generateDirectImage } = useImagePromptGenerator(appState, saveAppState);
  
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

  const handleDeduplicateTopics = () => {
    if (appState.topics.length === 0) {
      toast({ title: "알림", description: "제거할 주제가 없습니다.", variant: "default" });
      return;
    }
    const uniqueTopics = Array.from(new Set(appState.topics));
    const removedCount = appState.topics.length - uniqueTopics.length;
    if (removedCount > 0) {
      saveAppState({ topics: uniqueTopics });
      toast({
        title: "중복 제거 완료",
        description: `${removedCount}개의 중복된 주제가 제거되었습니다.`
      });
    } else {
      toast({
        title: "중복 없음",
        description: "중복된 주제가 없습니다."
      });
    }
  };

  useEffect(() => {
    if (session) {
      saveAppState({ isLoggedIn: true, currentUser: session.user.email });
    } else {
      saveAppState({ isLoggedIn: false, currentUser: '' });
    }
  }, [session, saveAppState]);

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
    profile
  );
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!session) {
    return <AuthForm handleLogin={handleLogin} handleSignUp={handleSignUp} />;
  }
  
  const generationStatus = { isGeneratingTopics, isGeneratingContent, isGeneratingImage, isDirectlyGenerating };

  const generateArticleForManual = (topic?: string) => {
    return generateArticleWithPixabay({ topic: topic || appState.selectedTopic, keyword: appState.keyword });
  };

  const generationFunctions = { generateTopics, generateArticle: generateArticleForManual, createImagePrompt, generateDirectImage };
  const topicControls = { manualTopic, setManualTopic, handleManualTopicAdd, selectTopic };
  const utilityFunctions = { copyToClipboard, openWhisk, downloadHTML };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <AppHeader
        currentUser={profile?.email || appState.currentUser}
        resetApp={handleResetApp}
        handleLogout={handleLogout}
      />
      
      {isAdmin && (
        <div className="container mx-auto my-4 flex items-start gap-4">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 bg-white p-3 rounded-lg shadow-md hover:bg-gray-50 transition-colors border-2 border-red-500"
          >
            <Shield className="h-5 w-5 text-red-500" />
            <span className="font-semibold text-gray-800">사용자 관리 페이지</span>
          </Link>
          <div className="text-center">
            <Button
              onClick={handleDeduplicateTopics}
              disabled={appState.topics.length === 0}
              variant="outline"
              className="w-full inline-flex items-center gap-2 bg-white p-3 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            >
              <RefreshCcw className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-800">중복 주제 제거</span>
            </Button>
            <p className="text-xs text-gray-500 mt-1">AI 생성 주제 목록에서 중복 항목을 제거합니다.</p>
          </div>
        </div>
      )}

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
