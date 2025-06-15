
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LoginForm } from '@/components/auth/LoginForm';
import { AppHeader } from '@/components/layout/AppHeader';
import { ApiKeysSection } from '@/components/sections/ApiKeysSection';
import { OneClickSection } from '@/components/sections/OneClickSection';
import { MainContentSection } from '@/components/sections/MainContentSection';

import { useAppStateManager } from '@/hooks/useAppStateManager';
import { useAuth } from '@/hooks/useAuth';
import { useApiKeyManager } from '@/hooks/useApiKeyManager';
import { useGenerationAPI } from '@/hooks/useGenerationAPI';
import { useOneClick } from '@/hooks/useOneClick';
import { usePixabayManager } from '@/hooks/usePixabayManager';

const Index = () => {
  const { toast } = useToast();
  const { appState, saveAppState, saveApiKeyToStorage, deleteApiKeyFromStorage, resetApp } = useAppStateManager();
  const { loginData, setLoginData, handleLogin, handleLogout } = useAuth(saveAppState);
  const { isValidatingApi, validateApiKey } = useApiKeyManager(appState, saveAppState);
  const pixabayManager = usePixabayManager();
  const {
    isGeneratingTopics,
    isGeneratingContent,
    isGeneratingImage,
    generateTopics,
    generateArticle,
    createImagePrompt,
  } = useGenerationAPI(appState, saveAppState);
  
  const [manualTopic, setManualTopic] = useState('');

  const generateArticleWithPixabay = (topic?: string) => {
    return generateArticle(topic, { key: pixabayManager.pixabayApiKey, validated: pixabayManager.isPixabayApiKeyValidated });
  };
  
  const selectTopic = (topic: string) => {
    saveAppState({ selectedTopic: topic });
    toast({
      title: "주제 선택 완료",
      description: `"${topic}"이 선택되었습니다.`,
    });
  };

  const { isOneClickGenerating, handleLatestIssueOneClick, handleEvergreenKeywordOneClick } = useOneClick(
    appState,
    saveAppState,
    generateTopics,
    selectTopic,
    generateArticleWithPixabay
  );
  
  const handleManualTopicAdd = () => {
    if (!manualTopic.trim()) {
      toast({ title: "주제 입력 오류", description: "주제를 입력해주세요.", variant: "destructive" });
      return;
    }
    const newTopics = [...appState.topics, manualTopic.trim()];
    saveAppState({ topics: newTopics, selectedTopic: manualTopic.trim() });
    setManualTopic('');
    toast({ title: "수동 주제 추가 완료", description: "새로운 주제가 추가되고 선택되었습니다." });
  };
  
  const handleResetApp = () => {
    resetApp();
    setManualTopic('');
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "복사 완료", description: `${type}이(가) 클립보드에 복사되었습니다.` });
    }).catch(() => {
      toast({ title: "복사 실패", description: "클립보드 복사에 실패했습니다.", variant: "destructive" });
    });
  };

  const openWhisk = () => {
    window.open('https://labs.google/fx/ko/tools/whisk', '_blank', 'noopener,noreferrer');
    toast({ title: "Whisk 열기", description: "Google Whisk가 새 탭에서 열렸습니다." });
  };

  const downloadHTML = () => {
    if (!appState.generatedContent) {
      toast({ title: "다운로드 오류", description: "다운로드할 콘텐츠가 없습니다.", variant: "destructive" });
      return;
    }
    const blob = new Blob([appState.generatedContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appState.selectedTopic.replace(/[^a-zA-Z0-9가-힣]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "다운로드 완료", description: "HTML 파일이 다운로드되었습니다." });
  };

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
    </div>
  );
};

export default Index;
