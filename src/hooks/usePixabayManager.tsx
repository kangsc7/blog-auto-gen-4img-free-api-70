
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_API_KEYS } from '@/config/apiKeys';
import { saveValidationStatusToStorage } from '@/lib/apiKeyStorage';

interface UsePixabayManagerProps {
  initialApiKey?: string;
  initialValidated?: boolean;
  onApiKeyChange?: (key: string) => void;
  onValidationChange?: (validated: boolean) => void;
}

export const usePixabayManager = (props?: UsePixabayManagerProps) => {
    const { toast } = useToast();
    const [pixabayApiKey, setPixabayApiKey] = useState(props?.initialApiKey || DEFAULT_API_KEYS.PIXABAY);
    const [isPixabayApiKeyValidated, setIsPixabayApiKeyValidated] = useState(props?.initialValidated ?? true);
    const [isPixabayValidating, setIsPixabayValidating] = useState(false);

    console.log('🖼️ usePixabayManager 초기화:', {
      initialApiKey: props?.initialApiKey?.substring(0, 20) + '...',
      initialValidated: props?.initialValidated,
      currentKey: pixabayApiKey?.substring(0, 20) + '...',
      currentValidated: isPixabayApiKeyValidated
    });

    // 외부에서 전달된 초기값이 변경되면 내부 상태도 즉시 업데이트
    useEffect(() => {
      if (props?.initialApiKey !== undefined && props.initialApiKey !== pixabayApiKey) {
        console.log('🔄 Pixabay API 키 동기화:', props.initialApiKey?.substring(0, 20) + '...');
        setPixabayApiKey(props.initialApiKey);
      }
    }, [props?.initialApiKey]);

    useEffect(() => {
      if (props?.initialValidated !== undefined && props.initialValidated !== isPixabayApiKeyValidated) {
        console.log('🔄 Pixabay API 키 검증 상태 동기화:', props.initialValidated);
        setIsPixabayApiKeyValidated(props.initialValidated);
      }
    }, [props?.initialValidated]);

    const validatePixabayApiKeyCallback = useCallback(async (key: string, silent = false): Promise<boolean> => {
        if (!key.trim()) {
            if (!silent) toast({ title: "API 키 오류", description: "Pixabay API 키를 입력해주세요.", variant: "destructive" });
            return false;
        }
        
        console.log('🔍 Pixabay API 키 검증 시작:', key.substring(0, 20) + '...');
        setIsPixabayValidating(true);
        
        try {
            const testUrl = `https://pixabay.com/api/?key=${key}&q=test&image_type=photo&per_page=3`;
            const response = await fetch(testUrl);
            
            console.log('📡 Pixabay API 응답:', response.status, response.statusText);
            
            if (response.status === 400) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Pixabay API 키 오류:', errorData);
                throw new Error('잘못된 API 키');
            }
            
            if (response.status === 429) {
                console.warn('⚠️ Pixabay API 한도 초과, 하지만 키는 유효함');
                // 한도 초과여도 키는 유효하므로 성공으로 처리
            } else if (!response.ok) {
                throw new Error(`네트워크 오류: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ Pixabay API 검증 성공:', data);
            
            setIsPixabayApiKeyValidated(true);
            saveValidationStatusToStorage('PIXABAY', true);
            props?.onValidationChange?.(true);
            
            if (!silent) {
                toast({ 
                  title: "Pixabay API 키 검증 성공", 
                  description: "성공적으로 연결되었습니다.",
                  duration: 3000
                });
            }
            return true;
            
        } catch (error) {
            console.error('❌ Pixabay API 키 검증 실패:', error);
            setIsPixabayApiKeyValidated(false);
            saveValidationStatusToStorage('PIXABAY', false);
            props?.onValidationChange?.(false);
            
            if (!silent) {
                toast({ 
                  title: "Pixabay API 키 검증 실패", 
                  description: `키가 유효하지 않거나 문제가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`, 
                  variant: "destructive",
                  duration: 5000
                });
            }
            return false;
        } finally {
            setIsPixabayValidating(false);
        }
    }, [toast, props]);

    const handleSetPixabayApiKey = (key: string) => {
        console.log('🔑 Pixabay API 키 설정:', key.substring(0, 20) + '...');
        setPixabayApiKey(key);
        setIsPixabayApiKeyValidated(false);
        saveValidationStatusToStorage('PIXABAY', false);
        props?.onApiKeyChange?.(key);
        props?.onValidationChange?.(false);
    };

    // 기본 키인 경우 자동 검증
    useEffect(() => {
      if (pixabayApiKey === DEFAULT_API_KEYS.PIXABAY && !isPixabayApiKeyValidated) {
        console.log('🔧 기본 Pixabay 키 자동 검증 시작');
        validatePixabayApiKeyCallback(pixabayApiKey, true);
      }
    }, [pixabayApiKey, isPixabayApiKeyValidated, validatePixabayApiKeyCallback]);

    return {
        pixabayApiKey,
        setPixabayApiKey: handleSetPixabayApiKey,
        isPixabayApiKeyValidated,
        setIsPixabayApiKeyValidated,
        isPixabayValidating,
        validatePixabayApiKey: (key: string) => validatePixabayApiKeyCallback(key),
        deletePixabayApiKeyFromStorage: () => {
            console.log('🔄 Pixabay API 키 기본값 복원');
            setPixabayApiKey(DEFAULT_API_KEYS.PIXABAY);
            setIsPixabayApiKeyValidated(true);
            saveValidationStatusToStorage('PIXABAY', true);
            props?.onApiKeyChange?.(DEFAULT_API_KEYS.PIXABAY);
            props?.onValidationChange?.(true);
            toast({ title: "기본값으로 복원", description: "Pixabay API 키가 기본값으로 복원되었습니다." });
        },
    };
};
