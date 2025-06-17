
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { DEFAULT_API_KEYS } from '@/config/apiKeys';
import { 
  saveApiKeyToStorage, 
  getApiKeyFromStorage, 
  saveValidationStatusToStorage, 
  getValidationStatusFromStorage,
  removeApiKeyFromStorage 
} from '@/lib/apiKeyStorage';

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

  // localStorage에서 API 키 복원
  const loadApiKeysFromStorage = useCallback(() => {
    const storedGemini = getApiKeyFromStorage('GEMINI');
    const storedPixabay = getApiKeyFromStorage('PIXABAY');
    const storedHuggingFace = getApiKeyFromStorage('HUGGING_FACE');
    
    const geminiValidated = getValidationStatusFromStorage('GEMINI');
    const pixabayValidated = getValidationStatusFromStorage('PIXABAY');
    const huggingFaceValidated = getValidationStatusFromStorage('HUGGING_FACE');

    return {
      apiKey: storedGemini || DEFAULT_API_KEYS.GEMINI,
      pixabayApiKey: storedPixabay || DEFAULT_API_KEYS.PIXABAY,
      huggingFaceApiKey: storedHuggingFace || DEFAULT_API_KEYS.HUGGING_FACE,
      isApiKeyValidated: storedGemini ? geminiValidated : true,
      isPixabayApiKeyValidated: storedPixabay ? pixabayValidated : true,
      isHuggingFaceApiKeyValidated: storedHuggingFace ? huggingFaceValidated : true,
    };
  }, []);

  // 앱 상태 초기화 시 localStorage에서 API 키 복원
  useEffect(() => {
    if (!hasInitialized.current) {
      console.log('useAppStateManager 초기화 - localStorage에서 API 키 복원');
      
      const storedApiKeys = loadApiKeysFromStorage();
      
      console.log('복원된 API 키들:', {
        gemini: storedApiKeys.apiKey,
        pixabay: storedApiKeys.pixabayApiKey,
        huggingface: storedApiKeys.huggingFaceApiKey,
        geminiValidated: storedApiKeys.isApiKeyValidated,
        pixabayValidated: storedApiKeys.isPixabayApiKeyValidated,
        huggingfaceValidated: storedApiKeys.isHuggingFaceApiKeyValidated
      });
      
      hasInitialized.current = true;
      
      setAppState(prev => ({
        ...prev,
        ...storedApiKeys
      }));
    }
  }, [loadApiKeysFromStorage]);

  const saveAppState = useCallback((newState: Partial<AppState>) => {
    console.log('앱 상태 업데이트:', newState);
    
    // API 키 관련 상태가 변경되면 localStorage에도 저장
    if (newState.apiKey !== undefined) {
      saveApiKeyToStorage('GEMINI', newState.apiKey);
    }
    if (newState.pixabayApiKey !== undefined) {
      saveApiKeyToStorage('PIXABAY', newState.pixabayApiKey);
    }
    if (newState.huggingFaceApiKey !== undefined) {
      saveApiKeyToStorage('HUGGING_FACE', newState.huggingFaceApiKey);
    }
    if (newState.isApiKeyValidated !== undefined) {
      saveValidationStatusToStorage('GEMINI', newState.isApiKeyValidated);
    }
    if (newState.isPixabayApiKeyValidated !== undefined) {
      saveValidationStatusToStorage('PIXABAY', newState.isPixabayApiKeyValidated);
    }
    if (newState.isHuggingFaceApiKeyValidated !== undefined) {
      saveValidationStatusToStorage('HUGGING_FACE', newState.isHuggingFaceApiKeyValidated);
    }

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
        removeApiKeyFromStorage('GEMINI');
        saveAppState({ apiKey: DEFAULT_API_KEYS.GEMINI, isApiKeyValidated: true });
        break;
      case 'pixabay':
        removeApiKeyFromStorage('PIXABAY');
        saveAppState({ pixabayApiKey: DEFAULT_API_KEYS.PIXABAY, isPixabayApiKeyValidated: true });
        break;
      case 'huggingface':
        removeApiKeyFromStorage('HUGGING_FACE');
        saveAppState({ huggingFaceApiKey: DEFAULT_API_KEYS.HUGGING_FACE, isHuggingFaceApiKeyValidated: true });
        break;
    }
    toast({ title: "기본값으로 복원", description: `${keyType} API 키가 기본값으로 복원되었습니다.` });
  }, [saveAppState, toast]);

  const resetApp = useCallback(() => {
    console.log('앱 전체 초기화');
    
    // localStorage의 API 키들도 모두 삭제
    removeApiKeyFromStorage('GEMINI');
    removeApiKeyFromStorage('PIXABAY');
    removeApiKeyFromStorage('HUGGING_FACE');
    
    setAppState(defaultState);
    hasInitialized.current = false;
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
