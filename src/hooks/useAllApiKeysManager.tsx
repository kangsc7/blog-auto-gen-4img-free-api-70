
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
  const syncLock = useRef(false);
  
  console.log('🔄 useAllApiKeysManager 호출됨 - 현재 앱 상태:', {
    gemini: appState.apiKey?.substring(0, 20) + '...',
    pixabay: appState.pixabayApiKey?.substring(0, 20) + '...',
    huggingface: appState.huggingfaceApiKey?.substring(0, 20) + '...',
    geminiValidated: appState.isApiKeyValidated,
    pixabayValidated: appState.isPixabayApiKeyValidated,
    huggingfaceValidated: appState.isHuggingfaceApiKeyValidated,
    hasInitialized: hasInitialized.current
  });

  // API 키 초기값 설정 - 더 안전한 방식으로 개선
  useEffect(() => {
    if (!hasInitialized.current && !syncLock.current) {
      console.log('🔧 API 키 상태 검증 및 동기화 시작');
      syncLock.current = true;
      
      // 현재 상태가 유효한지 확인
      const needsUpdate = 
        !appState.apiKey || 
        !appState.pixabayApiKey || 
        !appState.huggingfaceApiKey;

      if (needsUpdate) {
        console.log('⚠️ API 키 누락 감지, 기본값으로 설정');
        hasInitialized.current = true;
        
        const updates: Partial<AppState> = {};
        
        if (!appState.apiKey) {
          updates.apiKey = DEFAULT_API_KEYS.GEMINI;
          updates.isApiKeyValidated = true;
        }
        if (!appState.pixabayApiKey) {
          updates.pixabayApiKey = DEFAULT_API_KEYS.PIXABAY;
          updates.isPixabayApiKeyValidated = true;
        }
        if (!appState.huggingfaceApiKey) {
          updates.huggingfaceApiKey = DEFAULT_API_KEYS.HUGGING_FACE;
          updates.isHuggingfaceApiKeyValidated = true;
        }
        
        if (Object.keys(updates).length > 0) {
          console.log('✅ API 키 기본값 설정:', updates);
          saveAppState(updates);
        }
      } else {
        console.log('✅ 모든 API 키가 이미 설정되어 있음');
        hasInitialized.current = true;
      }
      
      syncLock.current = false;
    }
  }, [appState.apiKey, appState.pixabayApiKey, appState.huggingfaceApiKey, saveAppState]);

  const geminiManager = useGeminiManager({
    initialApiKey: appState.apiKey || DEFAULT_API_KEYS.GEMINI,
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
    initialApiKey: appState.pixabayApiKey || DEFAULT_API_KEYS.PIXABAY,
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
    initialApiKey: appState.huggingfaceApiKey || DEFAULT_API_KEYS.HUGGING_FACE,
    initialValidated: appState.isHuggingfaceApiKeyValidated ?? true,
    onApiKeyChange: (key) => {
      console.log('🤗 HuggingFace API 키 변경됨:', key.substring(0, 20) + '...');
      saveAppState({ huggingfaceApiKey: key });
    },
    onValidationChange: (validated) => {
      console.log('✅ HuggingFace API 키 검증 상태 변경됨:', validated);
      saveAppState({ isHuggingfaceApiKeyValidated: validated });
    },
  });

  // 매니저 상태 실시간 모니터링
  useEffect(() => {
    console.log('📊 API 키 매니저들 현재 상태 확인:', {
      gemini: { 
        key: geminiManager.geminiApiKey?.substring(0, 20) + '...', 
        validated: geminiManager.isGeminiApiKeyValidated,
        isDefault: geminiManager.geminiApiKey === DEFAULT_API_KEYS.GEMINI
      },
      pixabay: { 
        key: pixabayManager.pixabayApiKey?.substring(0, 20) + '...', 
        validated: pixabayManager.isPixabayApiKeyValidated,
        isDefault: pixabayManager.pixabayApiKey === DEFAULT_API_KEYS.PIXABAY
      },
      huggingface: { 
        key: huggingFaceManager.huggingFaceApiKey?.substring(0, 20) + '...', 
        validated: huggingFaceManager.isHuggingFaceApiKeyValidated,
        isDefault: huggingFaceManager.huggingFaceApiKey === DEFAULT_API_KEYS.HUGGING_FACE
      }
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
