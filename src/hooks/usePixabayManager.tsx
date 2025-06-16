
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_API_KEYS } from '@/config/apiKeys';

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

    // 외부에서 전달된 초기값이 변경되면 내부 상태도 업데이트
    useEffect(() => {
      if (props?.initialApiKey && props.initialApiKey !== pixabayApiKey) {
        setPixabayApiKey(props.initialApiKey);
        console.log('Pixabay API 키 동기화:', props.initialApiKey);
      }
    }, [props?.initialApiKey]);

    useEffect(() => {
      if (props?.initialValidated !== undefined && props.initialValidated !== isPixabayApiKeyValidated) {
        setIsPixabayApiKeyValidated(props.initialValidated);
        console.log('Pixabay API 키 검증 상태 동기화:', props.initialValidated);
      }
    }, [props?.initialValidated]);

    const validatePixabayApiKeyCallback = useCallback(async (key: string, silent = false): Promise<boolean> => {
        if (!key.trim()) {
            if (!silent) toast({ title: "API 키 오류", description: "Pixabay API 키를 입력해주세요.", variant: "destructive" });
            return false;
        }
        setIsPixabayValidating(true);
        try {
            const response = await fetch(`https://pixabay.com/api/?key=${key}&q=test`);
            if (response.status === 400) throw new Error('잘못된 API 키');
            if (!response.ok) throw new Error(`네트워크 오류: ${response.statusText}`);
            
            setIsPixabayApiKeyValidated(true);
            props?.onValidationChange?.(true);
            if (!silent) toast({ title: "Pixabay API 키 검증 성공", description: "성공적으로 연결되었습니다." });
            return true;
        } catch (error) {
            setIsPixabayApiKeyValidated(false);
            props?.onValidationChange?.(false);
            if (!silent) {
                toast({ title: "Pixabay API 키 검증 실패", description: `키가 유효하지 않거나 문제가 발생했습니다.`, variant: "destructive" });
            }
            return false;
        } finally {
            setIsPixabayValidating(false);
        }
    }, [toast, props]);

    const handleSetPixabayApiKey = (key: string) => {
        setPixabayApiKey(key);
        setIsPixabayApiKeyValidated(false);
        props?.onApiKeyChange?.(key);
        props?.onValidationChange?.(false);
    };

    return {
        pixabayApiKey,
        setPixabayApiKey: handleSetPixabayApiKey,
        isPixabayApiKeyValidated,
        setIsPixabayApiKeyValidated,
        isPixabayValidating,
        validatePixabayApiKey: (key: string) => validatePixabayApiKeyCallback(key),
        deletePixabayApiKeyFromStorage: () => {
            setPixabayApiKey(DEFAULT_API_KEYS.PIXABAY);
            setIsPixabayApiKeyValidated(true);
            props?.onApiKeyChange?.(DEFAULT_API_KEYS.PIXABAY);
            props?.onValidationChange?.(true);
            toast({ title: "기본값으로 복원", description: "Pixabay API 키가 기본값으로 복원되었습니다." });
        },
    };
};
