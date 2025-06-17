
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const hasInitialized = useRef(false);

  // 앱 상태 초기화 시 기본값 확실히 설정 - 한 번만 실행
  useEffect(() => {
    if (!hasInitialized.current) {
      console.log('useAppStateManager 초기화됨 - 기본 API 키들 설정:', {
        gemini: DEFAULT_API_KEYS.GEMINI,
        pixabay: DEFAULT_API_KEYS.PIXABAY,
        huggingface: DEFAULT_API_KEYS.HUGGING_FACE
      });
      
      hasInitialized.current = true;
      
      // 기본값이 확실히 설정되도록 강제 업데이트
      setAppState(prev => ({
        ...prev,
        apiKey: DEFAULT_API_KEYS.GEMINI,
        pixabayApiKey: DEFAULT_API_KEYS.PIXABAY,
        huggingFaceApiKey: DEFAULT_API_KEYS.HUGGING_FACE,
        isApiKeyValidated: true,
        isPixabayApiKeyValidated: true,
        isHuggingFaceApiKeyValidated: true,
      }));
    }
  }, []); // 빈 의존성 배열로 최초 1회만 실행

  const saveAppState = useCallback((newState: Partial<AppState>) => {
    console.log('앱 상태 업데이트:', newState);
    setAppState(prev => {
      const updatedState = { ...prev, ...newState };
      console.log('업데이트된 전체 상태:', updatedState);
      return updatedState;
    });
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
    hasInitialized.current = false; // 초기화 플래그도 리셋
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
