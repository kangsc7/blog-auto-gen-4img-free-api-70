import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LoginForm } from '@/components/auth/LoginForm';
import { AppHeader } from '@/components/layout/AppHeader';
import { ProgressTracker } from '@/components/layout/ProgressTracker';
import { TopicGenerator } from '@/components/control/TopicGenerator';
import { ArticleGenerator } from '@/components/control/ArticleGenerator';
import { ImageCreation } from '@/components/control/ImageCreation';
import { ApiKeyManager } from '@/components/control/ApiKeyManager';
import { TopicList } from '@/components/display/TopicList';
import { ArticlePreview } from '@/components/display/ArticlePreview';
import { SeoAnalyzer } from '@/components/display/SeoAnalyzer';
import { Button } from '@/components/ui/button';
import { Zap, RefreshCw } from 'lucide-react';

import { useAppStateManager } from '@/hooks/useAppStateManager';
import { useAuth } from '@/hooks/useAuth';
import { useApiKeyManager } from '@/hooks/useApiKeyManager';
import { useGenerationAPI } from '@/hooks/useGenerationAPI';
import { useOneClick } from '@/hooks/useOneClick';
import { PixabayApiKeyManager } from '@/components/control/PixabayApiKeyManager';

const Index = () => {
  const { toast } = useToast();
  const { appState, saveAppState, saveApiKeyToStorage, deleteApiKeyFromStorage, resetApp } = useAppStateManager();
  const { loginData, setLoginData, handleLogin, handleLogout } = useAuth(saveAppState);
  const { isValidatingApi, validateApiKey } = useApiKeyManager(appState, saveAppState);
  const {
    isGeneratingTopics,
    isGeneratingContent,
    isGeneratingImage,
    generateTopics,
    generateArticle,
    createImagePrompt,
  } = useGenerationAPI(appState, saveAppState);
  
  const [manualTopic, setManualTopic] = useState('');
  const [pixabayApiKey, setPixabayApiKey] = useState('');
  const [isPixabayApiKeyValidated, setIsPixabayApiKeyValidated] = useState(false);
  const [isPixabayValidating, setIsPixabayValidating] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('pixabay_api_key') || '';
    if (savedKey) {
      setPixabayApiKey(savedKey);
      // Simple validation check on load
      validatePixabayApiKey(savedKey);
    }
  }, []);

  const savePixabayApiKeyToStorage = () => {
    if (!pixabayApiKey.trim()) {
      toast({ title: "저장 오류", description: "Pixabay API 키를 입력해주세요.", variant: "destructive" });
      return;
    }
    localStorage.setItem('pixabay_api_key', pixabayApiKey);
    localStorage.setItem('pixabay_api_key_validated', String(isPixabayApiKeyValidated));
    toast({ title: "저장 완료", description: "Pixabay API 키가 브라우저에 저장되었습니다." });
  };

  const deletePixabayApiKeyFromStorage = () => {
    localStorage.removeItem('pixabay_api_key');
    localStorage.removeItem('pixabay_api_key_validated');
    setPixabayApiKey('');
    setIsPixabayApiKeyValidated(false);
    toast({ title: "삭제 완료", description: "저장된 Pixabay API 키가 삭제되었습니다." });
  };

  const validatePixabayApiKey = async (keyToValidate?: string) => {
    const key = keyToValidate || pixabayApiKey;
    if (!key.trim()) {
      toast({ title: "API 키 오류", description: "Pixabay API 키를 입력해주세요.", variant: "destructive" });
      return;
    }
    setIsPixabayValidating(true);
    try {
      const response = await fetch(`https://pixabay.com/api/?key=${key}&q=test`);
      if (response.status === 400) throw new Error('잘못된 API 키');
      if (!response.ok) throw new Error(`네트워크 오류: ${response.statusText}`);
      
      setIsPixabayApiKeyValidated(true);
      if (!keyToValidate) { // Don't toast on initial load validation
        toast({ title: "Pixabay API 키 검증 성공", description: "성공적으로 연결되었습니다." });
      }
    } catch (error) {
      setIsPixabayApiKeyValidated(false);
      if (!keyToValidate) {
        toast({ title: "Pixabay API 키 검증 실패", description: `키가 유효하지 않거나 문제가 발생했습니다.`, variant: "destructive" });
      }
    } finally {
      setIsPixabayValidating(false);
    }
  };

  const generateArticleWithPixabay = (topic?: string) => {
    return generateArticle(topic, { key: pixabayApiKey, validated: isPixabayApiKeyValidated });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <AppHeader
        currentUser={appState.currentUser}
        resetApp={handleResetApp}
        handleLogout={handleLogout}
      />
      
      <div className="max-w-7xl mx-auto my-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApiKeyManager
            appState={appState}
            saveAppState={saveAppState}
            isValidatingApi={isValidatingApi}
            validateApiKey={validateApiKey}
            saveApiKeyToStorage={saveApiKeyToStorage}
            deleteApiKeyFromStorage={deleteApiKeyFromStorage}
          />
        <PixabayApiKeyManager
          apiKey={pixabayApiKey}
          setApiKey={(key) => {
            setPixabayApiKey(key);
            setIsPixabayApiKeyValidated(false);
          }}
          isValidated={isPixabayApiKeyValidated}
          isValidating={isPixabayValidating}
          validateApiKey={() => validatePixabayApiKey()}
          saveApiKey={savePixabayApiKeyToStorage}
          deleteApiKey={deletePixabayApiKeyFromStorage}
        />
      </div>

      <div className="max-w-7xl mx-auto my-6">
        <div className="flex justify-between items-center gap-4 p-4 rounded-lg shadow bg-white">
          <Button 
            onClick={handleLatestIssueOneClick} 
            disabled={isOneClickGenerating || !appState.isApiKeyValidated} 
            className="px-8 py-6 text-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all duration-300"
          >
            <Zap className="mr-2 h-6 w-6" />
            최신 이슈 원클릭 생성
          </Button>
          
          <div className="flex-grow px-4">
            <ProgressTracker
              topics={appState.topics}
              generatedContent={appState.generatedContent}
              imagePrompt={appState.imagePrompt}
            />
          </div>

          <Button 
            onClick={handleEvergreenKeywordOneClick} 
            disabled={isOneClickGenerating || !appState.isApiKeyValidated}
            className="px-8 py-6 text-xl font-bold bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 transition-all duration-300"
          >
            <RefreshCw className="mr-2 h-6 w-6" />
            평생 키워드 원클릭 생성
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <TopicGenerator
            appState={appState}
            saveAppState={saveAppState}
            isGeneratingTopics={isGeneratingTopics}
            generateTopicsFromKeyword={() => generateTopics()}
            manualTopic={manualTopic}
            setManualTopic={setManualTopic}
            handleManualTopicAdd={handleManualTopicAdd}
          />

          <ArticleGenerator
            appState={appState}
            saveAppState={saveAppState}
            selectTopic={selectTopic}
            isGeneratingContent={isGeneratingContent}
            generateArticleContent={generateArticleWithPixabay}
          />

          <ImageCreation
            appState={appState}
            saveAppState={saveAppState}
            isGeneratingImage={isGeneratingImage}
            createImagePromptFromTopic={createImagePrompt}
            copyToClipboard={copyToClipboard}
            openWhisk={openWhisk}
          />
        </div>

        <div className="lg:col-span-8 space-y-6">
          <TopicList
            topics={appState.topics}
            selectedTopic={appState.selectedTopic}
            selectTopic={selectTopic}
          />

          <ArticlePreview
            generatedContent={appState.generatedContent}
            isGeneratingContent={isGeneratingContent}
            copyToClipboard={copyToClipboard}
            downloadHTML={downloadHTML}
          />

          {appState.generatedContent && !isGeneratingContent && (
             <SeoAnalyzer 
                generatedContent={appState.generatedContent}
                keyword={appState.keyword}
                selectedTopic={appState.selectedTopic}
             />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
