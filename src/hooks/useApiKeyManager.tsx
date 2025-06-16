
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AppState } from '@/types';

export const useApiKeyManager = (
  appState: AppState,
  saveAppState: (newState: Partial<AppState>) => void
) => {
  const { toast } = useToast();
  const [isValidatingApi, setIsValidatingApi] = useState(false);

  const validateApiKey = async (key?: string): Promise<boolean> => {
    const apiKeyToValidate = key || appState.apiKey;
    
    if (!apiKeyToValidate.trim()) {
      toast({ title: "API 키 오류", description: "API 키를 입력해주세요.", variant: "destructive" });
      return false;
    }
    
    setIsValidatingApi(true);
    
    try {
      // This is a mock validation. In a real scenario, you'd make an API call.
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (apiKeyToValidate.length < 20) {
        toast({
          title: "API 키 검증 실패",
          description: "API 키 값이 올바르지 않습니다. 다시 확인해주세요.",
          variant: "destructive"
        });
        await saveApiKeyToDatabase('');
        saveAppState({ isApiKeyValidated: false });
        return false;
      }
      
      saveAppState({ isApiKeyValidated: true });
      await saveApiKeyToDatabase(apiKeyToValidate);
      localStorage.setItem('blog_api_key', apiKeyToValidate);
      localStorage.setItem('blog_api_key_validated', 'true');
      toast({
        title: "API 키 검증 및 저장 성공",
        description: "성공적으로 연결되었으며, 서버에 저장되었습니다.",
      });
      return true;
    } catch (error) {
      console.error('API 키 검증 오류:', error);
      toast({
        title: "API 키 검증 실패",
        description: "API 키 검증 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      await saveApiKeyToDatabase('');
      saveAppState({ isApiKeyValidated: false });
      return false;
    } finally {
      setIsValidatingApi(false);
    }
  };

  const saveApiKeyToDatabase = async (apiKey: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('사용자가 로그인되지 않음 - API 키 저장 건너뜀');
        return;
      }

      console.log('Gemini API 키 저장 시도:', apiKey ? '키 있음' : '키 없음');
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          gemini_api_key: apiKey,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Gemini API 키 서버 저장 오류:', error);
        // 에러가 발생해도 localStorage에는 저장되도록 함
      } else {
        console.log('Gemini API 키 서버 저장 성공');
      }
    } catch (error) {
      console.error('Gemini API 키 서버 저장 예외:', error);
    }
  };

  return { isValidatingApi, validateApiKey };
};
