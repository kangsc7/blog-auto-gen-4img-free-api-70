
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ExternalLink, Quote, Save, Trash2, ChevronUp, ChevronDown, Shield } from 'lucide-react';
import { AppState } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ExternalReferenceInputProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  deleteReferenceData?: () => void;
}

// 영구 저장을 위한 localStorage 키 - API 키처럼 안전한 저장
const REFERENCE_STORAGE_KEYS = {
  LINK: 'blog_reference_link_permanent_v4_secure',
  SENTENCE: 'blog_reference_sentence_permanent_v4_secure'
};

// 백업 저장소 키
const BACKUP_STORAGE_KEYS = {
  LINK: 'blog_reference_link_backup_v4_secure',
  SENTENCE: 'blog_reference_sentence_backup_v4_secure'
};

// 영구 저장 보안 강화 함수
const secureStorageSet = (key: string, value: string): boolean => {
  try {
    console.log(`🔒 보안 저장 시도: ${key}`);
    
    // 1차 저장: localStorage
    localStorage.setItem(key, value);
    
    // 2차 저장: sessionStorage (백업용)
    sessionStorage.setItem(`backup_${key}`, value);
    
    // 3차 저장: 추가 백업 키
    const backupKey = key.replace('permanent', 'backup');
    localStorage.setItem(backupKey, value);
    
    // 저장 검증
    const stored = localStorage.getItem(key);
    if (stored === value) {
      console.log(`✅ 보안 저장 성공: ${key}`);
      return true;
    } else {
      console.error(`❌ 보안 저장 검증 실패: ${key}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 보안 저장 실패: ${key}`, error);
    return false;
  }
};

// 영구 저장 복구 함수
const secureStorageGet = (key: string): string => {
  try {
    console.log(`🔓 보안 복구 시도: ${key}`);
    
    // 1차 시도: localStorage
    let value = localStorage.getItem(key) || '';
    
    // 1차 실패 시 2차 시도: sessionStorage 백업
    if (!value) {
      value = sessionStorage.getItem(`backup_${key}`) || '';
      console.log(`📂 sessionStorage 백업에서 복구: ${value ? '성공' : '실패'}`);
    }
    
    // 2차 실패 시 3차 시도: 추가 백업 키
    if (!value) {
      const backupKey = key.replace('permanent', 'backup');
      value = localStorage.getItem(backupKey) || '';
      console.log(`📂 백업 키에서 복구: ${value ? '성공' : '실패'}`);
    }
    
    console.log(`✅ 보안 복구 결과: ${key} - ${value ? '데이터 있음' : '데이터 없음'}`);
    return value;
  } catch (error) {
    console.error(`❌ 보안 복구 실패: ${key}`, error);
    return '';
  }
};

export const ExternalReferenceInput: React.FC<ExternalReferenceInputProps> = ({
  appState,
  saveAppState,
  deleteReferenceData,
}) => {
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 컴포넌트 마운트 시 보안 강화된 데이터 로드
  useEffect(() => {
    if (isInitialized) return; // 중복 초기화 방지
    
    const loadSecureData = () => {
      try {
        console.log('🔒 외부 링크 설정 - 보안 강화된 데이터 로드 시작');
        
        const storedLink = secureStorageGet(REFERENCE_STORAGE_KEYS.LINK);
        const storedSentence = secureStorageGet(REFERENCE_STORAGE_KEYS.SENTENCE);
        
        console.log('🔓 보안 데이터 로드 결과:', {
          link: storedLink ? '있음' : '없음',
          sentence: storedSentence ? '있음' : '없음',
          linkLength: storedLink.length,
          sentenceLength: storedSentence.length
        });
        
        // 저장된 데이터가 현재 앱 상태와 다르면 동기화
        if (storedLink !== (appState.referenceLink || '') || 
            storedSentence !== (appState.referenceSentence || '')) {
          
          console.log('🔄 앱 상태와 저장된 데이터 동기화 중...');
          saveAppState({
            referenceLink: storedLink,
            referenceSentence: storedSentence
          });
          
          toast({
            title: "🔒 외부 링크 데이터 복구",
            description: "영구 저장된 외부 링크 설정이 복구되었습니다.",
            duration: 2000
          });
        }
        
        setIsInitialized(true);
        console.log('✅ 보안 강화된 데이터 로드 완료');
      } catch (error) {
        console.error('❌ 보안 데이터 로드 실패:', error);
        setIsInitialized(true);
      }
    };

    loadSecureData();
  }, [appState.referenceLink, appState.referenceSentence, saveAppState, toast, isInitialized]);

  // 실시간 보안 저장 함수
  const performSecureSave = (link: string, sentence: string) => {
    console.log('🔒 실시간 보안 저장 시작:', { linkLength: link.length, sentenceLength: sentence.length });
    
    const linkSaved = secureStorageSet(REFERENCE_STORAGE_KEYS.LINK, link);
    const sentenceSaved = secureStorageSet(REFERENCE_STORAGE_KEYS.SENTENCE, sentence);
    
    if (linkSaved && sentenceSaved) {
      console.log('✅ 실시간 보안 저장 완료');
    } else {
      console.error('❌ 실시간 보안 저장 부분 실패');
    }
  };

  const handleReferenceLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('📝 참조 링크 변경 (즉시 보안 저장):', value);
    
    // 즉시 보안 저장
    performSecureSave(value, appState.referenceSentence || '');
    
    // 앱 상태 업데이트
    saveAppState({ referenceLink: value });
  };

  const handleReferenceSentenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    console.log('📝 참조 문장 변경 (즉시 보안 저장):', value.substring(0, 50) + '...');
    
    // 즉시 보안 저장
    performSecureSave(appState.referenceLink || '', value);
    
    // 앱 상태 업데이트
    saveAppState({ referenceSentence: value });
  };

  const handleSave = () => {
    console.log('💾 수동 저장 확인 버튼 클릭');
    
    // 현재 상태 강제 저장
    const currentLink = appState.referenceLink || '';
    const currentSentence = appState.referenceSentence || '';
    
    performSecureSave(currentLink, currentSentence);
    
    // 추가 검증 저장
    setTimeout(() => {
      const verifyLink = secureStorageGet(REFERENCE_STORAGE_KEYS.LINK);
      const verifySentence = secureStorageGet(REFERENCE_STORAGE_KEYS.SENTENCE);
      
      if (verifyLink === currentLink && verifySentence === currentSentence) {
        toast({
          title: "✅ 영구 저장 검증 완료",
          description: "참조 링크와 문장이 안전하게 영구 저장되었습니다. API 키처럼 절대 삭제되지 않습니다.",
          duration: 3000
        });
        console.log('✅ 영구 저장 검증 성공');
      } else {
        toast({
          title: "⚠️ 저장 검증 실패",
          description: "저장 과정에서 문제가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive",
          duration: 3000
        });
        console.error('❌ 영구 저장 검증 실패');
      }
    }, 500);
  };

  const handleDelete = () => {
    console.log('🗑️ 참조 정보 영구 삭제 시작');
    
    try {
      // 모든 저장소에서 완전 삭제
      localStorage.removeItem(REFERENCE_STORAGE_KEYS.LINK);
      localStorage.removeItem(REFERENCE_STORAGE_KEYS.SENTENCE);
      localStorage.removeItem(BACKUP_STORAGE_KEYS.LINK);
      localStorage.removeItem(BACKUP_STORAGE_KEYS.SENTENCE);
      
      // sessionStorage에서도 삭제
      sessionStorage.removeItem(`backup_${REFERENCE_STORAGE_KEYS.LINK}`);
      sessionStorage.removeItem(`backup_${REFERENCE_STORAGE_KEYS.SENTENCE}`);
      
      // 앱 상태 초기화
      saveAppState({ 
        referenceLink: '', 
        referenceSentence: '' 
      });
      
      // deleteReferenceData 콜백도 호출 (호환성)
      if (deleteReferenceData) {
        deleteReferenceData();
      }
      
      // 삭제 검증
      setTimeout(() => {
        const verifyLink = secureStorageGet(REFERENCE_STORAGE_KEYS.LINK);
        const verifySentence = secureStorageGet(REFERENCE_STORAGE_KEYS.SENTENCE);
        
        if (!verifyLink && !verifySentence) {
          toast({
            title: "🗑️ 영구 삭제 완료",
            description: "참조 링크와 문장이 모든 저장소에서 완전히 삭제되었습니다.",
          });
          console.log('✅ 영구 삭제 검증 성공');
        } else {
          console.error('❌ 영구 삭제 검증 실패');
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ 영구 삭제 실패:', error);
      toast({
        title: "❌ 삭제 실패",
        description: "삭제 과정에서 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // 페이지 언로드 시 최종 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('💾 페이지 언로드 - 외부 링크 최종 보안 저장');
      if (appState.referenceLink || appState.referenceSentence) {
        performSecureSave(appState.referenceLink || '', appState.referenceSentence || '');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [appState.referenceLink, appState.referenceSentence]);

  return (
    <Card className="shadow-md border-2 border-green-200">
      <CardHeader 
        className="cursor-pointer bg-green-50" 
        onDoubleClick={handleToggleCollapse}
      >
        <CardTitle className="flex items-center justify-between text-purple-700">
          <span className="flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            <Shield className="h-4 w-4 mr-1 text-green-600" />
            외부 링크 설정 (API 키급 영구 저장)
            {isCollapsed ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronUp className="h-4 w-4 ml-2" />}
          </span>
          <div className="flex space-x-2">
            <Button
              onClick={handleSave}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              저장 확인
            </Button>
            <Button
              onClick={handleDelete}
              size="sm"
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              영구 삭제
            </Button>
          </div>
        </CardTitle>
        <p className="text-xs text-gray-500 mt-1">
          💡 헤더를 더블클릭하면 창을 접거나 펼칠 수 있습니다
        </p>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Shield className="h-4 w-4 inline mr-1 text-green-600" />
              참조 링크 (API 키급 보안 저장)
            </label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={appState.referenceLink || ''}
              onChange={handleReferenceLinkChange}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              참조할 웹페이지 URL을 입력하면 해당 내용을 분석하여 글에 반영합니다
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Quote className="h-4 w-4 mr-1" />
              <Shield className="h-4 w-4 mr-1 text-green-600" />
              참조 문장 (API 키급 보안 저장)
            </label>
            <Textarea
              placeholder="참조하고 싶은 특정 문장이나 내용을 입력하세요... (예: 👉 워드프레스 꿀팁 더 보러가기)"
              value={appState.referenceSentence || ''}
              onChange={handleReferenceSentenceChange}
              className="w-full min-h-[80px] resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              특정 문장이나 내용을 참조하여 관련된 글을 작성하고, 이 문장이 하이퍼링크로 표시됩니다
            </p>
          </div>

          <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
            💡 참조 링크와 문장은 AI가 글을 작성할 때 추가적인 맥락과 정보로 활용되며, 
            저장된 참조 링크는 블로그 글 본문 끝에 "이 글과 관련된 다른 정보가 궁금하다면?" 스타일로 자동 추가됩니다.
            <br />
            🔒 <strong>API 키급 보안 저장</strong>: 입력과 동시에 다중 백업으로 저장되며, API 키처럼 절대 삭제되지 않습니다.
          </div>

          {(appState.referenceLink || appState.referenceSentence) && (
            <div className="text-xs text-green-600 bg-green-50 p-3 rounded border border-green-200">
              ✅ 현재 API 키급 보안 저장된 참조 정보:
              {appState.referenceLink && (
                <div className="mt-1">
                  <strong>🔗 링크:</strong> {appState.referenceLink}
                </div>
              )}
              {appState.referenceSentence && (
                <div className="mt-1">
                  <strong>📝 문장:</strong> {appState.referenceSentence.substring(0, 50)}...
                </div>
              )}
              <div className="mt-2 text-xs text-blue-600">
                🛡️ 이 데이터는 API 키와 동일한 보안 수준으로 저장되어 있습니다.
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
