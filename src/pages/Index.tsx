
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/layout/AppHeader';
import { ApiKeysSection } from '@/components/sections/ApiKeysSection';
import { OneClickSection } from '@/components/sections/OneClickSection';
import { MainContentSection } from '@/components/sections/MainContentSection';
import { ScrollToTopButton } from '@/components/layout/ScrollToTopButton';

import { useAppStateManager } from '@/hooks/useAppStateManager';
import { useApiKeyManager } from '@/hooks/useApiKeyManager';
import { useOneClick } from '@/hooks/useOneClick';
import { usePixabayManager } from '@/hooks/usePixabayManager';
import { useTopicGenerator } from '@/hooks/useTopicGenerator';
import { useArticleGenerator } from '@/hooks/useArticleGenerator';
import { useImagePromptGenerator } from '@/hooks/useImagePromptGenerator';
import { useAppHandlers } from '@/hooks/useAppHandlers';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { session, user, signOut, loading, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { appState, saveAppState, saveApiKeyToStorage, deleteApiKeyFromStorage, resetApp } = useAppStateManager();
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

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

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
  
  if (loading || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (profile && profile.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle>{profile.status === 'pending' ? '승인 대기 중' : '접근 거부됨'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              {profile.status === 'pending'
                ? '관리자의 승인을 기다리고 있습니다. 승인 후 서비스 이용이 가능합니다.'
                : '계정 접근이 거부되었습니다. 관리자에게 문의하세요.'}
            </p>
            <Button onClick={signOut} variant="outline">로그아웃</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const generationStatus = { isGeneratingTopics, isGeneratingContent, isGeneratingImage };
  const generationFunctions = { generateTopics, generateArticle: generateArticleWithPixabay, createImagePrompt };
  const topicControls = { manualTopic, setManualTopic, handleManualTopicAdd, selectTopic };
  const utilityFunctions = { copyToClipboard, openWhisk, downloadHTML };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <AppHeader
        user={user}
        resetApp={handleResetApp}
        handleLogout={signOut}
      />
      
      {profile && profile.role === 'admin' && <AdminDashboard />}

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
