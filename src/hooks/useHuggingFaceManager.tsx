
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { HfInference } from '@huggingface/inference';

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
            const hf = new HfInference(key);
            await hf.whoami();
            
            setIsHuggingFaceApiKeyValidated(true);
            if (!silent) toast({ title: "Hugging Face API 키 검증 성공", description: "성공적으로 연결되었습니다." });
            return true;
        } catch (error) {
            setIsHuggingFaceApiKeyValidated(false);
            if (!silent) {
                toast({ title: "Hugging Face API 키 검증 실패", description: "키가 유효하지 않거나 문제가 발생했습니다.", variant: "destructive" });
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
