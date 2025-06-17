
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';
import { DEFAULT_API_KEYS } from '@/config/apiKeys';
import { 
  saveApiKeyToStorage, 
  getApiKeyFromStorage, 
  saveValidationStatusToStorage, 
  getValidationStatusFromStorage,
  removeApiKeyFromStorage,
  getAllApiKeysFromStorage
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
  preventDuplicates: true,
};

export const useAppStateManager = () => {
  const { toast } = useToast();
  const [appState, setAppState] = useState<AppState>(defaultState);
  const [preventDuplicates, setPreventDuplicates] = useState(true);
  const hasInitialized = useRef(false);
  const initializationLock = useRef(false);

  // localStorage에서 API 키 복원 - 개선된 버전
  const loadApiKeysFromStorage = useCallback(() => {
    console.log('🔄 API 키 로드 시작...');
    
    const allKeys = getAllApiKeysFromStorage();
    
    // 기본값과 저장된 값 비교하여 올바른 값 선택
    const finalState = {
      apiKey: allKeys.geminiKey || DEFAULT_API_KEYS.GEMINI,
      pixabayApiKey: allKeys.pixabayKey || DEFAULT_API_KEYS.PIXABAY,
      huggingFaceApiKey: allKeys.huggingFaceKey || DEFAULT_API_KEYS.HUGGING_FACE,
      // 저장된 키가 있으면 검증 상태를 사용, 없으면 기본값은 true
      isApiKeyValidated: allKeys.geminiKey ? allKeys.geminiValidated : true,
      isPixabayApiKeyValidated: allKeys.pixabayKey ? allKeys.pixabayValidated : true,
      isHuggingFaceApiKeyValidated: allKeys.huggingFaceKey ? allKeys.huggingFaceValidated : true,
    };

    console.log('✅ 최종 로드된 API 키 상태:', {
      gemini: { hasKey: !!finalState.apiKey, validated: finalState.isApiKeyValidated },
      pixabay: { hasKey: !!finalState.pixabayApiKey, validated: finalState.isPixabayApiKeyValidated },
      huggingface: { hasKey: !!finalState.huggingFaceApiKey, validated: finalState.isHuggingFaceApiKeyValidated }
    });

    return finalState;
  }, []);

  // 앱 상태 초기화 - 한 번만 실행되도록 보장
  useEffect(() => {
    if (!hasInitialized.current && !initializationLock.current) {
      console.log('🚀 useAppStateManager 초기화 시작');
      initializationLock.current = true;
      
      const storedApiKeys = loadApiKeysFromStorage();
      
      hasInitialized.current = true;
      
      setAppState(prev => {
        const newState = { ...prev, ...storedApiKeys };
        console.log('✅ 앱 상태 초기화 완료:', newState);
        return newState;
      });
      
      // 모든 검증 상태를 localStorage에 즉시 저장하여 동기화
      setTimeout(() => {
        saveValidationStatusToStorage('GEMINI', storedApiKeys.isApiKeyValidated);
        saveValidationStatusToStorage('PIXABAY', storedApiKeys.isPixabayApiKeyValidated);
        saveValidationStatusToStorage('HUGGING_FACE', storedApiKeys.isHuggingFaceApiKeyValidated);
      }, 100);
    }
  }, [loadApiKeysFromStorage]);

  // preventDuplicates 상태 동기화
  useEffect(() => {
    setAppState(prev => ({
      ...prev,
      preventDuplicates
    }));
  }, [preventDuplicates]);

  const saveAppState = useCallback((newState: Partial<AppState>) => {
    console.log('💾 앱 상태 업데이트 요청:', newState);
    
    // API 키 관련 상태가 변경되면 localStorage에도 즉시 저장
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
      console.log('✅ 앱 상태 업데이트 완료:', {
        gemini: { key: updatedState.apiKey?.substring(0, 20) + '...', validated: updatedState.isApiKeyValidated },
        pixabay: { key: updatedState.pixabayApiKey?.substring(0, 20) + '...', validated: updatedState.isPixabayApiKeyValidated },
        huggingface: { key: updatedState.huggingFaceApiKey?.substring(0, 20) + '...', validated: updatedState.isHuggingFaceApiKeyValidated }
      });
      return updatedState;
    });
  }, []);

  const deleteApiKeyFromStorage = useCallback((keyType: 'gemini' | 'pixabay' | 'huggingface') => {
    console.log(`🗑️ ${keyType} API 키를 기본값으로 복원`);
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
    console.log('🔄 앱 전체 초기화');
    
    // localStorage의 API 키들도 모두 삭제
    removeApiKeyFromStorage('GEMINI');
    removeApiKeyFromStorage('PIXABAY');
    removeApiKeyFromStorage('HUGGING_FACE');
    
    setAppState(defaultState);
    setPreventDuplicates(true);
    hasInitialized.current = false;
    initializationLock.current = false;
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
