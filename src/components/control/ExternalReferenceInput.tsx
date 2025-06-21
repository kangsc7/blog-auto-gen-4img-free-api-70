
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

// 다중 보안 저장소 키들
const STORAGE_KEYS = {
  LINK: [
    'blog_ref_link_permanent_v1', 
    'blog_ref_link_permanent_v2', 
    'blog_ref_link_backup_v1',
    'blog_ref_link_backup_v2',
    'blog_ref_link_session_v1'
  ],
  SENTENCE: [
    'blog_ref_sentence_permanent_v1', 
    'blog_ref_sentence_permanent_v2', 
    'blog_ref_sentence_backup_v1',
    'blog_ref_sentence_backup_v2',
    'blog_ref_sentence_session_v1'
  ],
};

// 강화된 영구 저장소
const securePermanentStorage = {
  set: (value: string, type: 'LINK' | 'SENTENCE') => {
    console.log(`🔒 영구 저장 시작 - ${type}:`, value);
    let successCount = 0;
    
    STORAGE_KEYS[type].forEach(key => {
      try {
        localStorage.setItem(key, value);
        sessionStorage.setItem(key, value);
        successCount++;
      } catch (error) {
        console.error(`❌ 저장 실패 - ${key}:`, error);
      }
    });
    
    // 추가 보안 저장 - 타임스탬프와 함께
    const timestampedValue = JSON.stringify({
      value,
      timestamp: Date.now(),
      userAgent: navigator.userAgent.substring(0, 50)
    });
    
    try {
      localStorage.setItem(`${type.toLowerCase()}_secure_backup`, timestampedValue);
      sessionStorage.setItem(`${type.toLowerCase()}_secure_backup`, timestampedValue);
      successCount++;
    } catch (error) {
      console.error('❌ 타임스탬프 저장 실패:', error);
    }
    
    console.log(`✅ ${type} 영구 저장 완료 - 성공: ${successCount}개`);
  },
  
  get: (type: 'LINK' | 'SENTENCE'): string => {
    console.log(`🔍 영구 저장소에서 ${type} 복원 시도`);
    
    // 기본 키들에서 복원 시도
    for (const key of STORAGE_KEYS[type]) {
      const value = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (value && value.trim()) {
        console.log(`✅ ${type} 복원 성공 - ${key}:`, value);
        return value;
      }
    }
    
    // 타임스탬프 백업에서 복원 시도
    try {
      const backupKey = `${type.toLowerCase()}_secure_backup`;
      const backup = localStorage.getItem(backupKey) || sessionStorage.getItem(backupKey);
      if (backup) {
        const parsed = JSON.parse(backup);
        if (parsed.value && parsed.value.trim()) {
          console.log(`✅ ${type} 타임스탬프 백업에서 복원:`, parsed.value);
          return parsed.value;
        }
      }
    } catch (error) {
      console.error('❌ 타임스탬프 백업 복원 실패:', error);
    }
    
    console.log(`⚠️ ${type} 복원 실패 - 저장된 데이터 없음`);
    return '';
  },
  
  clear: () => {
    console.log('🗑️ 영구 저장소 완전 삭제 시작');
    let deletedCount = 0;
    
    [...STORAGE_KEYS.LINK, ...STORAGE_KEYS.SENTENCE].forEach(key => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
        deletedCount++;
      } catch (error) {
        console.error(`❌ 삭제 실패 - ${key}:`, error);
      }
    });
    
    // 타임스탬프 백업도 삭제
    try {
      localStorage.removeItem('link_secure_backup');
      localStorage.removeItem('sentence_secure_backup');
      sessionStorage.removeItem('link_secure_backup');
      sessionStorage.removeItem('sentence_secure_backup');
      deletedCount += 4;
    } catch (error) {
      console.error('❌ 타임스탬프 백업 삭제 실패:', error);
    }
    
    console.log(`✅ 영구 저장소 삭제 완료 - 삭제된 항목: ${deletedCount}개`);
  },
  
  // 기본값 설정 함수
  setDefaults: () => {
    const defaultLink = 'https://worldpis.com/';
    const defaultSentence = '👉 워드프레스 꿀팁 더 보러가기';
    
    console.log('🔧 기본값 설정 중');
    securePermanentStorage.set(defaultLink, 'LINK');
    securePermanentStorage.set(defaultSentence, 'SENTENCE');
    console.log('✅ 기본값 설정 완료');
    
    return { defaultLink, defaultSentence };
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

  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 외부링크 컴포넌트 초기화 시작');
      
      let link = securePermanentStorage.get('LINK');
      let sentence = securePermanentStorage.get('SENTENCE');
      
      // 기본값이 없으면 설정
      if (!link && !sentence) {
        console.log('📝 기본값 없음 - 기본값 설정');
        const defaults = securePermanentStorage.setDefaults();
        link = defaults.defaultLink;
        sentence = defaults.defaultSentence;
      }

      if (link || sentence) {
        console.log('🔄 복원된 데이터로 상태 업데이트:', { link, sentence });
        saveAppState({ 
          referenceLink: link || 'https://worldpis.com/', 
          referenceSentence: sentence || '👉 워드프레스 꿀팁 더 보러가기'
        });
        
        toast({ 
          title: '✅ 외부링크 복원됨', 
          description: '영구 저장된 참조 정보가 자동으로 복원되었습니다.',
          duration: 3000
        });
      } else {
        // 완전히 없으면 기본값으로 설정
        const defaults = securePermanentStorage.setDefaults();
        saveAppState({ 
          referenceLink: defaults.defaultLink, 
          referenceSentence: defaults.defaultSentence
        });
      }
      
      setIsInitialized(true);
      console.log('✅ 외부링크 컴포넌트 초기화 완료');
    }
  }, [isInitialized, saveAppState, toast]);

  const saveSecure = (link: string, sentence: string) => {
    securePermanentStorage.set(link, 'LINK');
    securePermanentStorage.set(sentence, 'SENTENCE');
  };

  const handleChange = (field: 'referenceLink' | 'referenceSentence', value: string) => {
    const newState = { 
      ...appState, 
      [field]: value 
    };
    
    saveAppState(newState);
    
    // 즉시 영구 저장
    saveSecure(
      field === 'referenceLink' ? value : (appState.referenceLink || ''),
      field === 'referenceSentence' ? value : (appState.referenceSentence || '')
    );
    
    console.log(`💾 ${field} 자동 저장됨:`, value);
  };

  const handleDelete = () => {
    console.log('🗑️ 참조 정보 완전 삭제 요청');
    securePermanentStorage.clear();
    saveAppState({ referenceLink: '', referenceSentence: '' });
    deleteReferenceData?.();
    toast({ 
      title: '🗑️ 완전 삭제됨', 
      description: '모든 참조 정보가 영구적으로 삭제되었습니다.',
      duration: 3000
    });
  };

  const handleSave = () => {
    const link = appState.referenceLink || '';
    const sentence = appState.referenceSentence || '';
    
    saveSecure(link, sentence);
    toast({ 
      title: '💾 영구 저장됨', 
      description: '참조 정보가 모든 저장소에 안전하게 저장되었습니다.',
      duration: 3000
    });
  };

  // 자동 저장 (실시간)
  useEffect(() => {
    if (isInitialized && (appState.referenceLink || appState.referenceSentence)) {
      const timeoutId = setTimeout(() => {
        saveSecure(
          appState.referenceLink || '',
          appState.referenceSentence || ''
        );
      }, 1000); // 1초 디바운스

      return () => clearTimeout(timeoutId);
    }
  }, [appState.referenceLink, appState.referenceSentence, isInitialized]);

  return (
    <Card className="shadow-md border-2 border-green-200">
      <CardHeader onDoubleClick={() => setIsCollapsed(!isCollapsed)} className="cursor-pointer bg-green-50">
        <CardTitle className="flex items-center justify-between text-purple-700">
          <span className="flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            외부링크 설정 (영구저장)
            {isCollapsed ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronUp className="h-4 w-4 ml-2" />}
          </span>
          <div className="flex space-x-2">
            <Button onClick={handleSave} size="sm" className="bg-green-600 text-white hover:bg-green-700">
              <Save className="h-4 w-4 mr-1" /> 저장 확인
            </Button>
            <Button onClick={handleDelete} size="sm" variant="destructive">
              <Trash2 className="h-4 w-4 mr-1" /> 완전 삭제
            </Button>
          </div>
        </CardTitle>
        <p className="text-xs text-gray-600 mt-1">
          💾 자동 영구저장 | 헤더를 더블클릭하면 창을 접거나 펼칠 수 있습니다
        </p>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">참조 링크</label>
            <Input
              type="url"
              value={appState.referenceLink || ''}
              onChange={(e) => handleChange('referenceLink', e.target.value)}
              placeholder="https://worldpis.com/"
              className="border-green-300 focus:border-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">기본값: https://worldpis.com/</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Quote className="h-4 w-4 mr-1" /> 참조 문장
            </label>
            <Textarea
              value={appState.referenceSentence || ''}
              onChange={(e) => handleChange('referenceSentence', e.target.value)}
              placeholder="👉 워드프레스 꿀팁 더 보러가기"
              rows={3}
              className="border-green-300 focus:border-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">기본값: 👉 워드프레스 꿀팁 더 보러가기</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700 font-semibold">💡 영구 저장 기능</p>
            <p className="text-xs text-blue-600 mt-1">
              입력한 내용은 자동으로 여러 저장소에 백업되어 재로그인, 새로고침, 초기화에도 유지됩니다.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
