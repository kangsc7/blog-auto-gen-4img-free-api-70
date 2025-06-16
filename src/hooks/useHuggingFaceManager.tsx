
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_API_KEYS } from '@/config/apiKeys';

export const useHuggingFaceManager = () => {
    const { toast } = useToast();
    const [huggingFaceApiKey, setHuggingFaceApiKey] = useState(DEFAULT_API_KEYS.HUGGING_FACE);
    const [isHuggingFaceApiKeyValidated, setIsHuggingFaceApiKeyValidated] = useState(true);
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
            if (data.auth?.accessToken?.role !== 'read' && data.auth?.accessToken?.role !== 'write') {
                throw new Error('유효하지 않은 API 키입니다.');
            }

            setIsHuggingFaceApiKeyValidated(true);
            if (!silent) toast({ title: "Hugging Face API 키 검증 성공", description: "성공적으로 연결되었습니다." });
            return true;
        } catch (error) {
            setIsHuggingFaceApiKeyValidated(false);
            if (!silent) {
                toast({ title: "Hugging Face API 키 검증 실패", description: `키가 유효하지 않거나 문제가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`, variant: "destructive" });
            }
            return false;
        } finally {
            setIsHuggingFaceValidating(false);
        }
    }, [toast]);

    // 컴포넌트 마운트 시 즉시 기본 키로 설정하고 검증
    useEffect(() => {
        setHuggingFaceApiKey(DEFAULT_API_KEYS.HUGGING_FACE);
        setIsHuggingFaceApiKeyValidated(true);
        console.log('HuggingFace API 키 기본값으로 자동 설정됨');
    }, []);

    const handleSetHuggingFaceApiKey = (key: string) => {
        setHuggingFaceApiKey(key);
        setIsHuggingFaceApiKeyValidated(false);
    };

    return {
        huggingFaceApiKey,
        setHuggingFaceApiKey: handleSetHuggingFaceApiKey,
        isHuggingFaceApiKeyValidated,
        setIsHuggingFaceApiKeyValidated,
        isHuggingFaceValidating,
        validateHuggingFaceApiKey: () => validateHuggingFaceApiKeyCallback(huggingFaceApiKey),
        deleteHuggingFaceApiKeyFromStorage: () => {
            setHuggingFaceApiKey(DEFAULT_API_KEYS.HUGGING_FACE);
            setIsHuggingFaceApiKeyValidated(true);
            toast({ title: "기본값으로 복원", description: "Hugging Face API 키가 기본값으로 복원되었습니다." });
        },
    };
};
