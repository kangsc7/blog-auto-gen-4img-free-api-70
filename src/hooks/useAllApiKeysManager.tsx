
import { useGeminiManager } from '@/hooks/useGeminiManager';
import { usePixabayManager } from '@/hooks/usePixabayManager';
import { useHuggingFaceManager } from '@/hooks/useHuggingFaceManager';
import { AppState } from '@/types';

interface UseAllApiKeysManagerProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
}

export const useAllApiKeysManager = ({ appState, saveAppState }: UseAllApiKeysManagerProps) => {
  const geminiManager = useGeminiManager({
    initialApiKey: appState.apiKey,
    initialValidated: appState.isApiKeyValidated,
    onApiKeyChange: (key) => saveAppState({ apiKey: key }),
    onValidationChange: (validated) => saveAppState({ isApiKeyValidated: validated }),
  });

  const pixabayManager = usePixabayManager({
    initialApiKey: appState.pixabayApiKey,
    initialValidated: appState.isPixabayApiKeyValidated,
    onApiKeyChange: (key) => saveAppState({ pixabayApiKey: key }),
    onValidationChange: (validated) => saveAppState({ isPixabayApiKeyValidated: validated }),
  });

  const huggingFaceManager = useHuggingFaceManager({
    initialApiKey: appState.huggingFaceApiKey,
    initialValidated: appState.isHuggingFaceApiKeyValidated,
    onApiKeyChange: (key) => saveAppState({ huggingFaceApiKey: key }),
    onValidationChange: (validated) => saveAppState({ isHuggingFaceApiKeyValidated: validated }),
  });

  return {
    geminiManager,
    pixabayManager,
    huggingFaceManager,
  };
};
