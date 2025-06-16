
import React from 'react';
import { ApiKeyManager } from '@/components/control/ApiKeyManager';
import { PixabayApiKeyManager } from '@/components/control/PixabayApiKeyManager';
import { HuggingFaceApiKeyManager } from '@/components/control/HuggingFaceApiKeyManager';
import { AppState } from '@/types';

interface ApiKeysSectionProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  isValidatingApi: boolean;
  validateApiKey: (key: string) => Promise<boolean>;
  deleteApiKeyFromStorage: () => void;
  pixabayManager: {
    pixabayApiKey: string;
    setPixabayApiKey: (key: string) => void;
    isPixabayApiKeyValidated: boolean;
    setIsPixabayApiKeyValidated: (validated: boolean) => void;
    validatePixabayApiKey: (key: string) => Promise<boolean>;
    deletePixabayApiKeyFromStorage: () => void;
  };
  huggingFaceManager: {
    huggingFaceApiKey: string;
    setHuggingFaceApiKey: (key: string) => void;
    isHuggingFaceApiKeyValidated: boolean;
    setIsHuggingFaceApiKeyValidated: (validated: boolean) => void;
    validateHuggingFaceApiKey: (key: string) => Promise<boolean>;
    deleteHuggingFaceApiKeyFromStorage: () => void;
  };
}

export const ApiKeysSection: React.FC<ApiKeysSectionProps> = ({
  appState,
  saveAppState,
  isValidatingApi,
  validateApiKey,
  deleteApiKeyFromStorage,
  pixabayManager,
  huggingFaceManager,
}) => {
  return (
    <div className="container mx-auto mt-20 relative z-50">
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <div className="relative z-50">
          <ApiKeyManager
            apiKey={appState.apiKey}
            setApiKey={(key) => saveAppState({ apiKey: key })}
            isApiKeyValidated={appState.isApiKeyValidated}
            setIsApiKeyValidated={(validated) => saveAppState({ isApiKeyValidated: validated })}
            isValidatingApi={isValidatingApi}
            validateApiKey={validateApiKey}
            deleteApiKeyFromStorage={deleteApiKeyFromStorage}
          />
        </div>
        
        <div className="relative z-50">
          <PixabayApiKeyManager
            pixabayApiKey={pixabayManager.pixabayApiKey}
            setPixabayApiKey={pixabayManager.setPixabayApiKey}
            isPixabayApiKeyValidated={pixabayManager.isPixabayApiKeyValidated}
            setIsPixabayApiKeyValidated={pixabayManager.setIsPixabayApiKeyValidated}
            validatePixabayApiKey={pixabayManager.validatePixabayApiKey}
            deletePixabayApiKeyFromStorage={pixabayManager.deletePixabayApiKeyFromStorage}
          />
        </div>
        
        <div className="relative z-50">
          <HuggingFaceApiKeyManager
            huggingFaceApiKey={huggingFaceManager.huggingFaceApiKey}
            setHuggingFaceApiKey={huggingFaceManager.setHuggingFaceApiKey}
            isHuggingFaceApiKeyValidated={huggingFaceManager.isHuggingFaceApiKeyValidated}
            setIsHuggingFaceApiKeyValidated={huggingFaceManager.setIsHuggingFaceApiKeyValidated}
            validateHuggingFaceApiKey={huggingFaceManager.validateHuggingFaceApiKey}
            deleteHuggingFaceApiKeyFromStorage={huggingFaceManager.deleteHuggingFaceApiKeyFromStorage}
          />
        </div>
      </div>
    </div>
  );
};
