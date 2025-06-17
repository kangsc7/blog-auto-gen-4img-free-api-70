
import { useGeminiManager } from '@/hooks/useGeminiManager';
import { usePixabayManager } from '@/hooks/usePixabayManager';
import { useHuggingFaceManager } from '@/hooks/useHuggingFaceManager';
import { AppState } from '@/types';
import { useEffect, useRef } from 'react';
import { DEFAULT_API_KEYS } from '@/config/apiKeys';

interface UseAllApiKeysManagerProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
}

export const useAllApiKeysManager = ({ appState, saveAppState }: UseAllApiKeysManagerProps) => {
  const hasInitialized = useRef(false);
  
  console.log('useAllApiKeysManager 호출됨 - 현재 앱 상태:', {
    gemini: appState.apiKey,
    pixabay: appState.pixabayApiKey,
    huggingface: appState.huggingFaceApiKey,
    geminiValidated: appState.isApiKeyValidated,
    pixabayValidated: appState.isPixabayApiKeyValidated,
    huggingfaceValidated: appState.isHuggingFaceApiKeyValidated,
    hasInitialized: hasInitialized.current
  });

  // API 키 초기값 설정 - 한 번만 실행
  useEffect(() => {
    if (!hasInitialized.current && (!appState.apiKey || !appState.pixabayApiKey || !appState.huggingFaceApiKey)) {
      console.log('API 키 누락 감지, 기본값으로 설정 (최초 1회만)');
      hasInitialized.current = true;
      
      saveAppState({
        apiKey: appState.apiKey || DEFAULT_API_KEYS.GEMINI,
        pixabayApiKey: appState.pixabayApiKey || DEFAULT_API_KEYS.PIXABAY,
        huggingFaceApiKey: appState.huggingFaceApiKey || DEFAULT_API_KEYS.HUGGING_FACE,
        isApiKeyValidated: true,
        isPixabayApiKeyValidated: true,
        isHuggingFaceApiKeyValidated: true,
      });
    }
  }, []); // 빈 의존성 배열로 최초 1회만 실행

  const geminiManager = useGeminiManager({
    initialApiKey: appState.apiKey || DEFAULT_API_KEYS.GEMINI,
    initialValidated: appState.isApiKeyValidated ?? true,
    onApiKeyChange: (key) => {
      console.log('Gemini API 키 변경됨:', key);
      saveAppState({ apiKey: key });
    },
    onValidationChange: (validated) => {
      console.log('Gemini API 키 검증 상태 변경됨:', validated);
      saveAppState({ isApiKeyValidated: validated });
    },
  });

  const pixabayManager = usePixabayManager({
    initialApiKey: appState.pixabayApiKey || DEFAULT_API_KEYS.PIXABAY,
    initialValidated: appState.isPixabayApiKeyValidated ?? true,
    onApiKeyChange: (key) => {
      console.log('Pixabay API 키 변경됨:', key);
      saveAppState({ pixabayApiKey: key });
    },
    onValidationChange: (validated) => {
      console.log('Pixabay API 키 검증 상태 변경됨:', validated);
      saveAppState({ isPixabayApiKeyValidated: validated });
    },
  });

  const huggingFaceManager = useHuggingFaceManager({
    initialApiKey: appState.huggingFaceApiKey || DEFAULT_API_KEYS.HUGGING_FACE,
    initialValidated: appState.isHuggingFaceApiKeyValidated ?? true,
    onApiKeyChange: (key) => {
      console.log('HuggingFace API 키 변경됨:', key);
      saveAppState({ huggingFaceApiKey: key });
    },
    onValidationChange: (validated) => {
      console.log('HuggingFace API 키 검증 상태 변경됨:', validated);
      saveAppState({ isHuggingFaceApiKeyValidated: validated });
    },
  });

  // 매니저 상태 확인 (디버깅용)
  useEffect(() => {
    console.log('API 키 매니저들 현재 상태:', {
      gemini: { key: geminiManager.geminiApiKey, validated: geminiManager.isGeminiApiKeyValidated },
      pixabay: { key: pixabayManager.pixabayApiKey, validated: pixabayManager.isPixabayApiKeyValidated },
      huggingface: { key: huggingFaceManager.huggingFaceApiKey, validated: huggingFaceManager.isHuggingFaceApiKeyValidated }
    });
  }, [
    geminiManager.geminiApiKey, geminiManager.isGeminiApiKeyValidated,
    pixabayManager.pixabayApiKey, pixabayManager.isPixabayApiKeyValidated,
    huggingFaceManager.huggingFaceApiKey, huggingFaceManager.isHuggingFaceApiKeyValidated
  ]);

  return {
    geminiManager,
    pixabayManager,
    huggingFaceManager,
  };
};
