
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const usePixabayManager = () => {
    const { toast } = useToast();
    const [pixabayApiKey, setPixabayApiKey] = useState('');
    const [isPixabayApiKeyValidated, setIsPixabayApiKeyValidated] = useState(false);
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
            localStorage.setItem('pixabay_api_key', key);
            if (!silent) toast({ title: "Pixabay API 키 검증 및 저장 성공", description: "성공적으로 연결되었으며, 키가 브라우저에 저장되었습니다." });
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

    useEffect(() => {
        const savedKey = localStorage.getItem('pixabay_api_key') || '';
        if (savedKey) {
            setPixabayApiKey(savedKey);
            validatePixabayApiKeyCallback(savedKey, true);
        }
    }, [validatePixabayApiKeyCallback]);

    const deletePixabayApiKeyFromStorage = () => {
        localStorage.removeItem('pixabay_api_key');
        setPixabayApiKey('');
        setIsPixabayApiKeyValidated(false);
        toast({ title: "삭제 완료", description: "저장된 Pixabay API 키가 삭제되었습니다." });
    };
    
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
        deletePixabayApiKeyFromStorage,
    };
};
