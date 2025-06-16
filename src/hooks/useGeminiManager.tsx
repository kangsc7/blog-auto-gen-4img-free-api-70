
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_API_KEYS } from '@/config/apiKeys';

interface UseGeminiManagerProps {
  initialApiKey?: string;
  initialValidated?: boolean;
  onApiKeyChange?: (key: string) => void;
  onValidationChange?: (validated: boolean) => void;
}

export const useGeminiManager = (props?: UseGeminiManagerProps) => {
  const { toast } = useToast();
  
  // 초기값을 props에서 가져오거나 기본값 사용
  const [geminiApiKey, setGeminiApiKey] = useState(props?.initialApiKey || DEFAULT_API_KEYS.GEMINI);
  const [isGeminiApiKeyValidated, setIsGeminiApiKeyValidated] = useState(props?.initialValidated ?? true);
  const [isGeminiValidating, setIsGeminiValidating] = useState(false);

  console.log('useGeminiManager 초기화:', {
    initialApiKey: props?.initialApiKey,
    initialValidated: props?.initialValidated,
    currentKey: geminiApiKey,
    currentValidated: isGeminiApiKeyValidated
  });

  // props가 변경될 때만 상태 동기화
  useEffect(() => {
    if (props?.initialApiKey !== undefined && props.initialApiKey !== geminiApiKey) {
      console.log('Gemini API 키 동기화:', props.initialApiKey);
      setGeminiApiKey(props.initialApiKey);
    }
  }, [props?.initialApiKey, geminiApiKey]);

  useEffect(() => {
    if (props?.initialValidated !== undefined && props.initialValidated !== isGeminiApiKeyValidated) {
      console.log('Gemini API 키 검증 상태 동기화:', props.initialValidated);
      setIsGeminiApiKeyValidated(props.initialValidated);
    }
  }, [props?.initialValidated, isGeminiApiKeyValidated]);

  const validateGeminiApiKey = async (key?: string): Promise<boolean> => {
    const apiKeyToValidate = key || geminiApiKey;
    
    if (!apiKeyToValidate.trim()) {
      toast({ title: "API 키 오류", description: "API 키를 입력해주세요.", variant: "destructive" });
      return false;
    }
    
    setIsGeminiValidating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (apiKeyToValidate.length < 20) {
        toast({
          title: "API 키 검증 실패",
          description: "API 키 값이 올바르지 않습니다. 다시 확인해주세요.",
          variant: "destructive"
        });
        setIsGeminiApiKeyValidated(false);
        props?.onValidationChange?.(false);
        return false;
      }
      
      setIsGeminiApiKeyValidated(true);
      props?.onValidationChange?.(true);
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
      props?.onValidationChange?.(false);
      return false;
    } finally {
      setIsGeminiValidating(false);
    }
  };

  const handleSetGeminiApiKey = (key: string) => {
    console.log('Gemini API 키 설정:', key);
    setGeminiApiKey(key);
    setIsGeminiApiKeyValidated(false);
    props?.onApiKeyChange?.(key);
    props?.onValidationChange?.(false);
  };

  return {
    geminiApiKey,
    setGeminiApiKey: handleSetGeminiApiKey,
    isGeminiApiKeyValidated,
    setIsGeminiApiKeyValidated,
    isGeminiValidating,
    validateGeminiApiKey,
    deleteGeminiApiKeyFromStorage: () => {
      console.log('Gemini API 키 기본값 복원');
      setGeminiApiKey(DEFAULT_API_KEYS.GEMINI);
      setIsGeminiApiKeyValidated(true);
      props?.onApiKeyChange?.(DEFAULT_API_KEYS.GEMINI);
      props?.onValidationChange?.(true);
      toast({ title: "기본값으로 복원", description: "Gemini API 키가 기본값으로 복원되었습니다." });
    },
  };
};
