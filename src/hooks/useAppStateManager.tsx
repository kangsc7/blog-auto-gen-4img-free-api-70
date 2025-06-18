
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
  getAllApiKeysFromStorage,
  preserveApiKeysOnReset
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
  isPixabayKeyValidated: true,
  huggingFaceApiKey: DEFAULT_API_KEYS.HUGGING_FACE,
  isHuggingFaceKeyValidated: true,
  imagePrompt: '',
  currentUser: '',
  colorTheme: '',
  referenceLink: '',
  referenceSentence: '',
  preventDuplicates: true,
};

// localStorage 키 상수들
const STORAGE_KEYS = {
  GENERATED_CONTENT: 'blog_generated_content',
  EDITOR_CONTENT: 'blog_editor_content',
  REFERENCE_LINK: 'blog_reference_link_permanent',
  REFERENCE_SENTENCE: 'blog_reference_sentence_permanent',
  SELECTED_TOPIC: 'blog_selected_topic',
  TOPICS: 'blog_topics',
  KEYWORD: 'blog_keyword',
  COLOR_THEME: 'blog_color_theme'
};

export const useAppStateManager = () => {
  const { toast } = useToast();
  const [appState, setAppState] = useState<AppState>(defaultState);
  const [preventDuplicates, setPreventDuplicates] = useState(true);
  const hasInitialized = useRef(false);
  const initializationLock = useRef(false);

  // localStorage에서 블로그 관련 데이터 로드 - 참조 링크와 문장 영구 보존
  const loadBlogDataFromStorage = useCallback(() => {
    try {
      const editorContent = localStorage.getItem(STORAGE_KEYS.EDITOR_CONTENT);
      const generatedContent = localStorage.getItem(STORAGE_KEYS.GENERATED_CONTENT);
      
      const finalContent = editorContent || generatedContent || '';
      
      // 참조 링크와 문장은 영구 보존 키로 저장
      const referenceLink = localStorage.getItem(STORAGE_KEYS.REFERENCE_LINK) || '';
      const referenceSentence = localStorage.getItem(STORAGE_KEYS.REFERENCE_SENTENCE) || '';
      
      console.log('앱 상태 관리자 - 블로그 데이터 로드 (영구 보존):', {
        hasEditorContent: !!editorContent,
        hasGeneratedContent: !!generatedContent,
        finalContentLength: finalContent.length,
        referenceLink,
        referenceSentence: referenceSentence.substring(0, 50) + '...'
      });

      return {
        generatedContent: finalContent,
        referenceLink,
        referenceSentence,
        selectedTopic: localStorage.getItem(STORAGE_KEYS.SELECTED_TOPIC) || '',
        topics: JSON.parse(localStorage.getItem(STORAGE_KEYS.TOPICS) || '[]'),
        keyword: localStorage.getItem(STORAGE_KEYS.KEYWORD) || '',
        colorTheme: localStorage.getItem(STORAGE_KEYS.COLOR_THEME) || ''
      };
    } catch (error) {
      console.error('블로그 데이터 로드 실패:', error);
      return {};
    }
  }, []);

  // localStorage에 블로그 관련 데이터 저장 - 참조 링크와 문장 영구 보존
  const saveBlogDataToStorage = useCallback((data: Partial<AppState>) => {
    try {
      if (data.generatedContent !== undefined) {
        localStorage.setItem(STORAGE_KEYS.GENERATED_CONTENT, data.generatedContent);
        localStorage.setItem(STORAGE_KEYS.EDITOR_CONTENT, data.generatedContent);
        console.log('앱 상태 관리자 - 콘텐츠 저장 및 동기화:', data.generatedContent.length);
      }
      if (data.referenceLink !== undefined) {
        localStorage.setItem(STORAGE_KEYS.REFERENCE_LINK, data.referenceLink);
        console.log('앱 상태 관리자 - 참조 링크 영구 저장:', data.referenceLink);
      }
      if (data.referenceSentence !== undefined) {
        localStorage.setItem(STORAGE_KEYS.REFERENCE_SENTENCE, data.referenceSentence);
        console.log('앱 상태 관리자 - 참조 문장 영구 저장:', data.referenceSentence.substring(0, 50) + '...');
      }
      if (data.selectedTopic !== undefined) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_TOPIC, data.selectedTopic);
      }
      if (data.topics !== undefined) {
        localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(data.topics));
      }
      if (data.keyword !== undefined) {
        localStorage.setItem(STORAGE_KEYS.KEYWORD, data.keyword);
      }
      if (data.colorTheme !== undefined) {
        localStorage.setItem(STORAGE_KEYS.COLOR_THEME, data.colorTheme);
      }
    } catch (error) {
      console.error('블로그 데이터 저장 실패:', error);
    }
  }, []);

  // localStorage에서 API 키 복원 - 개선된 버전
  const loadApiKeysFromStorage = useCallback(() => {
    console.log('🔄 API 키 로드 시작...');
    
    const allKeys = getAllApiKeysFromStorage();
    
    // 기본값과 저장된 값 비교하여 올바른 값 선택 - API 키는 항상 보존
    const finalState = {
      apiKey: allKeys.geminiKey || DEFAULT_API_KEYS.GEMINI,
      pixabayApiKey: allKeys.pixabayKey || DEFAULT_API_KEYS.PIXABAY,
      huggingFaceApiKey: allKeys.huggingFaceKey || DEFAULT_API_KEYS.HUGGING_FACE,
      // 저장된 키가 있으면 검증 상태를 사용, 없으면 기본값은 true
      isApiKeyValidated: allKeys.geminiKey ? allKeys.geminiValidated : true,
      isPixabayKeyValidated: allKeys.pixabayKey ? allKeys.pixabayValidated : true,
      isHuggingFaceKeyValidated: allKeys.huggingFaceKey ? allKeys.huggingFaceValidated : true,
    };

    console.log('✅ 최종 로드된 API 키 상태 (영구 보존):', {
      gemini: { hasKey: !!finalState.apiKey, validated: finalState.isApiKeyValidated },
      pixaby: { hasKey: !!finalState.pixabayApiKey, validated: finalState.isPixabayKeyValidated },
      huggingface: { hasKey: !!finalState.huggingFaceApiKey, validated: finalState.isHuggingFaceKeyValidated }
    });

    return finalState;
  }, []);

  // 앱 상태 초기화 - 한 번만 실행되도록 보장하되 API 키와 블로그 데이터는 보존
  useEffect(() => {
    if (!hasInitialized.current && !initializationLock.current) {
      console.log('🚀 useAppStateManager 초기화 시작 (API 키 및 블로그 데이터 영구 보존)');
      initializationLock.current = true;
      
      const storedApiKeys = loadApiKeysFromStorage();
      const storedBlogData = loadBlogDataFromStorage();
      
      hasInitialized.current = true;
      
      setAppState(prev => {
        const newState = { ...prev, ...storedApiKeys, ...storedBlogData };
        console.log('✅ 앱 상태 초기화 완료 (API 키 및 블로그 데이터 영구 보존):', newState);
        return newState;
      });
      
      // 모든 검증 상태를 localStorage에 즉시 저장하여 동기화
      setTimeout(() => {
        saveValidationStatusToStorage('GEMINI', storedApiKeys.isApiKeyValidated);
        saveValidationStatusToStorage('PIXABAY', storedApiKeys.isPixabayKeyValidated);
        saveValidationStatusToStorage('HUGGING_FACE', storedApiKeys.isHuggingFaceKeyValidated);
      }, 100);
    }
  }, [loadApiKeysFromStorage, loadBlogDataFromStorage]);

  // preventDuplicates 상태 동기화
  useEffect(() => {
    setAppState(prev => ({
      ...prev,
      preventDuplicates
    }));
  }, [preventDuplicates]);

  const saveAppState = useCallback((newState: Partial<AppState>) => {
    console.log('💾 앱 상태 업데이트 요청 (API 키 및 블로그 데이터 영구 보존):', newState);
    
    // API 키 관련 상태가 변경되면 localStorage에도 즉시 저장하여 영구 보존
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
    if (newState.isPixabayKeyValidated !== undefined) {
      saveValidationStatusToStorage('PIXABAY', newState.isPixabayKeyValidated);
    }
    if (newState.isHuggingFaceKeyValidated !== undefined) {
      saveValidationStatusToStorage('HUGGING_FACE', newState.isHuggingFaceKeyValidated);
    }

    // 블로그 관련 데이터도 localStorage에 저장
    saveBlogDataToStorage(newState);

    setAppState(prev => {
      const updatedState = { ...prev, ...newState };
      console.log('✅ 앱 상태 업데이트 완료 (API 키 및 블로그 데이터 영구 보존)');
      return updatedState;
    });
  }, [saveBlogDataToStorage]);

  const deleteApiKeyFromStorage = useCallback((keyType: 'gemini' | 'pixabay' | 'huggingface') => {
    console.log(`🗑️ ${keyType} API 키를 기본값으로 복원`);
    switch (keyType) {
      case 'gemini':
        removeApiKeyFromStorage('GEMINI');
        saveAppState({ apiKey: DEFAULT_API_KEYS.GEMINI, isApiKeyValidated: true });
        break;
      case 'pixabay':
        removeApiKeyFromStorage('PIXABAY');
        saveAppState({ pixabayApiKey: DEFAULT_API_KEYS.PIXABAY, isPixabayKeyValidated: true });
        break;
      case 'huggingface':
        removeApiKeyFromStorage('HUGGING_FACE');
        saveAppState({ huggingFaceApiKey: DEFAULT_API_KEYS.HUGGING_FACE, isHuggingFaceKeyValidated: true });
        break;
    }
    toast({ title: "기본값으로 복원", description: `${keyType} API 키가 기본값으로 복원되었습니다.` });
  }, [saveAppState, toast]);

  // 참조 링크와 문장을 영구적으로 삭제하는 함수 추가
  const deleteReferenceData = useCallback(() => {
    console.log('🗑️ 참조 링크와 문장을 영구 삭제');
    localStorage.removeItem(STORAGE_KEYS.REFERENCE_LINK);
    localStorage.removeItem(STORAGE_KEYS.REFERENCE_SENTENCE);
    saveAppState({ 
      referenceLink: '', 
      referenceSentence: '' 
    });
    toast({ title: "삭제 완료", description: "참조 링크와 문장이 영구 삭제되었습니다." });
  }, [saveAppState, toast]);

  const resetApp = useCallback(() => {
    console.log('🔄 앱 전체 초기화 (API 키와 참조 데이터는 보존, 블로그 데이터는 삭제)');
    
    // API 키는 보존하고 다른 데이터만 초기화
    const preservedKeys = preserveApiKeysOnReset();
    
    // 블로그 관련 localStorage 데이터 삭제 (참조 데이터 제외)
    localStorage.removeItem(STORAGE_KEYS.GENERATED_CONTENT);
    localStorage.removeItem(STORAGE_KEYS.EDITOR_CONTENT);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_TOPIC);
    localStorage.removeItem(STORAGE_KEYS.TOPICS);
    localStorage.removeItem(STORAGE_KEYS.KEYWORD);
    localStorage.removeItem(STORAGE_KEYS.COLOR_THEME);
    // 참조 링크와 문장은 초기화하지 않음 (영구 보존)
    
    setAppState({
      ...defaultState,
      // API 키와 검증 상태는 보존
      apiKey: preservedKeys.geminiKey || DEFAULT_API_KEYS.GEMINI,
      pixabayApiKey: preservedKeys.pixabayKey || DEFAULT_API_KEYS.PIXABAY,
      huggingFaceApiKey: preservedKeys.huggingFaceKey || DEFAULT_API_KEYS.HUGGING_FACE,
      isApiKeyValidated: preservedKeys.geminiValidated ?? true,
      isPixabayKeyValidated: preservedKeys.pixabayValidated ?? true,
      isHuggingFaceKeyValidated: preservedKeys.huggingFaceValidated ?? true,
      // 참조 링크와 문장도 보존
      referenceLink: localStorage.getItem(STORAGE_KEYS.REFERENCE_LINK) || '',
      referenceSentence: localStorage.getItem(STORAGE_KEYS.REFERENCE_SENTENCE) || '',
    });
    
    setPreventDuplicates(true);
    toast({ title: "초기화 완료", description: "블로그 데이터가 초기화되었습니다. (API 키와 참조 데이터는 보존됨)" });
  }, [toast]);

  return {
    appState,
    saveAppState,
    deleteApiKeyFromStorage,
    deleteReferenceData,
    resetApp,
    preventDuplicates,
    setPreventDuplicates,
  };
};
