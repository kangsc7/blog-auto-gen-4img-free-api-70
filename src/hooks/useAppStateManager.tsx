
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

  // 컴포넌트 마운트 시 기본 API 키들로 강제 설정 - 한 번만 실행
  useEffect(() => {
    console.log('앱 상태 초기화 시작 - 기본 API 키 설정');
    setAppState(prev => {
      const newState = {
        ...prev,
        apiKey: DEFAULT_API_KEYS.GEMINI,
        isApiKeyValidated: true,
        pixabayApiKey: DEFAULT_API_KEYS.PIXABAY,
        isPixabayApiKeyValidated: true,
        huggingFaceApiKey: DEFAULT_API_KEYS.HUGGING_FACE,
        isHuggingFaceApiKeyValidated: true,
      };
      console.log('기본 API 키들이 앱 상태에 설정됨:', {
        gemini: newState.apiKey,
        pixabay: newState.pixabayApiKey,
        huggingface: newState.huggingFaceApiKey
      });
      return newState;
    });
  }, []); // 빈 의존성 배열로 한 번만 실행

  const saveAppState = useCallback((newState: Partial<AppState>) => {
    console.log('앱 상태 업데이트:', newState);
    setAppState(prev => ({ ...prev, ...newState }));
  }, []);

  const deleteApiKeyFromStorage = useCallback((keyType: 'gemini' | 'pixabay' | 'huggingface') => {
    console.log(`${keyType} API 키를 기본값으로 복원`);
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
    console.log('앱 전체 초기화');
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
