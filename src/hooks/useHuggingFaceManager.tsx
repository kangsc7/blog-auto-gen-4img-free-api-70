
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useHuggingFaceManager = () => {
    const { toast } = useToast();
    const [huggingFaceApiKey, setHuggingFaceApiKey] = useState('');
    const [isHuggingFaceApiKeyValidated, setIsHuggingFaceApiKeyValidated] = useState(false);
    const [isHuggingFaceValidating, setIsHuggingFaceValidating] = useState(false);

    const validateHuggingFaceApiKeyCallback = useCallback(async (key: string, silent = false) => {
        if (!key.trim()) {
            if (!silent) toast({ title: "API 키 오류", description: "Hugging Face API 키를 입력해주세요.", variant: "destructive" });
            return false;
        }
        setIsHuggingFaceValidating(true);
        try {
            const response = await fetch('https://huggingface.co/api/whoami-v2', {
                headers: {
                    'Authorization': `Bearer ${key}`
                }
            });

            if (!response.ok) {
                let errorMessage = `API 요청 실패 (상태 코드: ${response.status})`;
                try {
                    const errorData = await response.json();
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    // JSON 파싱 실패 시 기본 에러 메시지 유지
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            if (data.auth?.accessToken?.role !== 'read' && data.auth?.accessToken?.role !== 'write') {빌드 에러의 원인을 분석해보니 다음과 같은 문제들이 있습니다:

1. `ApiKeyManager`에서 `validateApiKey` 함수 시그니처가 맞지 않음
2. `PixabayApiKeyManager`와 `HuggingFaceApiKeyManager`의 props 구조가 실제 컴포넌트 인터페이스와 맞지 않음
3. 각 매니저들에서 필요한 setter 함수들이 누락됨

각 컴포넌트의 원래 인터페이스에 맞춰서 수정하겠습니다.

<lov-code>
먼저 `ApiKeysSection.tsx`에서 각 API 키 매니저 컴포넌트들의 props를 올바른 형태로 수정해야 합니다:

<lov-write file_path="src/components/sections/ApiKeysSection.tsx">
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
    <div className="container mx-auto mt-20 relative z-[9999]">
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <div className="relative z-[9999] hover:z-[10000]">
          <ApiKeyManager
            appState={appState}
            saveAppState={saveAppState}
            isValidatingApi={isValidatingApi}
            validateApiKey={validateApiKey}
            deleteApiKeyFromStorage={deleteApiKeyFromStorage}
          />
        </div>
        
        <div className="relative z-[9999] hover:z-[10000]">
          <PixabayApiKeyManager
            apiKey={pixabayManager.pixabayApiKey}
            setApiKey={pixabayManager.setPixabayApiKey}
            isValidated={pixabayManager.isPixabayApiKeyValidated}
            isValidating={pixabayManager.isPixabayValidating || false}
            validateApiKey={pixabayManager.validatePixabayApiKey}
            deleteApiKey={pixabayManager.deletePixabayApiKeyFromStorage}
          />
        </div>
        
        <div className="relative z-[9999] hover:z-[10000]">
          <HuggingFaceApiKeyManager
            manager={huggingFaceManager}
          />
        </div>
      </div>
    </div>
  );
};
