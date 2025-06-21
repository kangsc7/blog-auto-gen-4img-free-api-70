
import { useState, useEffect } from 'react';
import { AppState } from '@/types';

const defaultAppState: AppState = {
  currentUser: '',
  keyword: '',
  topics: [],
  selectedTopic: '',
  generatedContent: '',
  apiKey: null,
  isApiKeyValidated: false,
  imagePrompt: '',
  pixabayApiKey: null,
  isPixabayApiKeyValidated: false,
  huggingFaceApiKey: null,
  isHuggingFaceApiKeyValidated: false,
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
        return { ...defaultAppState, ...parsedState };
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
    } catch (error) {
      console.error('Failed to save app state:', error);
    }
  };

  const resetAppState = () => {
    setAppState(defaultAppState);
    try {
      localStorage.removeItem('blog_app_state_v2');
      localStorage.removeItem('blog_editor_content_permanent_v3');
      window.dispatchEvent(new CustomEvent('app-reset'));
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
