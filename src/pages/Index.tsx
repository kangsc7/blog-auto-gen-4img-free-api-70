import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, RefreshCw, Ban, Check } from 'lucide-react';
import { AuthForm } from '@/components/auth/AuthForm';
import { AppHeader } from '@/components/layout/AppHeader';
import { ApiKeysSection } from '@/components/sections/ApiKeysSection';
import { OneClickSection } from '@/components/sections/OneClickSection';
import { MainContentSection } from '@/components/sections/MainContentSection';
import { ScrollToTopButton } from '@/components/layout/ScrollToTopButton';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
        deleteApiKeyFromStorage={deleteApiKeyFromStorage}
        pixabayManager={pixabayManager}
        huggingFaceManager={huggingFaceManager}
      />

      {isAdmin && (
        <div className="container mx-auto mt-20 mb-4 flex items-center justify-between">
          <div className="flex items-start gap-8">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 bg-white p-3 rounded-lg shadow-md hover:bg-gray-50 transition-colors border-2 border-red-500"
            >
              <Shield className="h-5 w-5 text-red-500" />
              <span className="font-semibold text-gray-800">사용자 관리 페이지</span>
            </Link>
            <div className="text-center">
              <ToggleGroup
                type="single"
                value={preventDuplicates ? 'forbid' : 'allow'}
                onValueChange={(value) => {
                  if (value) setPreventDuplicates(value === 'forbid');
                }}
                className="inline-flex rounded-lg bg-gray-200 p-1 border shadow-inner"
                aria-label="중복 주제 설정"
              >
                <ToggleGroupItem
                  value="forbid"
                  aria-label="중복 주제 금지"
                  className="w-28 rounded-md px-4 py-2 text-sm font-semibold data-[state=on]:bg-red-500 data-[state=on]:text-white data-[state=on]:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Ban />
                  중복 금지
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="allow"
                  aria-label="중복 주제 허용"
                  className="w-28 rounded-md px-4 py-2 text-sm font-semibold data-[state=on]:bg-green-500 data-[state=on]:text-white data-[state=on]:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Check />
                  중복 허용
                </ToggleGroupItem>
              </ToggleGroup>
              <div className="w-56 mx-auto">
                <p className="text-xs text-gray-500 mt-1">
                  금지: 중복 주제를 자동으로 제거합니다.<br />
                  허용: 중복된 주제도 허용합니다.
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
