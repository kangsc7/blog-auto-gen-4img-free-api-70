
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
    onApiKeyChange: (key: string) => saveAppState({ apiKey: key }),
    onValidationChange: (validated: boolean) => saveAppState({ isApiKeyValidated: validated }),
  });

  const pixabayManager = usePixabayManager({
    initialApiKey: appState.pixabayApiKey,
    initialValidated: appState.isPixabayKeyValidated,
    onApiKeyChange: (key: string) => saveAppState({ pixabayApiKey: key }),
    onValidationChange: (validated: boolean) => saveAppState({ isPixabayKeyValidated: validated }),
  });

  const huggingFaceManager = useHuggingFaceManager({
    initialApiKey: appState.huggingFaceApiKey,
    initialValidated: appState.isHuggingFaceKeyValidated,
    onApiKeyChange: (key: string) => saveAppState({ huggingFaceApiKey: key }),
    onValidationChange: (validated: boolean) => saveAppState({ isHuggingFaceKeyValidated: validated }),
  });

  return {
    geminiManager,
    pixabayManager,
    huggingFaceManager,
  };
};
