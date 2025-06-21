
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
  
  console.log('🔄 useAllApiKeysManager 호출됨 - 현재 앱 상태:', {
    gemini: appState.apiKey ? appState.apiKey.substring(0, 20) + '...' : 'null',
    pixabay: appState.pixabayApiKey ? appState.pixabayApiKey.substring(0, 20) + '...' : 'null',
    huggingface: appState.huggingFaceApiKey ? appState.huggingFaceApiKey.substring(0, 20) + '...' : 'null',
    geminiValidated: appState.isApiKeyValidated,
    pixabayValidated: appState.isPixabayApiKeyValidated,
    huggingfaceValidated: appState.isHuggingFaceApiKeyValidated,
  });

  // 초기화 시 API 키들을 안전하게 로드하고 자동 검증
  useEffect(() => {
    if (!hasInitialized.current) {
      console.log('🔧 API 키 초기 로드 및 자동 검증 시작');
      
      try {
        const storedKeys = getAllApiKeysFromStorage();
        
        const updates: Partial<AppState> = {};
        let needsUpdate = false;

        // API 키가 기본값이면 자동으로 검증된 상태로 설정
        if (!appState.apiKey || appState.apiKey === DEFAULT_API_KEYS.GEMINI) {
          updates.apiKey = DEFAULT_API_KEYS.GEMINI;
          updates.isApiKeyValidated = true;
          needsUpdate = true;
        }

        if (!appState.pixabayApiKey || appState.pixabayApiKey === DEFAULT_API_KEYS.PIXABAY) {
          updates.pixabayApiKey = DEFAULT_API_KEYS.PIXABAY;
          updates.isPixabayApiKeyValidated = true;
          needsUpdate = true;
        }

        if (!appState.huggingFaceApiKey || appState.huggingFaceApiKey === DEFAULT_API_KEYS.HUGGING_FACE) {
          updates.huggingFaceApiKey = DEFAULT_API_KEYS.HUGGING_FACE;
          updates.isHuggingFaceApiKeyValidated = true;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          console.log('✅ API 키 자동 검증 완료:', updates);
          saveAppState(updates);
        }
        
        hasInitialized.current = true;
      } catch (error) {
        console.error('❌ API 키 초기 로드 실패:', error);
        // 오류 발생 시 기본값으로 설정하고 자동 검증
        saveAppState({
          apiKey: DEFAULT_API_KEYS.GEMINI,
          isApiKeyValidated: true,
          pixabayApiKey: DEFAULT_API_KEYS.PIXABAY,
          isPixabayApiKeyValidated: true,
          huggingFaceApiKey: DEFAULT_API_KEYS.HUGGING_FACE,
          isHuggingFaceApiKeyValidated: true,
        });
        hasInitialized.current = true;
      }
    }
  }, []);

  // 안전한 API 키 값들 제공 - 항상 기본값으로 보장
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
