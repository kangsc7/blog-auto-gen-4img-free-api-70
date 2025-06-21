
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

export const useApiKeyManager = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void
) => {
  const { toast } = useToast();
  const [isValidatingApi, setIsValidatingApi] = useState(false);

  const validateApiKey = async (): Promise<boolean> => {
    if (!appState.apiKey.trim()) {
      toast({ title: "API 키 오류", description: "API 키를 입력해주세요.", variant: "destructive" });
      return false;
    }
    
    setIsValidatingApi(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (appState.apiKey.length < 20) {
        toast({
          title: "API 키 검증 실패",
          description: "API 키 값이 올바르지 않습니다. 다시 확인해주세요.",
          variant: "destructive"
        });
        saveAppState({ isApiKeyValidated: false });
        return false;
      }
      
      saveAppState({ isApiKeyValidated: true });
      toast({
        title: "API 키 검증 성공",
        description: "API 키가 성공적으로 확인되었습니다.",
      });
      return true;
    } catch (error) {
      console.error('API 키 검증 오류:', error);
      toast({
        title: "API 키 검증 실패",
        description: "API 키 검증 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      saveAppState({ isApiKeyValidated: false });
      return false;
    } finally {
      setIsValidatingApi(false);
    }
  };

  return { isValidatingApi, validateApiKey };
};
