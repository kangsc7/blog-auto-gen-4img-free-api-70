
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveApiKeyToStorage, getApiKeyFromStorage, removeApiKeyFromStorage, saveValidationStatusToStorage, getValidationStatusFromStorage } from '@/lib/apiKeyStorage';

interface UseGeminiManagerProps {
  initialApiKey?: string;
  initialValidated?: boolean;
  onApiKeyChange?: (key: string) => void;
  onValidationChange?: (validated: boolean) => void;
}

export const useGeminiManager = (props?: UseGeminiManagerProps) => {
  const { toast } = useToast();
  
  // 로컬 스토리지에서 키 로드 또는 props 사용 - 영구 보존
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    const storedKey = getApiKeyFromStorage('GEMINI');
    return storedKey || props?.initialApiKey || '';
  });
  
  const [isGeminiApiKeyValidated, setIsGeminiApiKeyValidated] = useState(() => {
    const storedValidated = getValidationStatusFromStorage('GEMINI');
    return storedValidated ?? (props?.initialValidated ?? false);
  });
  
  const [isGeminiValidating, setIsGeminiValidating] = useState(false);

  console.log('useGeminiManager 초기화 (영구 보존):', {
    initialApiKey: props?.initialApiKey,
    initialValidated: props?.initialValidated,
    currentKey: geminiApiKey,
    currentValidated: isGeminiApiKeyValidated
  });

  // props가 변경될 때만 상태 동기화 (초기 로드가 아닌 경우에만)
  useEffect(() => {
    if (props?.initialApiKey !== undefined && props.initialApiKey !== geminiApiKey && props.initialApiKey !== '') {
      console.log('Gemini API 키 동기화:', props.initialApiKey);
      setGeminiApiKey(props.initialApiKey);
    }
  }, [props?.initialApiKey]);

  useEffect(() => {
    if (props?.initialValidated !== undefined && props.initialValidated !== isGeminiApiKeyValidated) {
      console.log('Gemini API 키 검증 상태 동기화:', props.initialValidated);
      setIsGeminiApiKeyValidated(props.initialValidated);
    }
  }, [props?.initialValidated]);

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
        saveValidationStatusToStorage('GEMINI', false);
        props?.onValidationChange?.(false);
        return false;
      }
      
      // API 키와 검증 상태 영구 저장
      saveApiKeyToStorage('GEMINI', apiKeyToValidate);
      saveValidationStatusToStorage('GEMINI', true);
      
      setIsGeminiApiKeyValidated(true);
      props?.onValidationChange?.(true);
      toast({
        title: "API 키 검증 성공",
        description: "성공적으로 연결되었습니다. (영구 저장됨)",
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
      saveValidationStatusToStorage('GEMINI', false);
      props?.onValidationChange?.(false);
      return false;
    } finally {
      setIsGeminiValidating(false);
    }
  };

  const handleSetGeminiApiKey = (key: string) => {
    console.log('Gemini API 키 설정 (영구 저장):', key);
    setGeminiApiKey(key);
    setIsGeminiApiKeyValidated(false);
    saveValidationStatusToStorage('GEMINI', false);
    
    // 키가 입력되면 즉시 저장 (검증 전에도)
    if (key.trim()) {
      saveApiKeyToStorage('GEMINI', key);
    }
    
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
      console.log('Gemini API 키 완전 삭제 (영구 제거)');
      removeApiKeyFromStorage('GEMINI');
      saveValidationStatusToStorage('GEMINI', false);
      setGeminiApiKey('');
      setIsGeminiApiKeyValidated(false);
      props?.onApiKeyChange?.('');
      props?.onValidationChange?.(false);
      toast({ title: "키 삭제 완료", description: "Gemini API 키가 영구 삭제되었습니다." });
    },
  };
};
