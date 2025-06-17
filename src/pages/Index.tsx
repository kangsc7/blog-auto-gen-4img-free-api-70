
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, RefreshCw, Ban, Check } from 'lucide-react';
import { AuthForm } from '@/components/auth/AuthForm';
import { AppHeader } from '@/components/layout/AppHeader';
import { RefactoredApiKeysSection } from '@/components/sections/RefactoredApiKeysSection';
import { OneClickSection } from '@/components/sections/OneClickSection';
import { MainContentSection } from '@/components/sections/MainContentSection';
import { ScrollToTopButton } from '@/components/layout/ScrollToTopButton';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useRefactoredAppController } from '@/hooks/useRefactoredAppController';

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
  } = useRefactoredAppController();

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
      
      <RefactoredApiKeysSection 
        geminiManager={geminiManager}
        pixabayManager={pixabayManager}
        huggingFaceManager={huggingFaceManager}
      />

      <div className="container mx-auto mt-20 mb-4">
        <div className="flex items-center justify-between">
          {/* 관리자 전용: 사용자 관리 페이지 링크 */}
          {isAdmin && (
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 bg-white p-3 rounded-lg shadow-md hover:bg-gray-50 transition-colors border-2 border-red-500"
            >
              <Shield className="h-5 w-5 text-red-500" />
              <span className="font-semibold text-gray-800">사용자 관리 페이지</span>
            </Link>
          )}
          
          {/* 관리자가 아닌 경우 빈 div로 공간 확보 */}
          {!isAdmin && <div></div>}
          
          {/* 모든 사용자: 중복 설정 및 초기화 컨트롤 */}
          <div className="flex items-start gap-8">
            <div className="text-center">
              <ToggleGroup
                type="single"
                value={preventDuplicates ? 'forbid' : 'allow'}
                onValueChange={(value) => {
                  if (value) {
                    const newPreventDuplicates = value === 'forbid';
                    setPreventDuplicates(newPreventDuplicates);
                    console.log('중복 설정 변경:', newPreventDuplicates ? '금지' : '허용');
                  }
                }}
                className="inline-flex rounded-lg bg-gray-200 p-1 border shadow-inner"
                aria-label="중복 주제 설정"
              >
                <ToggleGroupItem
                  value="forbid"
                  aria-label="중복 주제 금지"
                  className="w-36 rounded-md px-4 py-2 text-sm font-semibold data-[state=on]:bg-red-500 data-[state=on]:text-white data-[state=on]:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Ban />
                  중복 금지
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="allow"
                  aria-label="중복 주제 허용"
                  className="w-36 rounded-md px-4 py-2 text-sm font-semibold data-[state=on]:bg-green-500 data-[state=on]:text-white data-[state=on]:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Check />
                  중복 허용
                </ToggleGroupItem>
              </ToggleGroup>
              <div className="w-72 mx-auto">
                <p className="text-xs text-gray-500 mt-1">
                  현재: {preventDuplicates ? '중복 금지 (키워드/주제 중복 방지)' : '중복 허용 (모든 제한 해제)'}<br />
                  금지: 70% 이상 유사한 주제를 자동 제거합니다.
                </p>
              </div>
            </div>
            
            {/* 모든 사용자: 초기화 버튼 */}
            <div className="text-center">
              <Button
                onClick={handleResetApp}
                variant="outline"
                size="lg"
                className="bg-white text-green-600 border-green-600 hover:bg-green-50 rounded-lg shadow-md transition-colors px-16 py-8 min-w-[200px] h-16"
              >
                <RefreshCw className="h-6 w-6" />
                <span className="font-bold text-lg text-gray-800">초기화</span>
              </Button>
              <p className="text-xs text-gray-500 mt-1">모든 입력값과 생성된 내용 초기화</p>
            </div>
          </div>
        </div>
      </div>

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
        preventDuplicates={preventDuplicates}
      />
      <ScrollToTopButton />
    </div>
  );
};

export default Index;
