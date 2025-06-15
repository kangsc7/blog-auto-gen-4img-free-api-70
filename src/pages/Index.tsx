
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, RefreshCcw, RefreshCw } from 'lucide-react';
import { AuthForm } from '@/components/auth/AuthForm';
import { AppHeader } from '@/components/layout/AppHeader';
import { ApiKeysSection } from '@/components/sections/ApiKeysSection';
import { OneClickSection } from '@/components/sections/OneClickSection';
import { MainContentSection } from '@/components/sections/MainContentSection';
import { ScrollToTopButton } from '@/components/layout/ScrollToTopButton';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { useAppController } from '@/hooks/useAppController';

const Index = () => {
  const {
    appState,
    saveAppState,
    session,
    profile,
    authLoading,
    handleLogin,
    handleSignUp,
    handleLogout,
    isAdmin,
    isValidatingApi,
    validateApiKey,
    saveApiKeyToStorage,
    deleteApiKeyFromStorage,
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
  } = useAppController();

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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <AppHeader
        currentUser={profile?.email || appState.currentUser}
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
        huggingFaceManager={huggingFaceManager}
      />

      {isAdmin && (
        <div className="container mx-auto my-4 flex items-center justify-between">
          <div className="flex items-start gap-8">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 bg-white p-3 rounded-lg shadow-md hover:bg-gray-50 transition-colors border-2 border-red-500"
            >
              <Shield className="h-5 w-5 text-red-500" />
              <span className="font-semibold text-gray-800">사용자 관리 페이지</span>
            </Link>
            <div className="text-center">
              <Toggle
                pressed={!preventDuplicates}
                onPressedChange={(pressed) => setPreventDuplicates(!pressed)}
                className="w-56 justify-center gap-2 p-3 rounded-lg bg-white text-gray-800 border border-black shadow-md hover:shadow-lg transition-all duration-200 data-[state=on]:bg-gray-100 data-[state=on]:shadow-inner data-[state=on]:text-blue-600"
              >
                <RefreshCcw className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">
                  {!preventDuplicates ? '중복 주제 허용' : '중복 주제 금지'}
                </span>
              </Toggle>
              <div className="w-56 mx-auto">
                <p className="text-xs text-gray-500 mt-1">
                  금지 : 중복 주제 제거<br />
                  허용 : 중복 주제 가능
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Button
              onClick={handleResetApp}
              variant="outline"
              size="lg"
              className="bg-white text-green-600 border-green-600 hover:bg-green-50 rounded-lg shadow-md transition-colors px-10 py-5"
            >
              <RefreshCw className="h-5 w-5" />
              <span className="font-semibold text-gray-800">초기화</span>
            </Button>
            <p className="text-xs text-gray-500 mt-1">모든 입력값과 생성된 내용 초기화</p>
          </div>
        </div>
      )}

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
