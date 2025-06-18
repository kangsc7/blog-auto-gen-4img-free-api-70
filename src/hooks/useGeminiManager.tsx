
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveApiKeyToStorage, getApiKeyFromStorage, removeApiKeyFromStorage, saveValidationStatusToStorage } from '@/lib/apiKeyStorage';

interface UseGeminiManagerProps {
  initialApiKey?: string;
  initialValidated?: boolean;
  onApiKeyChange?: (key: string) => void;
  onValidationChange?: (validated: boolean) => void;
}

export const useGeminiManager = (props?: UseGeminiManagerProps) => {
  const { toast } = useToast();
  
  // 로컬 스토리지에서 키 로드 또는 props 사용
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    const storedKey = getApiKeyFromStorage('GEMINI');
    return storedKey || props?.initialApiKey || '';
  });
  
  const [isGeminiApiKeyValidated, setIsGeminiApiKeyValidated] = useState(() => {
    const storedValidated = localStorage.getItem('gemini_validated');
    return storedValidated ? storedValidated === 'true' : (props?.initialValidated ?? false);
  });
  
  const [isGeminiValidating, setIsGeminiValidating] = useState(false);

  console.log('useGeminiManager 초기화:', {
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

  // 실제 Gemini API 연결 테스트 함수
  const testGeminiConnection = async (apiKey: string): Promise<boolean> => {
    try {
      console.log('🔍 Gemini API 실제 연결 테스트 시작...');
      
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
      
      const testPrompt = {
        contents: [{ parts: [{ text: "Hello" }] }],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0.1,
        },
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPrompt),
        signal: AbortSignal.timeout(10000), // 10초 타임아웃
      });

      console.log('📡 Gemini API 테스트 응답:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ Gemini API 테스트 실패:', errorData);
        
        if (response.status === 401) {
          throw new Error('API 키가 유효하지 않습니다. 올바른 Gemini API 키를 입력해주세요.');
        } else if (response.status === 403) {
          throw new Error('API 키 권한이 없습니다. API 키 설정을 확인해주세요.');
        } else if (response.status === 429) {
          throw new Error('API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          throw new Error(`API 연결 실패: ${response.status} - ${errorData?.error?.message || response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Gemini API 테스트 성공:', data);
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('API 응답 형식이 올바르지 않습니다.');
      }

      return true;
    } catch (error) {
      console.error('❌ Gemini API 연결 테스트 오류:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('API 연결 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.');
        }
        throw error;
      }
      
      throw new Error('알 수 없는 오류가 발생했습니다.');
    }
  };

  const validateGeminiApiKey = async (key?: string): Promise<boolean> => {
    const apiKeyToValidate = key || geminiApiKey;
    
    if (!apiKeyToValidate.trim()) {
      toast({ title: "API 키 오류", description: "API 키를 입력해주세요.", variant: "destructive" });
      return false;
    }
    
    // API 키 형식 검증 강화
    if (!apiKeyToValidate.startsWith('AIza') || apiKeyToValidate.length < 35) {
      toast({
        title: "API 키 형식 오류",
        description: "올바른 Gemini API 키 형식이 아닙니다. 'AIza'로 시작하는 39자리 키를 입력해주세요.",
        variant: "destructive"
      });
      setIsGeminiApiKeyValidated(false);
      saveValidationStatusToStorage('GEMINI', false);
      props?.onValidationChange?.(false);
      return false;
    }
    
    setIsGeminiValidating(true);
    
    try {
      // 실제 API 연결 테스트 수행
      await testGeminiConnection(apiKeyToValidate);
      
      // API 키 저장
      saveApiKeyToStorage('GEMINI', apiKeyToValidate);
      saveValidationStatusToStorage('GEMINI', true);
      
      setIsGeminiApiKeyValidated(true);
      props?.onValidationChange?.(true);
      toast({
        title: "API 키 검증 성공",
        description: "Gemini API에 성공적으로 연결되었습니다.",
      });
      return true;
    } catch (error) {
      console.error('Gemini API 키 검증 실패:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'API 키 검증 중 오류가 발생했습니다.';
      
      toast({
        title: "API 키 검증 실패",
        description: errorMessage,
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
    console.log('Gemini API 키 설정:', key);
    setGeminiApiKey(key);
    setIsGeminiApiKeyValidated(false);
    saveValidationStatusToStorage('GEMINI', false);
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
    testGeminiConnection, // 추가: 직접 연결 테스트 함수
    deleteGeminiApiKeyFromStorage: () => {
      console.log('Gemini API 키 완전 삭제');
      removeApiKeyFromStorage('GEMINI');
      localStorage.removeItem('gemini_validated');
      setGeminiApiKey('');
      setIsGeminiApiKeyValidated(false);
      props?.onApiKeyChange?.('');
      props?.onValidationChange?.(false);
      toast({ title: "키 삭제 완료", description: "Gemini API 키가 삭제되었습니다." });
    },
  };
};
