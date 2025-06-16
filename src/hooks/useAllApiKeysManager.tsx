
import { useGeminiManager } from '@/hooks/useGeminiManager';
import { usePixabayManager } from '@/hooks/usePixabayManager';
import { useHuggingFaceManager } from '@/hooks/useHuggingFaceManager';
import { AppState } from '@/types';
import { useEffect } from 'react';

interface UseAllApiKeysManagerProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
}

export const useAllApiKeysManager = ({ appState, saveAppState }: UseAllApiKeysManagerProps) => {
  console.log('useAllApiKeysManager 호출됨 - 현재 앱 상태:', {
    gemini: appState.apiKey,
    pixabay: appState.pixabayApiKey,
    huggingface: appState.huggingFaceApiKey,
    geminiValidated: appState.isApiKeyValidated,
    pixabayValidated: appState.isPixabayApiKeyValidated,
    huggingfaceValidated: appState.isHuggingFaceApiKeyValidated
  });

  const geminiManager = useGeminiManager({
    initialApiKey: appState.apiKey,
    initialValidated: appState.isApiKeyValidated,
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
    initialApiKey: appState.pixabayApiKey,
    initialValidated: appState.isPixabayApiKeyValidated,
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
    initialApiKey: appState.huggingFaceApiKey,
    initialValidated: appState.isHuggingFaceApiKeyValidated,
    onApiKeyChange: (key) => {
      console.log('HuggingFace API 키 변경됨:', key);
      saveAppState({ huggingFaceApiKey: key });
    },
    onValidationChange: (validated) => {
      console.log('HuggingFace API 키 검증 상태 변경됨:', validated);
      saveAppState({ isHuggingFaceApiKeyValidated: validated });
    },
  });

  // 매니저 상태가 제대로 초기화되었는지 확인
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
