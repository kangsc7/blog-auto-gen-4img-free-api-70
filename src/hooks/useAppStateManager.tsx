
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { DEFAULT_API_KEYS } from '@/config/apiKeys';

const defaultState: AppState = {
  keyword: '',
  topics: [],
  selectedTopic: '',
  topicCount: 5,
  generatedContent: '',
  isApiKeyValidated: true,
  apiKey: DEFAULT_API_KEYS.GEMINI,
  pixabayApiKey: DEFAULT_API_KEYS.PIXABAY,
  isPixabayApiKeyValidated: true,
  huggingFaceApiKey: DEFAULT_API_KEYS.HUGGING_FACE,
  isHuggingFaceApiKeyValidated: true,
  imagePrompt: '',
  generatedImageUrl: '',
  isLoggedIn: false,
  currentUser: '',
  colorTheme: '',
  referenceLink: '',
  referenceSentence: '',
  imageStyle: '',
};

export const useAppStateManager = () => {
  const { toast } = useToast();
  const [appState, setAppState] = useState<AppState>(defaultState);
  const [preventDuplicates, setPreventDuplicates] = useState(true);

  // 앱 상태 초기화 - 컴포넌트 마운트 시 기본 API 키들로 강제 설정
  useEffect(() => {
    console.log('앱 상태 초기화 시작');
    setAppState(prev => ({
      ...prev,
      apiKey: DEFAULT_API_KEYS.GEMINI,
      isApiKeyValidated: true,
      pixabayApiKey: DEFAULT_API_KEYS.PIXABAY,
      isPixabayApiKeyValidated: true,
      huggingFaceApiKey: DEFAULT_API_KEYS.HUGGING_FACE,
      isHuggingFaceApiKeyValidated: true,
    }));
    console.log('앱 상태에 기본 API 키들이 자동 설정됨');
  }, []);

  const saveAppState = useCallback((newState: Partial<AppState>) => {
    console.log('앱 상태 업데이트:', newState);
    setAppState(prev => ({ ...prev, ...newState }));
  }, []);

  const deleteApiKeyFromStorage = useCallback((keyType: 'gemini' | 'pixabay' | 'huggingface') => {
    switch (keyType) {
      case 'gemini':
        saveAppState({ apiKey: DEFAULT_API_KEYS.GEMINI, isApiKeyValidated: true });
        break;
      case 'pixabay':
        saveAppState({ pixabayApiKey: DEFAULT_API_KEYS.PIXABAY, isPixabayApiKeyValidated: true });
        break;
      case 'huggingface':
        saveAppState({ huggingFaceApiKey: DEFAULT_API_KEYS.HUGGING_FACE, isHuggingFaceApiKeyValidated: true });
        break;
    }
    toast({ title: "기본값으로 복원", description: `${keyType} API 키가 기본값으로 복원되었습니다.` });
  }, [saveAppState, toast]);

  const resetApp = useCallback(() => {
    setAppState(defaultState);
    toast({ title: "초기화 완료", description: "모든 데이터가 초기화되었습니다." });
  }, [toast]);

  return {
    appState,
    saveAppState,
    deleteApiKeyFromStorage,
    resetApp,
    preventDuplicates,
    setPreventDuplicates,
  };
};
