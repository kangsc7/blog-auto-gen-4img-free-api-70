
import { useState, useEffect } from 'react';
import { AppState } from '@/types';
import { DEFAULT_API_KEYS } from '@/config/apiKeys';

const defaultAppState: AppState = {
  currentUser: '',
  keyword: '',
  topics: [],
  selectedTopic: '',
  generatedContent: '',
  apiKey: DEFAULT_API_KEYS.GEMINI,
  isApiKeyValidated: true,
  imagePrompt: '',
  pixabayApiKey: DEFAULT_API_KEYS.PIXABAY,
  isPixabayApiKeyValidated: true,
  huggingFaceApiKey: DEFAULT_API_KEYS.HUGGING_FACE,
  isHuggingFaceApiKeyValidated: true,
  colorTheme: 'classic-blue',
  referenceLink: '',
  referenceSentence: '',
  preventDuplicates: true,
  topicCount: 10,
};

export const useAppStateManager = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('blog_app_state_v2');
      if (saved) {
        const parsedState = JSON.parse(saved);
        // API 키들이 없는 경우 기본값으로 설정
        return { 
          ...defaultAppState, 
          ...parsedState,
          // 필수 API 키들 보장
          apiKey: parsedState.apiKey || DEFAULT_API_KEYS.GEMINI,
          pixabayApiKey: parsedState.pixabayApiKey || DEFAULT_API_KEYS.PIXABAY,
          huggingFaceApiKey: parsedState.huggingFaceApiKey || DEFAULT_API_KEYS.HUGGING_FACE,
          // 검증 상태도 안전하게 설정
          isApiKeyValidated: parsedState.isApiKeyValidated ?? true,
          isPixabayApiKeyValidated: parsedState.isPixabayApiKeyValidated ?? true,
          isHuggingFaceApiKeyValidated: parsedState.isHuggingFaceApiKeyValidated ?? true,
        };
      }
    } catch (error) {
      console.error('Failed to load app state:', error);
    }
    return defaultAppState;
  });

  const saveAppState = (newState: Partial<AppState>) => {
    const updatedState = { ...appState, ...newState };
    setAppState(updatedState);
    
    try {
      localStorage.setItem('blog_app_state_v2', JSON.stringify(updatedState));
      console.log('💾 앱 상태 저장 완료:', Object.keys(newState));
    } catch (error) {
      console.error('Failed to save app state:', error);
    }
  };

  const resetAppState = () => {
    console.log('🔄 앱 상태 초기화 시작');
    setAppState(defaultAppState);
    try {
      localStorage.removeItem('blog_app_state_v2');
      localStorage.removeItem('blog_editor_content_permanent_v3');
      window.dispatchEvent(new CustomEvent('app-reset'));
      console.log('✅ 앱 상태 초기화 완료');
    } catch (error) {
      console.error('Failed to reset app state:', error);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('blog_app_state_v2', JSON.stringify(appState));
    } catch (error) {
      console.error('Failed to save app state:', error);
    }
  }, [appState]);

  return { appState, saveAppState, resetAppState };
};
