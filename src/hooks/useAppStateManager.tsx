import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AppState } from '@/types';

const initialAppState: AppState = {
  isLoggedIn: false,
  currentUser: '',
  apiKey: '',
  isApiKeyValidated: false,
  keyword: '',
  topicCount: 3,
  topics: [],
  selectedTopic: '',
  colorTheme: '',
  referenceLink: '',
  referenceSentence: '',
  generatedContent: '',
  imagePrompt: '',
  imageStyle: '',
  saveReferenceTrigger: false,
};

// Helper function to persist main app state to localStorage
const persistStateToStorage = (state: AppState) => {
  const stateToSave = { ...state };
  delete stateToSave.apiKey;
  delete stateToSave.isApiKeyValidated;
  localStorage.setItem('blog_app_state', JSON.stringify(stateToSave));
};

// Helper function to save reference info to localStorage
const saveReferenceToStorage = (link: string, sentence: string) => {
  localStorage.setItem('blog_reference_link', link);
  localStorage.setItem('blog_reference_sentence', sentence);
};

// Helper function to save preventDuplicates setting to localStorage
const savePreventDuplicatesToStorage = (preventDuplicates: boolean) => {
  localStorage.setItem('blog_prevent_duplicates', JSON.stringify(preventDuplicates));
};

// Helper function to load preventDuplicates setting from localStorage
const loadPreventDuplicatesFromStorage = (): boolean => {
  try {
    const saved = localStorage.getItem('blog_prevent_duplicates');
    return saved !== null ? JSON.parse(saved) : false; // 기본값을 false (중복 허용)로 변경
  } catch (error) {
    console.error('중복 설정 로드 오류:', error);
    return false; // 기본값을 false (중복 허용)로 변경
  }
};

