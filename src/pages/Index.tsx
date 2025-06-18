import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, RefreshCw, Ban, Check, AlertTriangle, Clock } from 'lucide-react';
import { AuthForm } from '@/components/auth/AuthForm';
import { AppHeader } from '@/components/layout/AppHeader';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { RefactoredApiKeysSection } from '@/components/sections/RefactoredApiKeysSection';
import { OneClickSection } from '@/components/sections/OneClickSection';
import { MainContentSection } from '@/components/sections/MainContentSection';
import { ScrollToTopButton } from '@/components/layout/ScrollToTopButton';
import { TopicSelectionNotification } from '@/components/dialog/TopicSelectionNotification';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRefactoredAppController } from '@/hooks/useRefactoredAppController';
import { useUserAccess } from '@/hooks/useUserAccess';

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
    handleTopicConfirm,
    showTopicSelectionDialog,
    setShowTopicSelectionDialog,
  } = useRefactoredAppController();

  const { hasAccess, isCheckingAccess } = useUserAccess();

  console.log('Index 컴포넌트 렌더링 상태:', {
    session: !!session,
    isAdmin,
    hasAccess,
    preventDuplicates,
    profile: !!profile,
    authLoading,
    isCheckingAccess
  });

  if (authLoading || isCheckingAccess) {
    console.log('인증 또는 접근 권한 확인 중...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-gray-700">로딩 중...</p>
      </div>
    );
  }

  if (!session) {
    console.log('세션 없음 - 로그인 폼 표시');
    return <AuthForm handleLogin={handleLogin} handleSignUp={handleSignUp} />;
  }

  // 접근 권한이 없는 경우 (승인 대기, 거절, 만료)
  if (!hasAccess && !isAdmin) {
    const getStatusMessage = () => {
      if (!profile) return { title: "프로필 로딩 중", description: "잠시만 기다려주세요." };
      
      switch (profile.status) {
        case 'pending':
          return { 
            title: "승인 대기", 
            description: "관리자의 승인을 기다리고 있습니다. 승인 후 서비스를 이용하실 수 있습니다.",
            icon: <Clock className="h-8 w-8 text-yellow-600" />
          };
        case 'rejected':
          return { 
            title: "접근 거부", 
            description: "계정이 거절되었거나 이용 기간이 만료되었습니다. 관리자에게 문의하세요.",
            icon: <AlertTriangle className="h-8 w-8 text-red-600" />
          };
        default:
          return { 
            title: "접근 제한", 
            description: "서비스 이용 권한이 없습니다.",
            icon: <AlertTriangle className="h-8 w-8 text-red-600" />
          };
      }
    };

    const { title, description, icon } = getStatusMessage();

    return (
      <div className="min-h-screen bg-gray-100">
        <TopNavigation />
        <AppHeader
          currentUser={profile?.email || appState.currentUser}
          handleLogout={handleLogout}
        />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
          <Card className="w-full max-w-md text-center shadow-lg">
            <CardHeader>
              <div className="mx-auto bg-gray-100 rounded-full p-3 w-fit">
                {icon}
              </div>
              <CardTitle className="mt-4 text-2xl font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-6 text-base">
                {description}
              </CardDescription>
              <Button onClick={handleLogout} variant="outline" className="font-semibold">
                로그아웃
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  console.log('메인 화면 렌더링 시작');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <TopNavigation />
      <AppHeader
        currentUser={profile?.email || appState.currentUser}
        handleLogout={handleLogout}
      />
      
      <RefactoredApiKeysSection 
        geminiManager={geminiManager}
        pixabayManager={pixabayManager}
        huggingFaceManager={huggingFaceManager}
      />

      {/* 컨트롤 섹션 - 모든 접근 권한이 있는 사용자에게 표시 */}
      <div className="container mx-auto mt-4 mb-3">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-6">
            
            {/* 사용자 현황 링크 - 모든 로그인한 사용자에게 표시 */}
            <div className="flex-shrink-0">
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-3 bg-blue-50 p-4 rounded-xl shadow-sm hover:bg-blue-100 transition-colors border border-blue-300 hover:shadow-md"
              >
                <Shield className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-blue-700 text-lg">
                  {isAdmin ? '사용자 관리 페이지' : '사용자 현황 페이지'}
                </span>
              </Link>
            </div>
            
            {/* 중복 설정 토글 - 접근 권한이 있는 사용자에게 표시 */}
            <div className="text-center">
              <div className="mb-3">
                <span className="text-lg font-bold text-gray-800">중복 주제 설정</span>
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
                  className="px-5 py-3 text-sm font-bold data-[state=on]:bg-red-500 data-[state=on]:text-white rounded-md flex items-center gap-2 transition-all"
                >
                  <Ban className="h-4 w-4" />
                  중복 금지
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="allow"
                  className="px-5 py-3 text-sm font-bold data-[state=on]:bg-green-500 data-[state=on]:text-white rounded-md flex items-center gap-2 transition-all"
                >
                  <Check className="h-4 w-4" />
                  중복 허용
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-sm text-gray-600 mt-2 font-semibold">
                현재: {preventDuplicates ? '중복 금지' : '중복 허용'}
              </p>
            </div>
            
            {/* 초기화 버튼 - 크기 조정 */}
            <div className="text-center">
              <Button
                onClick={handleResetApp}
                variant="outline"
                size="lg"
                className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100 transition-colors px-8 py-6 h-auto shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="h-6 w-6 mr-2" />
                <span className="font-bold text-lg">초기화</span>
              </Button>
              <p className="text-sm text-gray-600 mt-2 font-semibold">모든 데이터 초기화</p>
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
        handleTopicConfirm={handleTopicConfirm}
      />

      {/* 주제 선택 알림 팝업 */}
      <TopicSelectionNotification
        open={showTopicSelectionDialog}
        onOpenChange={setShowTopicSelectionDialog}
      />
      
      <ScrollToTopButton />
    </div>
  );
};

export default Index;
