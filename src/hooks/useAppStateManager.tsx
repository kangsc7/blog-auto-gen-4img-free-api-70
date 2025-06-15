
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

const initialAppState: AppState = {
  isLoggedIn: false,
  currentUser: '',
  apiKey: '',
  isApiKeyValidated: false,
  keyword: '',
  topicCount: 3,
  topics: [],
  selectedTopic: '',
  colorTheme: '',
  referenceLink: '',
  referenceSentence: '',
  generatedContent: '',
  imageStyle: '',
  imagePrompt: ''
};

export const useAppStateManager = () => {
  const { toast } = useToast();
  const [appState, setAppState] = useState<AppState>(initialAppState);

  useEffect(() => {
    loadAppState();
  }, []);

  const loadAppState = () => {
    try {
      const savedState = localStorage.getItem('blog_app_state');
      let parsedState: Partial<AppState> = {};
      if (savedState) {
        parsedState = JSON.parse(savedState);
        delete parsedState.apiKey;
        delete parsedState.isApiKeyValidated;
      }
      
      const savedApiKey = localStorage.getItem('blog_api_key') || '';
      const savedApiKeyValidated = localStorage.getItem('blog_api_key_validated') === 'true';

      setAppState(prev => ({ 
        ...prev, 
        ...parsedState, 
        apiKey: savedApiKey, 
        isApiKeyValidated: savedApiKeyValidated && !!savedApiKey,
      }));
    } catch (error) {
      console.error('앱 상태 로드 오류:', error);
    }
  };

  const saveAppState = useCallback((newState: Partial<AppState>) => {
    try {
      setAppState(prevState => {
        const updatedState = { ...prevState, ...newState };
        const stateToSave = { ...updatedState };
        delete stateToSave.apiKey;
        delete stateToSave.isApiKeyValidated;
        localStorage.setItem('blog_app_state', JSON.stringify(stateToSave));
        return updatedState;
      });
    } catch (error) {
      console.error('앱 상태 저장 오류:', error);
    }
  }, []);

  const saveApiKeyToStorage = () => {
    if (!appState.apiKey.trim()) {
      toast({ title: "저장 오류", description: "API 키를 입력해주세요.", variant: "destructive" });
      return;
    }
    try {
      localStorage.setItem('blog_api_key', appState.apiKey);
      localStorage.setItem('blog_api_key_validated', String(appState.isApiKeyValidated));
      toast({ title: "저장 완료", description: "API 키가 브라우저에 저장되었습니다." });
    } catch (error) {
      console.error("API 키 저장 오류:", error);
      toast({ title: "저장 실패", description: "API 키 저장 중 오류가 발생했습니다.", variant: "destructive" });
    }
  };

  const deleteApiKeyFromStorage = () => {
    try {
      localStorage.removeItem('blog_api_key');
      localStorage.removeItem('blog_api_key_validated');
      saveAppState({ apiKey: '', isApiKeyValidated: false });
      toast({ title: "삭제 완료", description: "저장된 API 키가 삭제되었습니다." });
    } catch (error) {
      console.error("API 키 삭제 오류:", error);
      toast({ title: "삭제 실패", description: "API 키 삭제 중 오류가 발생했습니다.", variant: "destructive" });
    }
  };

  const resetApp = () => {
    const savedApiKey = localStorage.getItem('blog_api_key') || '';
    const savedApiKeyValidated = (localStorage.getItem('blog_api_key_validated') === 'true') && !!savedApiKey;

    saveAppState({
      keyword: '',
      topicCount: 3,
      topics: [],
      selectedTopic: '',
      colorTheme: '',
      referenceLink: '',
      referenceSentence: '',
      generatedContent: '',
      imageStyle: '',
      imagePrompt: '',
      apiKey: savedApiKey,
      isApiKeyValidated: savedApiKeyValidated,
    });
    
    toast({
      title: "초기화 완료",
      description: "앱 데이터가 초기화되었습니다. 브라우저에 저장된 API 키는 유지됩니다.",
    });
  };

  return { appState, saveAppState, saveApiKeyToStorage, deleteApiKeyFromStorage, resetApp };
};
