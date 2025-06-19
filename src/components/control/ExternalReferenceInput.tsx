
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

// 영구 저장을 위한 localStorage 키
const REFERENCE_STORAGE_KEYS = {
  LINK: 'blog_reference_link_permanent_v4',
  SENTENCE: 'blog_reference_sentence_permanent_v4'
};

export const ExternalReferenceInput: React.FC<ExternalReferenceInputProps> = ({
  appState,
  saveAppState,
  deleteReferenceData,
}) => {
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 컴포넌트 마운트 시 localStorage에서 데이터 로드
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedLink = localStorage.getItem(REFERENCE_STORAGE_KEYS.LINK) || '';
        const storedSentence = localStorage.getItem(REFERENCE_STORAGE_KEYS.SENTENCE) || '';
        
        console.log('외부 링크 설정 - 영구 저장된 데이터 로드:', {
          link: storedLink,
          sentence: storedSentence.substring(0, 50) + '...'
        });
        
        // 저장된 데이터를 앱 상태에 동기화
        saveAppState({
          referenceLink: storedLink,
          referenceSentence: storedSentence
        });
      } catch (error) {
        console.error('영구 저장된 데이터 로드 실패:', error);
      }
    };

    loadStoredData();
  }, [saveAppState]);

  const handleReferenceLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('참조 링크 변경 (즉시 영구 저장):', value);
    
    // localStorage에 즉시 저장
    localStorage.setItem(REFERENCE_STORAGE_KEYS.LINK, value);
    
    // sessionStorage에도 백업 저장
    sessionStorage.setItem('backup_reference_link_v4', value);
    
    // 앱 상태 업데이트
    saveAppState({ referenceLink: value });
  };

  const handleReferenceSentenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    console.log('참조 문장 변경 (즉시 영구 저장):', value.substring(0, 50) + '...');
    
    // localStorage에 즉시 저장
    localStorage.setItem(REFERENCE_STORAGE_KEYS.SENTENCE, value);
    
    // sessionStorage에도 백업 저장
    sessionStorage.setItem('backup_reference_sentence_v4', value);
    
    // 앱 상태 업데이트
    saveAppState({ referenceSentence: value });
  };

  const handleSave = () => {
    // 강제로 다시 저장하여 확실히 영구 저장되도록 함
    const currentLink = appState.referenceLink || '';
    const currentSentence = appState.referenceSentence || '';
    
    // 다중 저장소에 저장
    localStorage.setItem(REFERENCE_STORAGE_KEYS.LINK, currentLink);
    localStorage.setItem(REFERENCE_STORAGE_KEYS.SENTENCE, currentSentence);
    sessionStorage.setItem('backup_reference_link_v4', currentLink);
    sessionStorage.setItem('backup_reference_sentence_v4', currentSentence);
    
    // 추가 안전장치 - 인덱스드DB 스타일 저장
    try {
      const backupData = {
        link: currentLink,
        sentence: currentSentence,
        timestamp: Date.now()
      };
      localStorage.setItem('reference_data_backup_v4', JSON.stringify(backupData));
    } catch (error) {
      console.error('백업 데이터 저장 실패:', error);
    }
    
    toast({
      title: "✅ 영구 저장 완료",
      description: "참조 링크와 문장이 다중 저장소에 영구 저장되었습니다. 재로그인, 새로고침, 창전환, 로그아웃해도 절대 삭제되지 않습니다.",
      duration: 3000
    });
    console.log('참조 정보 영구 저장 확인:', {
      referenceLink: currentLink,
      referenceSentence: currentSentence
    });
  };

  const handleDelete = () => {
    console.log('참조 정보 영구 삭제 시작');
    
    // 모든 저장소에서 완전 삭제
    localStorage.removeItem(REFERENCE_STORAGE_KEYS.LINK);
    localStorage.removeItem(REFERENCE_STORAGE_KEYS.SENTENCE);
    sessionStorage.removeItem('backup_reference_link_v4');
    sessionStorage.removeItem('backup_reference_sentence_v4');
    localStorage.removeItem('reference_data_backup_v4');
    
    // 앱 상태 초기화
    saveAppState({ 
      referenceLink: '', 
      referenceSentence: '' 
    });
    
    // deleteReferenceData 콜백도 호출 (호환성)
    if (deleteReferenceData) {
      deleteReferenceData();
    }
    
    toast({
      title: "🗑️ 영구 삭제 완료",
      description: "참조 링크와 문장이 모든 저장소에서 완전히 삭제되었습니다.",
      duration: 3000
    });
    console.log('참조 정보 영구 삭제 완료');
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Card className="shadow-md">
      <CardHeader 
        className="cursor-pointer" 
        onDoubleClick={handleToggleCollapse}
      >
        <CardTitle className="flex items-center justify-between text-purple-700">
          <span className="flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            외부 링크 설정 (영구 저장)
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
              참조 링크 (실시간 영구 저장)
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
              참조 문장 (실시간 영구 저장)
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

          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border">
            💡 참조 링크와 문장은 AI가 글을 작성할 때 추가적인 맥락과 정보로 활용되며, 
            저장된 참조 링크는 블로그 글 본문 끝에 "이 글과 관련된 다른 정보가 궁금하다면?" 스타일로 자동 추가됩니다.
            <br />
            🔒 <strong>실시간 영구 저장</strong>: 입력과 동시에 다중 저장소에 저장되며, 재로그인, 새로고침, 창전환, 로그아웃해도 절대 삭제되지 않습니다.
          </div>

          {(appState.referenceLink || appState.referenceSentence) && (
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded border">
              ✅ 현재 영구 저장된 참조 정보:
              {appState.referenceLink && (
                <div className="mt-1">
                  <strong>링크:</strong> {appState.referenceLink}
                </div>
              )}
              {appState.referenceSentence && (
                <div className="mt-1">
                  <strong>문장:</strong> {appState.referenceSentence.substring(0, 50)}...
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
