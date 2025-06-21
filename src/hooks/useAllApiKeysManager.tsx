
import { useGeminiManager } from '@/hooks/useGeminiManager';
import { usePixabayManager } from '@/hooks/usePixabayManager';
import { useHuggingFaceManager } from '@/hooks/useHuggingFaceManager';
import { AppState } from '@/types';
import { useEffect, useRef } from 'react';
import { DEFAULT_API_KEYS } from '@/config/apiKeys';
import { getAllApiKeysFromStorage } from '@/lib/apiKeyStorage';

interface UseAllApiKeysManagerProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
}

export const useAllApiKeysManager = (props: UseAllApiKeysManagerProps) => {
  const { appState, saveAppState } = props;
  const hasInitialized = useRef(false);
  const syncLock = useRef(false);
  
  console.log('🔄 useAllApiKeysManager 호출됨 - 현재 앱 상태:', {
    gemini: appState.apiKey ? appState.apiKey.substring(0, 20) + '...' : 'null',
    pixabay: appState.pixabayApiKey ? appState.pixabayApiKey.substring(0, 20) + '...' : 'null',
    huggingface: appState.huggingFaceApiKey ? appState.huggingFaceApiKey.substring(0, 20) + '...' : 'null',
    geminiValidated: appState.isApiKeyValidated,
    pixabayValidated: appState.isPixabayApiKeyValidated,
    huggingfaceValidated: appState.isHuggingFaceApiKeyValidated,
    hasInitialized: hasInitialized.current
  });

  // 초기화 시 로컬 스토리지에서 API 키들을 안전하게 로드
  useEffect(() => {
    if (!hasInitialized.current && !syncLock.current) {
      console.log('🔧 API 키 초기 로드 시작');
      syncLock.current = true;
      
      try {
        const storedKeys = getAllApiKeysFromStorage();
        
        const updates: Partial<AppState> = {};
        let needsUpdate = false;

        // Gemini API 키 처리
        if (!appState.apiKey && storedKeys.geminiKey) {
          updates.apiKey = storedKeys.geminiKey;
          updates.isApiKeyValidated = storedKeys.geminiValidated;
          needsUpdate = true;
        } else if (!appState.apiKey) {
          updates.apiKey = DEFAULT_API_KEYS.GEMINI;
          updates.isApiKeyValidated = true;
          needsUpdate = true;
        }

        // Pixabay API 키 처리
        if (!appState.pixabayApiKey && storedKeys.pixabayKey) {
          updates.pixabayApiKey = storedKeys.pixabayKey;
          updates.isPixabayApiKeyValidated = storedKeys.pixabayValidated;
          needsUpdate = true;
        } else if (!appState.pixabayApiKey) {
          updates.pixabayApiKey = DEFAULT_API_KEYS.PIXABAY;
          updates.isPixabayApiKeyValidated = true;
          needsUpdate = true;
        }

        // HuggingFace API 키 처리
        if (!appState.huggingFaceApiKey && storedKeys.huggingFaceKey) {
          updates.huggingFaceApiKey = storedKeys.huggingFaceKey;
          updates.isHuggingFaceApiKeyValidated = storedKeys.huggingFaceValidated;
          needsUpdate = true;
        } else if (!appState.huggingFaceApiKey) {
          updates.huggingFaceApiKey = DEFAULT_API_KEYS.HUGGING_FACE;
          updates.isHuggingFaceApiKeyValidated = true;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          console.log('✅ API 키 초기값 설정:', updates);
          saveAppState(updates);
        }
        
        hasInitialized.current = true;
      } catch (error) {
        console.error('❌ API 키 초기 로드 실패:', error);
        // 오류 발생 시 기본값으로 설정
        saveAppState({
          apiKey: DEFAULT_API_KEYS.GEMINI,
          isApiKeyValidated: true,
          pixabayApiKey: DEFAULT_API_KEYS.PIXABAY,
          isPixabayApiKeyValidated: true,
          huggingFaceApiKey: DEFAULT_API_KEYS.HUGGING_FACE,
          isHuggingFaceApiKeyValidated: true,
        });
        hasInitialized.current = true;
      } finally {
        syncLock.current = false;
      }
    }
  }, []);

  // 안전한 API 키 값들 제공
  const safeApiKey = appState.apiKey || DEFAULT_API_KEYS.GEMINI;
  const safePixabayKey = appState.pixabayApiKey || DEFAULT_API_KEYS.PIXABAY;
  const safeHuggingFaceKey = appState.huggingFaceApiKey || DEFAULT_API_KEYS.HUGGING_FACE;

  const geminiManager = useGeminiManager({
    initialApiKey: safeApiKey,
    initialValidated: appState.isApiKeyValidated ?? true,
    onApiKeyChange: (key) => {
      console.log('🔑 Gemini API 키 변경됨:', key.substring(0, 20) + '...');
      saveAppState({ apiKey: key });
    },
    onValidationChange: (validated) => {
      console.log('✅ Gemini API 키 검증 상태 변경됨:', validated);
      saveAppState({ isApiKeyValidated: validated });
    },
  });

  const pixabayManager = usePixabayManager({
    initialApiKey: safePixabayKey,
    initialValidated: appState.isPixabayApiKeyValidated ?? true,
    onApiKeyChange: (key) => {
      console.log('🖼️ Pixabay API 키 변경됨:', key.substring(0, 20) + '...');
      saveAppState({ pixabayApiKey: key });
    },
    onValidationChange: (validated) => {
      console.log('✅ Pixabay API 키 검증 상태 변경됨:', validated);
      saveAppState({ isPixabayApiKeyValidated: validated });
    },
  });

  const huggingFaceManager = useHuggingFaceManager({
    initialApiKey: safeHuggingFaceKey,
    initialValidated: appState.isHuggingFaceApiKeyValidated ?? true,
    onApiKeyChange: (key) => {
      console.log('🤗 HuggingFace API 키 변경됨:', key.substring(0, 20) + '...');
      saveAppState({ huggingFaceApiKey: key });
    },
    onValidationChange: (validated) => {
      console.log('✅ HuggingFace API 키 검증 상태 변경됨:', validated);
      saveAppState({ isHuggingFaceApiKeyValidated: validated });
    },
  });

  return {
    geminiManager,
    pixabayManager,
    huggingFaceManager,
  };
};
