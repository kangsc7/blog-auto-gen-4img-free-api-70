
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
            const response = await fetch('https://api-inference.huggingface.co/whoami-v2', {
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
                const role = data.auth?.accessToken?.role || '알 수 없음';
                throw new Error(`API 키의 권한이 부족합니다. 현재 권한: '${role}'. 'read' 또는 'write' 권한이 필요합니다.`);
            }

            setIsHuggingFaceApiKeyValidated(true);
            if (!silent) toast({ title: "Hugging Face API 키 검증 성공", description: "성공적으로 연결되었습니다." });
            return true;
        } catch (error) {
            setIsHuggingFaceApiKeyValidated(false);
            if (!silent) {
                const description = error instanceof Error ? error.message : "키가 유효하지 않거나 문제가 발생했습니다.";
                toast({ title: "Hugging Face API 키 검증 실패", description, variant: "destructive" });
            }
            return false;
        } finally {
            setIsHuggingFaceValidating(false);
        }
    }, [toast]);

    useEffect(() => {
        const savedKey = localStorage.getItem('hugging_face_api_key') || '';
        if (savedKey) {
            setHuggingFaceApiKey(savedKey);
            validateHuggingFaceApiKeyCallback(savedKey, true);
        }
    }, [validateHuggingFaceApiKeyCallback]);

    const saveHuggingFaceApiKeyToStorage = () => {
        if (!huggingFaceApiKey.trim()) {
            toast({ title: "저장 오류", description: "Hugging Face API 키를 입력해주세요.", variant: "destructive" });
            return;
        }
        localStorage.setItem('hugging_face_api_key', huggingFaceApiKey);
        toast({ title: "저장 완료", description: "Hugging Face API 키가 브라우저에 저장되었습니다." });
        validateHuggingFaceApiKeyCallback(huggingFaceApiKey);
    };

    const deleteHuggingFaceApiKeyFromStorage = () => {
        localStorage.removeItem('hugging_face_api_key');
        setHuggingFaceApiKey('');
        setIsHuggingFaceApiKeyValidated(false);
        toast({ title: "삭제 완료", description: "저장된 Hugging Face API 키가 삭제되었습니다." });
    };
    
    const handleSetHuggingFaceApiKey = (key: string) => {
        setHuggingFaceApiKey(key);
        setIsHuggingFaceApiKeyValidated(false);
    };

    return {
        huggingFaceApiKey,
        setHuggingFaceApiKey: handleSetHuggingFaceApiKey,
        isHuggingFaceApiKeyValidated,
        isHuggingFaceValidating,
        validateHuggingFaceApiKey: () => validateHuggingFaceApiKeyCallback(huggingFaceApiKey),
        saveHuggingFaceApiKeyToStorage,
        deleteHuggingFaceApiKeyFromStorage,
    };
};
