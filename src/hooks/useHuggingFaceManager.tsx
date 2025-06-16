
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
            await saveHuggingFaceApiKeyToDatabase(key);
            localStorage.setItem('hugging_face_api_key', key);
            if (!silent) toast({ title: "Hugging Face API 키 검증 및 저장 성공", description: "성공적으로 연결되었으며, 서버에 저장되었습니다." });
            return true;
        } catch (error) {
            setIsHuggingFaceApiKeyValidated(false);
            await saveHuggingFaceApiKeyToDatabase('');
            if (!silent) {
                toast({ title: "Hugging Face API 키 검증 실패", description: `키가 유효하지 않거나 문제가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`, variant: "destructive" });
            }
            return false;
        } finally {
            setIsHuggingFaceValidating(false);
        }
    }, [toast]);

    const saveHuggingFaceApiKeyToDatabase = async (apiKey: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    huggingface_api_key: apiKey,
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                console.error('HuggingFace API 키 서버 저장 오류:', error);
            }
        } catch (error) {
            console.error('HuggingFace API 키 서버 저장 오류:', error);
        }
    };

    const loadApiKeysFromDatabase = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log('사용자가 로그인되지 않음 - 기본 HuggingFace API 키 사용');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('huggingface_api_key')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('API 키 로드 오류:', error);
                console.log('기본 HuggingFace API 키 사용');
                return;
            }

            if (data?.huggingface_api_key) {
                setHuggingFaceApiKey(data.huggingface_api_key);
                validateHuggingFaceApiKeyCallback(data.huggingface_api_key, true);
            } else {
                setHuggingFaceApiKey(DEFAULT_API_KEYS.HUGGING_FACE);
                setIsHuggingFaceApiKeyValidated(true);
            }
        } catch (error) {
            console.error('API 키 로드 오류:', error);
            setHuggingFaceApiKey(DEFAULT_API_KEYS.HUGGING_FACE);
            setIsHuggingFaceApiKeyValidated(true);
        }
    }, [validateHuggingFaceApiKeyCallback]);

    useEffect(() => {
        const savedKey = localStorage.getItem('hugging_face_api_key') || DEFAULT_API_KEYS.HUGGING_FACE;
        if (savedKey) {
            setHuggingFaceApiKey(savedKey);
            if (savedKey === DEFAULT_API_KEYS.HUGGING_FACE) {
                setIsHuggingFaceApiKeyValidated(true);
            } else {
                validateHuggingFaceApiKeyCallback(savedKey, true);
            }
        } else {
            loadApiKeysFromDatabase();
        }
    }, [validateHuggingFaceApiKeyCallback, loadApiKeysFromDatabase]);

    const deleteHuggingFaceApiKeyFromStorage = () => {
        localStorage.removeItem('hugging_face_api_key');
        setHuggingFaceApiKey('');
        setIsHuggingFaceApiKeyValidated(false);
        saveHuggingFaceApiKeyToDatabase('');
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
        setIsHuggingFaceApiKeyValidated,
        isHuggingFaceValidating,
        validateHuggingFaceApiKey: () => validateHuggingFaceApiKeyCallback(huggingFaceApiKey),
        deleteHuggingFaceApiKeyFromStorage,
    };
};
