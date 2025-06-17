
import { useState, useEffect, useCallback } from 'react';
import { AppState } from '@/types';
import { loadApiKeys, saveApiKeys, clearAllApiKeys } from '@/lib/apiKeyStorage';

const defaultState: AppState = {
  keyword: '',
  topics: [],
  selectedTopic: '',
  generatedContent: '',
  imagePrompt: '',
  apiKey: '',
  isApiKeyValidated: false,
  pixabayApiKey: '',
  isPixabayApiKeyValidated: false,
  huggingfaceApiKey: '',
  isHuggingfaceApiKeyValidated: false,
  colorTheme: '',
  referenceLink: '',
  referenceSentence: '',
  isLoggedIn: false,
  currentUser: '',
  preventDuplicates: true,
  isGeminiLoading: false,
  isPixabayLoading: false,
  isHuggingfaceLoading: false,
  saveReferenceTrigger: false,
  topicCount: 5,
  adsenseCode: '',
  isAdsenseEnabled: false,
};

export const useAppStateManager = () => {
  const [appState, setAppState] = useState<AppState>(defaultState);
  const [preventDuplicates, setPreventDuplicates] = useState(true);

  const syncWithStorage = useCallback(async () => {
    try {
      const storedKeys = await loadApiKeys();
      console.log('Storage와 상태 동기화 시작:', storedKeys);
      
      const updates: Partial<AppState> = {};
      
      if (storedKeys.gemini) {
        updates.apiKey = storedKeys.gemini.key;
        updates.isApiKeyValidated = storedKeys.gemini.isValidated;
      }
      
      if (storedKeys.pixabay) {
        updates.pixabayApiKey = storedKeys.pixabay.key;
        updates.isPixabayApiKeyValidated = storedKeys.pixabay.isValidated;
      }
      
      if (storedKeys.huggingface) {
        updates.huggingfaceApiKey = storedKeys.huggingface.key;
        updates.isHuggingfaceApiKeyValidated = storedKeys.huggingface.isValidated;
      }

      if (storedKeys.adsense) {
        updates.adsenseCode = storedKeys.adsense.code;
        updates.isAdsenseEnabled = storedKeys.adsense.isEnabled;
      }
      
      if (Object.keys(updates).length > 0) {
        setAppState(prev => ({ ...prev, ...updates }));
        console.log('상태 동기화 완료:', updates);
      }
    } catch (error) {
      console.error('Storage 동기화 오류:', error);
    }
  }, []);

  useEffect(() => {
    syncWithStorage();
  }, [syncWithStorage]);

  const saveAppState = useCallback(async (newState: Partial<AppState>) => {
    setAppState(prev => {
      const updated = { ...prev, ...newState };
      console.log('앱 상태 업데이트:', newState);
      return updated;
    });

    try {
      const currentKeys = await loadApiKeys();
      let needsSave = false;

      if (newState.apiKey !== undefined || newState.isApiKeyValidated !== undefined) {
        const currentGemini = currentKeys.gemini;
        currentKeys.gemini = {
          key: newState.apiKey ?? currentGemini?.key ?? '',
          isValidated: newState.isApiKeyValidated ?? currentGemini?.isValidated ?? false,
          timestamp: currentGemini?.timestamp ?? Date.now(),
          lastValidation: (newState.isApiKeyValidated ?? currentGemini?.isValidated) ? Date.now() : (currentGemini?.lastValidation ?? 0)
        };
        needsSave = true;
      }

      if (newState.pixabayApiKey !== undefined || newState.isPixabayApiKeyValidated !== undefined) {
        const currentPixabay = currentKeys.pixabay;
        currentKeys.pixabay = {
          key: newState.pixabayApiKey ?? currentPixabay?.key ?? '',
          isValidated: newState.isPixabayApiKeyValidated ?? currentPixabay?.isValidated ?? false,
          timestamp: currentPixabay?.timestamp ?? Date.now(),
          lastValidation: (newState.isPixabayApiKeyValidated ?? currentPixabay?.isValidated) ? Date.now() : (currentPixabay?.lastValidation ?? 0)
        };
        needsSave = true;
      }

      if (newState.huggingfaceApiKey !== undefined || newState.isHuggingfaceApiKeyValidated !== undefined) {
        const currentHuggingface = currentKeys.huggingface;
        currentKeys.huggingface = {
          key: newState.huggingfaceApiKey ?? currentHuggingface?.key ?? '',
          isValidated: newState.isHuggingfaceApiKeyValidated ?? currentHuggingface?.isValidated ?? false,
          timestamp: currentHuggingface?.timestamp ?? Date.now(),
          lastValidation: (newState.isHuggingfaceApiKeyValidated ?? currentHuggingface?.isValidated) ? Date.now() : (currentHuggingface?.lastValidation ?? 0)
        };
        needsSave = true;
      }

      if (newState.adsenseCode !== undefined || newState.isAdsenseEnabled !== undefined) {
        const currentAdsense = currentKeys.adsense;
        currentKeys.adsense = {
          code: newState.adsenseCode ?? currentAdsense?.code ?? '',
          isEnabled: newState.isAdsenseEnabled ?? currentAdsense?.isEnabled ?? false,
          timestamp: Date.now()
        };
        needsSave = true;
      }

      if (needsSave) {
        await saveApiKeys(currentKeys);
      }
    } catch (error) {
      console.error('API 키 저장 오류:', error);
    }
  }, []);

  const deleteApiKeyFromStorage = useCallback(async (service: 'gemini' | 'pixabay' | 'huggingface') => {
    try {
      const currentKeys = await loadApiKeys();
      delete currentKeys[service];
      await saveApiKeys(currentKeys);
      
      const stateUpdates: Partial<AppState> = {};
      if (service === 'gemini') {
        stateUpdates.apiKey = '';
        stateUpdates.isApiKeyValidated = false;
      } else if (service === 'pixabay') {
        stateUpdates.pixabayApiKey = '';
        stateUpdates.isPixabayApiKeyValidated = false;
      } else if (service === 'huggingface') {
        stateUpdates.huggingfaceApiKey = '';
        stateUpdates.isHuggingfaceApiKeyValidated = false;
      }
      
      saveAppState(stateUpdates);
      console.log(`${service} API 키 삭제 완료`);
    } catch (error) {
      console.error(`${service} API 키 삭제 오류:`, error);
    }
  }, [saveAppState]);

  const resetApp = useCallback(async () => {
    try {
      await clearAllApiKeys();
      setAppState(defaultState);
      setPreventDuplicates(true);
      console.log('앱 초기화 완료');
    } catch (error) {
      console.error('앱 초기화 오류:', error);
    }
  }, []);

  return {
    appState,
    saveAppState,
    deleteApiKeyFromStorage,
    resetApp,
    preventDuplicates,
    setPreventDuplicates,
    syncWithStorage,
  };
};
