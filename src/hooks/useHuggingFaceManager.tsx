
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_API_KEYS } from '@/config/apiKeys';
import { saveValidationStatusToStorage } from '@/lib/apiKeyStorage';

interface UseHuggingFaceManagerProps {
  initialApiKey?: string;
  initialValidated?: boolean;
  onApiKeyChange?: (key: string) => void;
  onValidationChange?: (validated: boolean) => void;
}

export const useHuggingFaceManager = (props?: UseHuggingFaceManagerProps) => {
    const { toast } = useToast();
    const [huggingFaceApiKey, setHuggingFaceApiKey] = useState(props?.initialApiKey || DEFAULT_API_KEYS.HUGGING_FACE);
    const [isHuggingFaceApiKeyValidated, setIsHuggingFaceApiKeyValidated] = useState(props?.initialValidated ?? true);
    const [isHuggingFaceValidating, setIsHuggingFaceValidating] = useState(false);

    console.log('🤗 useHuggingFaceManager 초기화:', {
      initialApiKey: props?.initialApiKey?.substring(0, 20) + '...',
      initialValidated: props?.initialValidated,
      currentKey: huggingFaceApiKey?.substring(0, 20) + '...',
      currentValidated: isHuggingFaceApiKeyValidated
    });

    // 외부에서 전달된 초기값이 변경되면 내부 상태도 즉시 업데이트
    useEffect(() => {
      if (props?.initialApiKey !== undefined && props.initialApiKey !== huggingFaceApiKey) {
        console.log('🔄 HuggingFace API 키 동기화:', props.initialApiKey?.substring(0, 20) + '...');
        setHuggingFaceApiKey(props.initialApiKey);
      }
    }, [props?.initialApiKey]);

    useEffect(() => {
      if (props?.initialValidated !== undefined && props.initialValidated !== isHuggingFaceApiKeyValidated) {
        console.log('🔄 HuggingFace API 키 검증 상태 동기화:', props.initialValidated);
        setIsHuggingFaceApiKeyValidated(props.initialValidated);
      }
    }, [props?.initialValidated]);

    const validateHuggingFaceApiKeyCallback = useCallback(async (key: string, silent = false) => {
        if (!key.trim()) {
            if (!silent) toast({ title: "API 키 오류", description: "Hugging Face API 키를 입력해주세요.", variant: "destructive" });
            return false;
        }
        
        console.log('🔍 HuggingFace API 키 검증 시작:', key.substring(0, 20) + '...');
        setIsHuggingFaceValidating(true);
        
        try {
            const response = await fetch('https://huggingface.co/api/whoami-v2', {
                headers: {
                    'Authorization': `Bearer ${key}`
                }
            });

            console.log('📡 HuggingFace API 응답:', response.status, response.statusText);

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
            console.log('✅ HuggingFace API 검증 성공:', data);
            
            if (data.auth?.accessToken?.role !== 'read' && data.auth?.accessToken?.role !== 'write') {
                throw new Error('유효하지 않은 API 키입니다.');
            }

            setIsHuggingFaceApiKeyValidated(true);
            saveValidationStatusToStorage('huggingface', true);
            props?.onValidationChange?.(true);
            
            if (!silent) {
                toast({ 
                  title: "Hugging Face API 키 검증 성공", 
                  description: "성공적으로 연결되었습니다.",
                  duration: 3000
                });
            }
            return true;
            
        } catch (error) {
            console.error('❌ HuggingFace API 키 검증 실패:', error);
            setIsHuggingFaceApiKeyValidated(false);
            saveValidationStatusToStorage('huggingface', false);
            props?.onValidationChange?.(false);
            
            if (!silent) {
                toast({ 
                  title: "Hugging Face API 키 검증 실패", 
                  description: `키가 유효하지 않거나 문제가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`, 
                  variant: "destructive",
                  duration: 5000
                });
            }
            return false;
        } finally {
            setIsHuggingFaceValidating(false);
        }
    }, [toast, props]);

    const handleSetHuggingFaceApiKey = (key: string) => {
        console.log('🔑 HuggingFace API 키 설정:', key.substring(0, 20) + '...');
        setHuggingFaceApiKey(key);
        setIsHuggingFaceApiKeyValidated(false);
        saveValidationStatusToStorage('huggingface', false);
        props?.onApiKeyChange?.(key);
        props?.onValidationChange?.(false);
    };

    // 기본 키인 경우 자동 검증
    useEffect(() => {
      if (huggingFaceApiKey === DEFAULT_API_KEYS.HUGGING_FACE && !isHuggingFaceApiKeyValidated) {
        console.log('🔧 기본 HuggingFace 키 자동 검증 시작');
        validateHuggingFaceApiKeyCallback(huggingFaceApiKey, true);
      }
    }, [huggingFaceApiKey, isHuggingFaceApiKeyValidated, validateHuggingFaceApiKeyCallback]);

    return {
        huggingFaceApiKey,
        setHuggingFaceApiKey: handleSetHuggingFaceApiKey,
        isHuggingFaceApiKeyValidated,
        setIsHuggingFaceApiKeyValidated,
        isHuggingFaceValidating,
        validateHuggingFaceApiKey: () => validateHuggingFaceApiKeyCallback(huggingFaceApiKey),
        deleteHuggingFaceApiKeyFromStorage: () => {
            console.log('🔄 HuggingFace API 키 기본값 복원');
            setHuggingFaceApiKey(DEFAULT_API_KEYS.HUGGING_FACE);
            setIsHuggingFaceApiKeyValidated(true);
            saveValidationStatusToStorage('huggingface', true);
            props?.onApiKeyChange?.(DEFAULT_API_KEYS.HUGGING_FACE);
            props?.onValidationChange?.(true);
            toast({ title: "기본값으로 복원", description: "Hugging Face API 키가 기본값으로 복원되었습니다." });
        },
    };
};
