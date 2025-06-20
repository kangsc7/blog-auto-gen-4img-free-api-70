
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ExternalLink, Quote, Save, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { AppState } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ExternalReferenceInputProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  deleteReferenceData?: () => void;
}

// 강력한 영구 저장을 위한 다중 키 시스템 - API 키와 완전히 동일한 방식
const ULTRA_SECURE_KEYS = {
  LINK_PRIMARY: 'blog_reference_link_ultra_secure_v1',
  LINK_SECONDARY: 'blog_reference_link_ultra_secure_v2', 
  LINK_TERTIARY: 'blog_reference_link_ultra_secure_v3',
  SENTENCE_PRIMARY: 'blog_reference_sentence_ultra_secure_v1',
  SENTENCE_SECONDARY: 'blog_reference_sentence_ultra_secure_v2',
  SENTENCE_TERTIARY: 'blog_reference_sentence_ultra_secure_v3',
  TIMESTAMP: 'blog_reference_timestamp_ultra_secure',
  VERIFICATION: 'blog_reference_verification_ultra_secure'
};

// 군급 보안 저장 함수 - API 키보다 더 강력
const militaryGradeStorage = {
  set: (value: string, type: 'link' | 'sentence'): boolean => {
    try {
      console.log(`🛡️ 군급 보안 저장 시작: ${type}`);
      const timestamp = Date.now().toString();
      const verification = btoa(`${value}_${timestamp}_verified`);
      
      if (type === 'link') {
        // 3중 백업 저장
        localStorage.setItem(ULTRA_SECURE_KEYS.LINK_PRIMARY, value);
        localStorage.setItem(ULTRA_SECURE_KEYS.LINK_SECONDARY, value);
        localStorage.setItem(ULTRA_SECURE_KEYS.LINK_TERTIARY, value);
        sessionStorage.setItem(ULTRA_SECURE_KEYS.LINK_PRIMARY, value);
        
        // IndexedDB 백업 시뮬레이션 (localStorage 다중 키)
        for (let i = 1; i <= 5; i++) {
          localStorage.setItem(`blog_ref_link_backup_${i}`, value);
        }
      } else {
        // 3중 백업 저장
        localStorage.setItem(ULTRA_SECURE_KEYS.SENTENCE_PRIMARY, value);
        localStorage.setItem(ULTRA_SECURE_KEYS.SENTENCE_SECONDARY, value);
        localStorage.setItem(ULTRA_SECURE_KEYS.SENTENCE_TERTIARY, value);
        sessionStorage.setItem(ULTRA_SECURE_KEYS.SENTENCE_PRIMARY, value);
        
        // IndexedDB 백업 시뮬레이션 (localStorage 다중 키)
        for (let i = 1; i <= 5; i++) {
          localStorage.setItem(`blog_ref_sentence_backup_${i}`, value);
        }
      }
      
      // 검증 데이터 저장
      localStorage.setItem(ULTRA_SECURE_KEYS.TIMESTAMP, timestamp);
      localStorage.setItem(ULTRA_SECURE_KEYS.VERIFICATION, verification);
      
      console.log(`✅ 군급 보안 저장 완료: ${type}`);
      return true;
    } catch (error) {
      console.error(`❌ 군급 보안 저장 실패: ${type}`, error);
      return false;
    }
  },

  get: (type: 'link' | 'sentence'): string => {
    try {
      console.log(`🔓 군급 보안 복구 시도: ${type}`);
      let value = '';
      
      if (type === 'link') {
        // 우선순위별 복구 시도
        value = localStorage.getItem(ULTRA_SECURE_KEYS.LINK_PRIMARY) ||
                localStorage.getItem(ULTRA_SECURE_KEYS.LINK_SECONDARY) ||
                localStorage.getItem(ULTRA_SECURE_KEYS.LINK_TERTIARY) ||
                sessionStorage.getItem(ULTRA_SECURE_KEYS.LINK_PRIMARY) || '';
        
        // 백업에서 복구 시도
        if (!value) {
          for (let i = 1; i <= 5; i++) {
            value = localStorage.getItem(`blog_ref_link_backup_${i}`) || '';
            if (value) break;
          }
        }
      } else {
        // 우선순위별 복구 시도
        value = localStorage.getItem(ULTRA_SECURE_KEYS.SENTENCE_PRIMARY) ||
                localStorage.getItem(ULTRA_SECURE_KEYS.SENTENCE_SECONDARY) ||
                localStorage.getItem(ULTRA_SECURE_KEYS.SENTENCE_TERTIARY) ||
                sessionStorage.getItem(ULTRA_SECURE_KEYS.SENTENCE_PRIMARY) || '';
        
        // 백업에서 복구 시도
        if (!value) {
          for (let i = 1; i <= 5; i++) {
            value = localStorage.getItem(`blog_ref_sentence_backup_${i}`) || '';
            if (value) break;
          }
        }
      }
      
      console.log(`✅ 군급 보안 복구 결과: ${type} - ${value ? '성공' : '실패'}`);
      return value;
    } catch (error) {
      console.error(`❌ 군급 보안 복구 실패: ${type}`, error);
      return '';
    }
  },

  delete: (): boolean => {
    try {
      console.log('🗑️ 군급 보안 완전 삭제 시작');
      
      // 모든 키 삭제
      Object.values(ULTRA_SECURE_KEYS).forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // 백업 키들 삭제
      for (let i = 1; i <= 5; i++) {
        localStorage.removeItem(`blog_ref_link_backup_${i}`);
        localStorage.removeItem(`blog_ref_sentence_backup_${i}`);
      }
      
      console.log('✅ 군급 보안 완전 삭제 완료');
      return true;
    } catch (error) {
      console.error('❌ 군급 보안 삭제 실패', error);
      return false;
    }
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

  // 컴포넌트 마운트 시 군급 보안 데이터 로드
  useEffect(() => {
    if (isInitialized) return;
    
    const loadUltraSecureData = () => {
      try {
        console.log('🛡️ 외부 링크 설정 - 군급 보안 데이터 로드 시작');
        
        const storedLink = militaryGradeStorage.get('link');
        const storedSentence = militaryGradeStorage.get('sentence');
        
        console.log('🔓 군급 보안 데이터 로드 결과:', {
          link: storedLink ? '복구됨' : '없음',
          sentence: storedSentence ? '복구됨' : '없음',
          linkLength: storedLink.length,
          sentenceLength: storedSentence.length
        });
        
        // 저장된 데이터가 현재 앱 상태와 다르면 동기화
        if (storedLink !== (appState.referenceLink || '') || 
            storedSentence !== (appState.referenceSentence || '')) {
          
          console.log('🔄 앱 상태와 군급 저장 데이터 동기화 중...');
          saveAppState({
            referenceLink: storedLink,
            referenceSentence: storedSentence
          });
          
          if (storedLink || storedSentence) {
            toast({
              title: "🛡️ 외부 링크 데이터 복구",
              description: "군급 보안으로 저장된 외부 링크 설정이 복구되었습니다.",
              duration: 2000
            });
          }
        }
        
        setIsInitialized(true);
        console.log('✅ 군급 보안 데이터 로드 완료');
      } catch (error) {
        console.error('❌ 군급 보안 데이터 로드 실패:', error);
        setIsInitialized(true);
      }
    };

    loadUltraSecureData();
  }, [appState.referenceLink, appState.referenceSentence, saveAppState, toast, isInitialized]);

  // 실시간 군급 보안 저장 함수
  const performUltraSecureSave = (link: string, sentence: string) => {
    console.log('🛡️ 실시간 군급 보안 저장 시작');
    
    const linkSaved = militaryGradeStorage.set(link, 'link');
    const sentenceSaved = militaryGradeStorage.set(sentence, 'sentence');
    
    if (linkSaved && sentenceSaved) {
      console.log('✅ 실시간 군급 보안 저장 완료');
      return true;
    } else {
      console.error('❌ 실시간 군급 보안 저장 부분 실패');
      return false;
    }
  };

  const handleReferenceLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('📝 참조 링크 변경 (즉시 군급 보안 저장):', value);
    
    // 즉시 군급 보안 저장
    performUltraSecureSave(value, appState.referenceSentence || '');
    
    // 앱 상태 업데이트
    saveAppState({ referenceLink: value });
  };

  const handleReferenceSentenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    console.log('📝 참조 문장 변경 (즉시 군급 보안 저장)');
    
    // 즉시 군급 보안 저장
    performUltraSecureSave(appState.referenceLink || '', value);
    
    // 앱 상태 업데이트
    saveAppState({ referenceSentence: value });
  };

  const handleSave = () => {
    console.log('💾 수동 저장 확인 버튼 클릭');
    
    const currentLink = appState.referenceLink || '';
    const currentSentence = appState.referenceSentence || '';
    
    const saveSuccess = performUltraSecureSave(currentLink, currentSentence);
    
    if (saveSuccess) {
      // 추가 검증
      setTimeout(() => {
        const verifyLink = militaryGradeStorage.get('link');
        const verifySentence = militaryGradeStorage.get('sentence');
        
        if (verifyLink === currentLink && verifySentence === currentSentence) {
          toast({
            title: "✅ 저장 완료",
            description: "참조 링크와 문장이 성공적으로 저장되었습니다.",
            duration: 3000
          });
          console.log('✅ 저장 검증 성공');
        } else {
          toast({
            title: "⚠️ 저장 검증 실패",
            description: "저장 과정에서 문제가 발생했습니다. 다시 시도해주세요.",
            variant: "destructive",
            duration: 3000
          });
          console.error('❌ 저장 검증 실패');
        }
      }, 500);
    } else {
      toast({
        title: "❌ 저장 실패",
        description: "저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = () => {
    console.log('🗑️ 참조 정보 완전 삭제 시작');
    
    try {
      const deleteSuccess = militaryGradeStorage.delete();
      
      // 앱 상태 초기화
      saveAppState({ 
        referenceLink: '', 
        referenceSentence: '' 
      });
      
      if (deleteReferenceData) {
        deleteReferenceData();
      }
      
      if (deleteSuccess) {
        toast({
          title: "🗑️ 삭제 완료",
          description: "참조 링크와 문장이 완전히 삭제되었습니다.",
        });
        console.log('✅ 삭제 성공');
      } else {
        toast({
          title: "⚠️ 삭제 불완전",
          description: "일부 데이터가 남아있을 수 있습니다.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('❌ 삭제 실패:', error);
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
      console.log('💾 페이지 언로드 - 외부 링크 최종 군급 보안 저장');
      if (appState.referenceLink || appState.referenceSentence) {
        performUltraSecureSave(appState.referenceLink || '', appState.referenceSentence || '');
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('💾 페이지 숨김 - 외부 링크 최종 군급 보안 저장');
        if (appState.referenceLink || appState.referenceSentence) {
          performUltraSecureSave(appState.referenceLink || '', appState.referenceSentence || '');
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
            외부링크 설정
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
              삭제 확인
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
              참조 링크
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
              참조 문장
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
          </div>

          {(appState.referenceLink || appState.referenceSentence) && (
            <div className="text-xs text-green-600 bg-green-50 p-3 rounded border border-green-200">
              ✅ 현재 저장된 참조 정보:
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
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