export const useAppStateManager = () => {
  const { toast } = useToast();
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const [preventDuplicates, setPreventDuplicates] = useState(() => loadPreventDuplicatesFromStorage());

  useEffect(() => {
    loadAppState();
  }, []);

  // preventDuplicates 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    savePreventDuplicatesToStorage(preventDuplicates);
    console.log('preventDuplicates 상태 변경:', preventDuplicates);
  }, [preventDuplicates]);

  const loadApiKeysFromDatabase = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('사용자가 로그인되지 않음 - API 키 로드 건너뜀');
        return { apiKey: '', isApiKeyValidated: false };
      }

      console.log('데이터베이스에서 Gemini API 키 로드 시도...');

      const { data, error } = await supabase
        .from('profiles')
        .select('gemini_api_key')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Gemini API 키 로드 오류:', error);
        return { apiKey: '', isApiKeyValidated: false };
      }

      const apiKey = data?.gemini_api_key || '';
      const isApiKeyValidated = !!apiKey;

      console.log('데이터베이스에서 로드된 Gemini API 키:', apiKey ? '키 있음' : '키 없음');

      if (apiKey) {
        localStorage.setItem('blog_api_key', apiKey);
        localStorage.setItem('blog_api_key_validated', isApiKeyValidated.toString());
        console.log('Gemini API 키가 localStorage에 저장됨');
      }

      return { apiKey, isApiKeyValidated };
    } catch (error) {
      console.error('Gemini API 키 로드 예외:', error);
      return { apiKey: '', isApiKeyValidated: false };
    }
  }, []);

  const loadAppState = async () => {
    try {
      const savedState = localStorage.getItem('blog_app_state');
      let parsedState: Partial<AppState> = {};
      if (savedState) {
        parsedState = JSON.parse(savedState);
        delete parsedState.apiKey;
        delete parsedState.isApiKeyValidated;
      }
      
      // 먼저 localStorage에서 확인
      let savedApiKey = localStorage.getItem('blog_api_key') || '';
      let savedApiKeyValidated = localStorage.getItem('blog_api_key_validated') === 'true';

      console.log('localStorage에서 로드된 Gemini API 키:', savedApiKey ? '키 있음' : '키 없음');

      // localStorage에 없으면 데이터베이스에서 로드
      if (!savedApiKey) {
        console.log('localStorage에 API 키가 없음, 데이터베이스에서 로드 시도...');
        const dbApiKeys = await loadApiKeysFromDatabase();
        savedApiKey = dbApiKeys.apiKey;
        savedApiKeyValidated = dbApiKeys.isApiKeyValidated;
      }

      const savedReferenceLink = localStorage.getItem('blog_reference_link') || '';
      const savedReferenceSentence = localStorage.getItem('blog_reference_sentence') || '';

      console.log('최종 API 키 상태:', { 
        hasApiKey: !!savedApiKey, 
        isValidated: savedApiKeyValidated && !!savedApiKey 
      });

      setAppState(prev => ({ 
        ...prev, 
        ...parsedState, 
        apiKey: savedApiKey, 
        isApiKeyValidated: savedApiKeyValidated && !!savedApiKey,
        referenceLink: savedReferenceLink,
        referenceSentence: savedReferenceSentence,
      }));

      // preventDuplicates 설정도 로드
      const savedPreventDuplicates = loadPreventDuplicatesFromStorage();
      setPreventDuplicates(savedPreventDuplicates);
    } catch (error) {
      console.error('앱 상태 로드 오류:', error);
    }
  };

  const saveAppState = useCallback((newState: Partial<AppState>) => {
    setAppState(prevState => {
      try {
        if (newState.saveReferenceTrigger) {
          saveReferenceToStorage(prevState.referenceLink, prevState.referenceSentence);
          toast({ title: "저장 완료", description: "참조 정보가 브라우저에 저장되었습니다." });
          
          const updatedState = { ...prevState, saveReferenceTrigger: false };
          persistStateToStorage(updatedState);
          return updatedState;
        }
        
        let updatedState = { ...prevState, ...newState };

        // 주제 생성 시 키워드가 변경되었다면 기존 주제들을 완전히 삭제
        if (newState.keyword && newState.keyword !== prevState.keyword) {
          console.log('키워드 변경 감지: 기존 주제 삭제');
          updatedState = { 
            ...updatedState, 
            topics: [], 
            selectedTopic: '',
            generatedContent: '' 
          };
        }

        // 간단한 중복 처리 로직 제거 - useTopicGenerator에서 처리
        persistStateToStorage(updatedState);
        return updatedState;

      } catch (error) {
        console.error('앱 상태 저장 오류:', error);
        toast({ title: "저장 실패", description: "상태 저장 중 오류가 발생했습니다.", variant: "destructive" });
        return prevState;
      }
    });
  }, [toast]);

  const deleteApiKeyFromStorage = () => {
    try {
      localStorage.removeItem('blog_api_key');
      localStorage.removeItem('blog_api_key_validated');
      saveAppState({ apiKey: '', isApiKeyValidated: false });
      toast({ title: "삭제 완료", description: "저장된 API 키가 삭제되었습니다." });
    } catch (error) {
      console.error("API 키 삭제 오류:", error);
      toast({ title: "삭제 실패", description: "API 키 삭제 중 오류가 발생했습니다.", variant: "destructive" });
    }
  };

  const resetApp = () => {
    const savedApiKey = localStorage.getItem('blog_api_key') || '';
    const savedApiKeyValidated = (localStorage.getItem('blog_api_key_validated') === 'true') && !!savedApiKey;

    // 완전 초기화 - 모든 주제와 콘텐츠 삭제 (초기화 버튼 클릭 시에만)
    setAppState({
      ...initialAppState,
      apiKey: savedApiKey,
      isApiKeyValidated: savedApiKeyValidated,
      referenceLink: localStorage.getItem('blog_reference_link') || '',
      referenceSentence: localStorage.getItem('blog_reference_sentence') || '',
    });
    
    // 로컬 스토리지에서도 주제 관련 데이터 완전 삭제
    const stateToSave = {
      ...initialAppState,
      referenceLink: localStorage.getItem('blog_reference_link') || '',
      referenceSentence: localStorage.getItem('blog_reference_sentence') || '',
    };
    delete stateToSave.apiKey;
    delete stateToSave.isApiKeyValidated;
    localStorage.setItem('blog_app_state', JSON.stringify(stateToSave));
    
    // preventDuplicates 설정은 초기화하지 않고 그대로 유지
    window.dispatchEvent(new CustomEvent('app-reset'));

    toast({
      title: "완전 초기화 완료",
      description: "모든 주제와 콘텐츠가 완전히 삭제되었습니다. API 키, 참조 정보, 중복 설정은 유지됩니다.",
    });
  };

  return { appState, saveAppState, deleteApiKeyFromStorage, resetApp, preventDuplicates, setPreventDuplicates };
};
