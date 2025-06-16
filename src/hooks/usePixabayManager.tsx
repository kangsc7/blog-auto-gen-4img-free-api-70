
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_API_KEYS } from '@/config/apiKeys';

export const usePixabayManager = () => {
    const { toast } = useToast();
    const [pixabayApiKey, setPixabayApiKey] = useState(DEFAULT_API_KEYS.PIXABAY);
    const [isPixabayApiKeyValidated, setIsPixabayApiKeyValidated] = useState(true);
    const [isPixabayValidating, setIsPixabayValidating] = useState(false);

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
            if (!silent) toast({ title: "Pixabay API 키 검증 성공", description: "성공적으로 연결되었습니다." });
            return true;
        } catch (error) {
            setIsPixabayApiKeyValidated(false);
            if (!silent) {
                toast({ title: "Pixabay API 키 검증 실패", description: `키가 유효하지 않거나 문제가 발생했습니다.`, variant: "destructive" });
            }
            return false;
        } finally {
            setIsPixabayValidating(false);
        }
    }, [toast]);

    // 컴포넌트 마운트 시 즉시 기본 키로 설정하고 검증
    useEffect(() => {
        setPixabayApiKey(DEFAULT_API_KEYS.PIXABAY);
        setIsPixabayApiKeyValidated(true);
        console.log('Pixabay API 키 기본값으로 자동 설정됨');
    }, []);

    const handleSetPixabayApiKey = (key: string) => {
        setPixabayApiKey(key);
        setIsPixabayApiKeyValidated(false);
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
            toast({ title: "기본값으로 복원", description: "Pixabay API 키가 기본값으로 복원되었습니다." });
        },
    };
};
