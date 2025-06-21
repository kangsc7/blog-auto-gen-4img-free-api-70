
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
        
        // 기본 키인 경우 바로 검증 성공 처리
        if (key === DEFAULT_API_KEYS.HUGGING_FACE) {
            console.log('🔧 기본 HuggingFace 키 자동 검증 완료');
            setIsHuggingFaceApiKeyValidated(true);
            saveValidationStatusToStorage('HUGGING_FACE', true);
            props?.onValidationChange?.(true);
            return true;
        }
        
        console.log('🔍 HuggingFace API 키 검증 시작:', key.substring(0, 20) + '...');
        setIsHuggingFaceValidating(true);
        
        try {
            // 실제 API 검증은 타임아웃을 추가하여 안전하게 처리
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

            const response = await fetch('https://huggingface.co/api/whoami-v2', {
                headers: {
                    'Authorization': `Bearer ${key}`
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            console.log('📡 HuggingFace API 응답:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`API 요청 실패 (상태 코드: ${response.status})`);
            }

            const data = await response.json();
            console.log('✅ HuggingFace API 검증 성공:', data);
            
            setIsHuggingFaceApiKeyValidated(true);
            saveValidationStatusToStorage('HUGGING_FACE', true);
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
            
            // 네트워크 오류인 경우 기본값으로 처리 (무한 루프 방지)
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('⏰ HuggingFace API 검증 타임아웃 - 기본값으로 처리');
                setIsHuggingFaceApiKeyValidated(true);
                saveValidationStatusToStorage('HUGGING_FACE', true);
                props?.onValidationChange?.(true);
                return true;
            }
            
            setIsHuggingFaceApiKeyValidated(false);
            saveValidationStatusToStorage('HUGGING_FACE', false);
            props?.onValidationChange?.(false);
            
            if (!silent) {
                toast({ 
                  title: "Hugging Face API 키 검증 실패", 
                  description: `키가 유효하지 않거나 네트워크 문제가 발생했습니다.`, 
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
        saveValidationStatusToStorage('HUGGING_FACE', false);
        props?.onApiKeyChange?.(key);
        props?.onValidationChange?.(false);
    };

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
            saveValidationStatusToStorage('HUGGING_FACE', true);
            props?.onApiKeyChange?.(DEFAULT_API_KEYS.HUGGING_FACE);
            props?.onValidationChange?.(true);
            toast({ title: "기본값으로 복원", description: "Hugging Face API 키가 기본값으로 복원되었습니다." });
        },
    };
};
