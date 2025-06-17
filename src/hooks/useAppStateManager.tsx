
import { useState, useEffect, useCallback } from 'react';
import { AppState } from '@/types';
import { useToast } from '@/hooks/use-toast';

const initialState: AppState = {
  topics: [],
  selectedTopic: '',
  keyword: '',
  topicCount: 10,
  generatedContent: '',
  colorTheme: '',
  referenceLink: '',
  referenceSentence: '',
  imagePrompt: '',
  isApiKeyValidated: false,
  apiKey: '',
  pixabayApiKey: '',
  isPixabayApiKeyValidated: false,
  huggingfaceApiKey: '',
  isHuggingfaceApiKeyValidated: false,
  isLoggedIn: false,
  currentUser: '',
  preventDuplicates: true,
  adsenseCode: '',
  isAdsenseEnabled: false,
  saveReferenceTrigger: false,
};

const STORAGE_KEY = 'blog-generator-state';

export const useAppStateManager = () => {
  const { toast } = useToast();
  
  // 로컬 스토리지에서 상태 로드
  const loadStateFromStorage = useCallback((): AppState => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        return { ...initialState, ...parsedState };
      }
    } catch (error) {
      console.error('상태 로드 실패:', error);
    }
    return initialState;
  }, []);

  const [appState, setAppState] = useState<AppState>(loadStateFromStorage);

  // 상태를 로컬 스토리지에 저장
  const saveStateToStorage = useCallback((state: AppState) => {
    try {
      // API 키는 별도 저장소에 저장하므로 제외
      const stateToSave = {
        ...state,
        apiKey: '',
        pixabayApiKey: '',
        huggingfaceApiKey: '',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('상태 저장 실패:', error);
    }
  }, []);

  // 상태 업데이트 함수
  const saveAppState = useCallback((newState: Partial<AppState>) => {
    setAppState(prevState => {
      const updatedState = { ...prevState, ...newState };
      saveStateToStorage(updatedState);
      return updatedState;
    });
  }, [saveStateToStorage]);

  // 중복 설정 업데이트
  const [preventDuplicates, setPreventDuplicates] = useState(appState.preventDuplicates);

  useEffect(() => {
    saveAppState({ preventDuplicates });
  }, [preventDuplicates, saveAppState]);

  // API 키 삭제
  const deleteApiKeyFromStorage = useCallback((keyType: 'gemini' | 'pixabay' | 'huggingface') => {
    try {
      localStorage.removeItem(`${keyType}_api_key`);
      if (keyType === 'gemini') {
        saveAppState({ apiKey: '', isApiKeyValidated: false });
      } else if (keyType === 'pixabay') {
        saveAppState({ pixabayApiKey: '', isPixabayApiKeyValidated: false });
      } else if (keyType === 'huggingface') {
        saveAppState({ huggingfaceApiKey: '', isHuggingfaceApiKeyValidated: false });
      }
      toast({ title: "API 키 삭제 완료", description: `${keyType} API 키가 삭제되었습니다.` });
    } catch (error) {
      console.error('API 키 삭제 실패:', error);
      toast({ title: "삭제 실패", description: "API 키 삭제 중 오류가 발생했습니다.", variant: "destructive" });
    }
  }, [saveAppState, toast]);

  // 전체 리셋
  const resetApp = useCallback(() => {
    try {
      // 상태만 초기화하고 API 키는 유지
      const currentApiKeys = {
        apiKey: appState.apiKey,
        isApiKeyValidated: appState.isApiKeyValidated,
        pixabayApiKey: appState.pixabayApiKey,
        isPixabayApiKeyValidated: appState.isPixabayApiKeyValidated,
        huggingfaceApiKey: appState.huggingfaceApiKey,
        isHuggingfaceApiKeyValidated: appState.isHuggingfaceApiKeyValidated,
        isLoggedIn: appState.isLoggedIn,
        currentUser: appState.currentUser,
        adsenseCode: appState.adsenseCode,
        isAdsenseEnabled: appState.isAdsenseEnabled,
      };
      
      const resetState = { ...initialState, ...currentApiKeys };
      setAppState(resetState);
      saveStateToStorage(resetState);
      
      toast({ title: "초기화 완료", description: "모든 데이터가 초기화되었습니다." });
    } catch (error) {
      console.error('앱 초기화 실패:', error);
      toast({ title: "초기화 실패", description: "초기화 중 오류가 발생했습니다.", variant: "destructive" });
    }
  }, [appState, saveStateToStorage, toast]);

  // 컴포넌트 마운트 시 저장된 상태 로드
  useEffect(() => {
    const savedState = loadStateFromStorage();
    setAppState(savedState);
  }, [loadStateFromStorage]);

  return {
    appState,
    saveAppState,
    deleteApiKeyFromStorage,
    resetApp,
    preventDuplicates,
    setPreventDuplicates,
  };
};
