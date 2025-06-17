
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

  // 디버깅을 위한 콘솔 로그 추가
  console.log('Index 컴포넌트 렌더링 상태:', {
    session: !!session,
    isAdmin,
    preventDuplicates,
    profile: !!profile,
    authLoading
  });

  if (authLoading) {
    console.log('인증 로딩 중...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!session) {
    console.log('세션 없음 - 로그인 폼 표시');
    return <AuthForm handleLogin={handleLogin} handleSignUp={handleSignUp} />;
  }

  console.log('메인 화면 렌더링 시작');
  
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

      {/* 컨트롤 섹션 - 모든 사용자에게 표시 */}
      <div className="container mx-auto mt-8 mb-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            
            {/* 관리자 링크 - 관리자에게만 표시 */}
            <div className="flex-shrink-0">
              {isAdmin ? (
                <Link
                  to="/admin/users"
                  className="inline-flex items-center gap-2 bg-red-50 p-3 rounded-lg shadow-sm hover:bg-red-100 transition-colors border border-red-300"
                >
                  <Shield className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-700">사용자 관리 페이지</span>
                </Link>
              ) : (
                <div className="w-48"></div>
              )}
            </div>
            
            {/* 중복 설정 토글 - 모든 사용자에게 표시 */}
            <div className="text-center">
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-700">중복 주제 설정</span>
              </div>
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
                className="inline-flex rounded-lg bg-gray-100 p-1"
              >
                <ToggleGroupItem
                  value="forbid"
                  className="px-4 py-2 text-sm font-medium data-[state=on]:bg-red-500 data-[state=on]:text-white rounded-md flex items-center gap-2"
                >
                  <Ban className="h-4 w-4" />
                  중복 금지
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="allow"
                  className="px-4 py-2 text-sm font-medium data-[state=on]:bg-green-500 data-[state=on]:text-white rounded-md flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  중복 허용
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-xs text-gray-500 mt-1">
                현재: {preventDuplicates ? '중복 금지' : '중복 허용'}
              </p>
            </div>
            
            {/* 초기화 버튼 - 모든 사용자에게 표시 */}
            <div className="text-center">
              <Button
                onClick={handleResetApp}
                variant="outline"
                size="lg"
                className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100 transition-colors px-8 py-4"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                <span className="font-semibold">초기화</span>
              </Button>
              <p className="text-xs text-gray-500 mt-1">모든 데이터 초기화</p>
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
