
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
            await savePixabayApiKeyToDatabase(key);
            localStorage.setItem('pixabay_api_key', key);
            if (!silent) toast({ title: "Pixabay API 키 검증 및 저장 성공", description: "성공적으로 연결되었으며, 서버에 저장되었습니다." });
            return true;
        } catch (error) {
            setIsPixabayApiKeyValidated(false);
            await savePixabayApiKeyToDatabase('');
            if (!silent) {
                toast({ title: "Pixabay API 키 검증 실패", description: `키가 유효하지 않거나 문제가 발생했습니다.`, variant: "destructive" });
            }
            return false;
        } finally {
            setIsPixabayValidating(false);
        }
    }, [toast]);

    const savePixabayApiKeyToDatabase = async (apiKey: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    pixabay_api_key: apiKey,
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                console.error('Pixabay API 키 서버 저장 오류:', error);
            }
        } catch (error) {
            console.error('Pixabay API 키 서버 저장 오류:', error);
        }
    };

    const loadApiKeysFromDatabase = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log('사용자가 로그인되지 않음 - 기본 Pixabay API 키 사용');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('pixabay_api_key')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('API 키 로드 오류:', error);
                console.log('기본 Pixabay API 키 사용');
                return;
            }

            if (data?.pixabay_api_key) {
                setPixabayApiKey(data.pixabay_api_key);
                validatePixabayApiKeyCallback(data.pixabay_api_key, true);
            } else {
                setPixabayApiKey(DEFAULT_API_KEYS.PIXABAY);
                setIsPixabayApiKeyValidated(true);
            }
        } catch (error) {
            console.error('API 키 로드 오류:', error);
            setPixabayApiKey(DEFAULT_API_KEYS.PIXABAY);
            setIsPixabayApiKeyValidated(true);
        }
    }, [validatePixabayApiKeyCallback]);

    useEffect(() => {
        const savedKey = localStorage.getItem('pixabay_api_key') || DEFAULT_API_KEYS.PIXABAY;
        if (savedKey) {
            setPixabayApiKey(savedKey);
            if (savedKey === DEFAULT_API_KEYS.PIXABAY) {
                setIsPixabayApiKeyValidated(true);
            } else {
                validatePixabayApiKeyCallback(savedKey, true);
            }
        } else {
            loadApiKeysFromDatabase();
        }
    }, [validatePixabayApiKeyCallback, loadApiKeysFromDatabase]);

    const deletePixabayApiKeyFromStorage = () => {
        localStorage.removeItem('pixabay_api_key');
        setPixabayApiKey('');
        setIsPixabayApiKeyValidated(false);
        savePixabayApiKeyToDatabase('');
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
