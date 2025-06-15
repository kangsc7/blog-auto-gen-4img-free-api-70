
import React from 'react';
import { ApiKeyManager } from '@/components/control/ApiKeyManager';
import { PixabayApiKeyManager } from '@/components/control/PixabayApiKeyManager';
import { AppState } from '@/types';
import { usePixabayManager } from '@/hooks/usePixabayManager';

interface ApiKeysSectionProps {
    appState: AppState;
    saveAppState: (newState: Partial<AppState>) => void;
    isValidatingApi: boolean;
    validateApiKey: () => Promise<boolean>;
    saveApiKeyToStorage: () => void;
    deleteApiKeyFromStorage: () => void;
    pixabayManager: ReturnType<typeof usePixabayManager>;
}

export const ApiKeysSection: React.FC<ApiKeysSectionProps> = ({
    appState,
    saveAppState,
    isValidatingApi,
    validateApiKey,
    saveApiKeyToStorage,
    deleteApiKeyFromStorage,
    pixabayManager,
}) => {
    return (
        <div className="max-w-7xl mx-auto my-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ApiKeyManager
                appState={appState}
                saveAppState={saveAppState}
                isValidatingApi={isValidatingApi}
                validateApiKey={validateApiKey}
                saveApiKeyToStorage={saveApiKeyToStorage}
                deleteApiKeyFromStorage={deleteApiKeyFromStorage}
            />
            <PixabayApiKeyManager
                apiKey={pixabayManager.pixabayApiKey}
                setApiKey={pixabayManager.setPixabayApiKey}
                isValidated={pixabayManager.isPixabayApiKeyValidated}
                isValidating={pixabayManager.isPixabayValidating}
                validateApiKey={pixabayManager.validatePixabayApiKey}
                saveApiKey={pixabayManager.savePixabayApiKeyToStorage}
                deleteApiKey={pixabayManager.deletePixabayApiKeyFromStorage}
            />
        </div>
    );
};
