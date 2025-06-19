import React, { useState, useEffect, useCallback } from 'react';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { RightContent } from '@/components/layout/RightContent';
import { useAppState } from '@/hooks/useAppState';
import { useTopicGenerator } from '@/hooks/useTopicGenerator';
import { useArticleGenerator } from '@/hooks/useArticleGenerator';
import { useImagePromptGenerator } from '@/hooks/useImagePromptGenerator';
import { useApiKeys } from '@/hooks/useApiKeys';
import { DeleteReferenceDialog } from '@/components/dialogs/DeleteReferenceDialog';
import { ResetDialog } from '@/components/dialogs/ResetDialog';
import { useToast } from '@/hooks/use-toast';
import { checkSubscription } from '@/lib/subscription';

const Index = () => {
  const { toast } = useToast();
  const [isDeleteReferenceOpen, setIsDeleteReferenceOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [preventDuplicates, setPreventDuplicates] = useState(true);
  const [canUseFeatures, setCanUseFeatures] = useState(false);

  // API 키 관리 훅
  const {
    geminiManager,
    pixabayManager,
    huggingFaceManager,
  } = useApiKeys();

  // 앱 상태 관리 훅
  const { appState, saveAppState, resetAppState } = useAppState();
  const { selectedTopic, manualTopic } = appState;

  // 토픽 생성 훅
  const {
    isGeneratingTopics,
    generateTopicsFromKeyword
  } = useTopicGenerator(appState, saveAppState);

  // 글 생성 훅
  const {
    isGeneratingContent,
    generateArticleContent,
    stopArticleGeneration
  } = useArticleGenerator(appState, saveAppState, geminiManager.geminiApiKey);

  // 이미지 프롬프트 생성 훅
  const {
    isGeneratingImage,
    createImagePrompt,
    isDirectlyGenerating,
    generateDirectImage
  } = useImagePromptGenerator(appState, saveAppState, huggingFaceManager.huggingFaceApiKey, canUseFeatures);

  // 토픽 관련 상태 및 핸들러
  const [manualTopicInput, setManualTopicInput] = useState('');
  const setManualTopic = (topic: string) => {
    setManualTopicInput(topic);
  };

  const handleManualTopicAdd = () => {
    if (manualTopicInput.trim() !== '') {
      saveAppState({
        topics: preventDuplicates ? [...new Set([...appState.topics, manualTopicInput.trim()])] : [...appState.topics, manualTopicInput.trim()],
        manualTopic: manualTopicInput.trim()
      });
      setManualTopicInput('');
    }
  };

  const selectTopic = (topic: string) => {
    saveAppState({ selectedTopic: topic });
  };

  // 클립보드 복사 기능
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: `${type} 복사 완료`,
          description: `${type}이(가) 클립보드에 복사되었습니다.`,
        });
      })
      .catch(err => {
        toast({
          title: "복사 실패",
          description: "클립보드 복사에 실패했습니다.",
          variant: "destructive"
        });
        console.error("클립보드 복사 실패:", err);
      });
  };

  // Whisk 열기 기능
  const openWhisk = () => {
    if (appState.imagePrompt) {
      const encodedPrompt = encodeURIComponent(appState.imagePrompt);
      window.open(`https://www.whisk.com/search?q=${encodedPrompt}`, '_blank');
    } else {
      toast({
        title: "프롬프트 오류",
        description: "생성된 이미지 프롬프트가 없습니다.",
        variant: "destructive"
      });
    }
  };

  // HTML 다운로드 기능
  const downloadHTML = () => {
    if (appState.generatedContent) {
      const blob = new Blob([appState.generatedContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTopic ? selectedTopic.replace(/[^a-zA-Z0-9가-힣]/g, '_') : 'article'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "다운로드 완료",
        description: "HTML 파일이 다운로드되었습니다.",
      });
    } else {
      toast({
        title: "다운로드 오류",
        description: "다운로드할 콘텐츠가 없습니다.",
        variant: "destructive"
      });
    }
  };

  // 참조 데이터 삭제
  const deleteReferenceData = () => {
    setIsDeleteReferenceOpen(true);
  };

  const confirmDeleteReference = () => {
    saveAppState({ referenceText: '', referenceLinks: [] });
    setIsDeleteReferenceOpen(false);
    toast({
      title: "참조 데이터 삭제 완료",
      description: "참조 데이터가 성공적으로 삭제되었습니다.",
    });
  };

  const cancelDeleteReference = () => {
    setIsDeleteReferenceOpen(false);
  };

  // 앱 초기화
  const resetAppStateHandler = () => {
    setIsResetOpen(true);
  };

  const confirmReset = () => {
    resetAppState();
    setIsResetOpen(false);
    const resetEvent = new Event('app-reset');
    window.dispatchEvent(resetEvent);
    toast({
      title: "앱 초기화 완료",
      description: "앱 상태가 초기화되었습니다.",
    });
  };

  const cancelReset = () => {
    setIsResetOpen(false);
  };

  useEffect(() => {
    const checkUsage = async () => {
      const isPro = await checkSubscription();
      setCanUseFeatures(isPro);
    };

    checkUsage();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <TopNavigation
        resetAppState={resetAppStateHandler}
        preventDuplicates={preventDuplicates}
        setPreventDuplicates={setPreventDuplicates}
        canUseFeatures={canUseFeatures}
      />

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 좌측 사이드바 */}
          <LeftSidebar
            appState={appState}
            saveAppState={saveAppState}
            generationStatus={{
              isGeneratingTopics,
              isGeneratingContent,
              isGeneratingImage,
              isDirectlyGenerating,
            }}
            generationFunctions={{
              generateTopics: generateTopicsFromKeyword,
              generateArticle: generateArticleContent,
              createImagePrompt,
              generateDirectImage,
              stopArticleGeneration,
            }}
            topicControls={{
              manualTopic: manualTopicInput,
              setManualTopic: setManualTopic,
              handleManualTopicAdd: handleManualTopicAdd,
              selectTopic: selectTopic,
            }}
            utilityFunctions={{
              copyToClipboard,
              openWhisk,
              downloadHTML,
            }}
            preventDuplicates={preventDuplicates}
            deleteReferenceData={deleteReferenceData}
            huggingFaceApiKey={huggingFaceManager.huggingFaceApiKey}
            isHuggingFaceApiKeyValidated={huggingFaceManager.isHuggingFaceApiKeyValidated}
          />

          {/* 우측 컨텐츠 */}
          <RightContent
            appState={appState}
            saveAppState={saveAppState}
            isGeneratingContent={isGeneratingContent}
            selectedTopic={selectedTopic}
            resetAppState={resetAppState}
            canUseFeatures={canUseFeatures}
          />
        </div>
      </div>

      {/* 참조 데이터 삭제 확인 다이얼로그 */}
      <DeleteReferenceDialog
        isOpen={isDeleteReferenceOpen}
        onConfirm={confirmDeleteReference}
        onCancel={cancelDeleteReference}
      />

      {/* 앱 초기화 확인 다이얼로그 */}
      <ResetDialog
        isOpen={isResetOpen}
        onConfirm={confirmReset}
        onCancel={cancelReset}
      />
    </div>
  );
};

export default Index;
