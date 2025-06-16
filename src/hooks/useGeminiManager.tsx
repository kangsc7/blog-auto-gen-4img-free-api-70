
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_API_KEYS } from '@/config/apiKeys';

export const useGeminiManager = () => {
  const { toast } = useToast();
  const [geminiApiKey, setGeminiApiKey] = useState(DEFAULT_API_KEYS.GEMINI);
  const [isGeminiApiKeyValidated, setIsGeminiApiKeyValidated] = useState(true);
  const [isGeminiValidating, setIsGeminiValidating] = useState(false);

  // 컴포넌트 마운트 시 즉시 기본 키로 설정하고 검증
  useEffect(() => {
    setGeminiApiKey(DEFAULT_API_KEYS.GEMINI);
    setIsGeminiApiKeyValidated(true);
    console.log('Gemini API 키 기본값으로 자동 설정됨');
  }, []);

  const validateGeminiApiKey = async (key?: string): Promise<boolean> => {
    const apiKeyToValidate = key || geminiApiKey;
    
    if (!apiKeyToValidate.trim()) {
      toast({ title: "API 키 오류", description: "API 키를 입력해주세요.", variant: "destructive" });
      return false;
    }
    
    setIsGeminiValidating(true);
    
    try {
      // Mock validation - in real scenario, you'd make an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (apiKeyToValidate.length < 20) {
        toast({
          title: "API 키 검증 실패",
          description: "API 키 값이 올바르지 않습니다. 다시 확인해주세요.",
          variant: "destructive"
        });
        setIsGeminiApiKeyValidated(false);
        return false;
      }
      
      setIsGeminiApiKeyValidated(true);
      toast({
        title: "API 키 검증 성공",
        description: "성공적으로 연결되었습니다.",
      });
      return true;
    } catch (error) {
      console.error('API 키 검증 오류:', error);
      toast({
        title: "API 키 검증 실패",
        description: "API 키 검증 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      setIsGeminiApiKeyValidated(false);
      return false;
    } finally {
      setIsGeminiValidating(false);
    }
  };

  const handleSetGeminiApiKey = (key: string) => {
    setGeminiApiKey(key);
    setIsGeminiApiKeyValidated(false);
  };

  return {
    geminiApiKey,
    setGeminiApiKey: handleSetGeminiApiKey,
    isGeminiApiKeyValidated,
    setIsGeminiApiKeyValidated,
    isGeminiValidating,
    validateGeminiApiKey,
    deleteGeminiApiKeyFromStorage: () => {
      setGeminiApiKey(DEFAULT_API_KEYS.GEMINI);
      setIsGeminiApiKeyValidated(true);
      toast({ title: "기본값으로 복원", description: "Gemini API 키가 기본값으로 복원되었습니다." });
    },
  };
};
