
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Download, Loader2, ClipboardCopy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimpleArticleEditorProps {
  generatedContent: string;
  isGeneratingContent: boolean;
  selectedTopic: string;
  onContentChange: (content: string) => void;
}

export const SimpleArticleEditor: React.FC<SimpleArticleEditorProps> = ({
  generatedContent,
  isGeneratingContent,
  selectedTopic,
  onContentChange,
}) => {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  
  // 강화된 상태 관리
  const [editorContent, setEditorContent] = useState('');
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [lastGeneratedContent, setLastGeneratedContent] = useState('');
  const [contentVersion, setContentVersion] = useState(0); // 버전 관리 추가
  
  // localStorage 키
  const STORAGE_KEY = 'blog_editor_content';
  const LAST_GENERATED_KEY = 'blog_last_generated_content';
  const VERSION_KEY = 'blog_content_version';
  
  // 타이머 refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const userEditTimeoutRef = useRef<NodeJS.Timeout>();
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  
  // 안전한 localStorage 작업
  const safeLocalStorageGet = useCallback((key: string) => {
    try {
      return localStorage.getItem(key) || '';
    } catch (error) {
      console.error('localStorage 읽기 실패:', error);
      return '';
    }
  }, []);
  
  const safeLocalStorageSet = useCallback((key: string, content: string) => {
    try {
      localStorage.setItem(key, content);
      console.log(`💾 localStorage 저장 완료: ${key}`);
      return true;
    } catch (error) {
      console.error('localStorage 저장 실패:', error);
      return false;
    }
  }, []);
  
  // DOM과 상태 동기화 함수 - 강화
  const syncDOMWithContent = useCallback((content: string) => {
    if (editorRef.current && content) {
      console.log('🔄 DOM 동기화 시작:', content.length + '자');
      
      // 여러 방법으로 DOM 업데이트 시도
      const updateDOM = () => {
        if (editorRef.current) {
          editorRef.current.innerHTML = content;
          
          // 강제 렌더링
          editorRef.current.style.display = 'none';
          editorRef.current.offsetHeight; // 강제 리플로우
          editorRef.current.style.display = 'block';
          
          console.log('✅ DOM 업데이트 완료');
        }
      };
      
      // 즉시 업데이트
      updateDOM();
      
      // 다음 프레임에서도 업데이트 (보험)
      requestAnimationFrame(updateDOM);
      
      // 약간의 딜레이 후에도 업데이트 (추가 보험)
      setTimeout(updateDOM, 100);
    }
  }, []);
  
  // 초기 로드 시 localStorage에서 복원 - 강화된 로직
  useEffect(() => {
    console.log('🔄 편집기 초기화 시작');
    
    const savedContent = safeLocalStorageGet(STORAGE_KEY);
    const savedLastGenerated = safeLocalStorageGet(LAST_GENERATED_KEY);
    const savedVersion = parseInt(safeLocalStorageGet(VERSION_KEY) || '0');
    
    console.log('💾 저장된 콘텐츠 확인:', {
      savedContentLength: savedContent.length,
      savedLastGeneratedLength: savedLastGenerated.length,
      currentGeneratedLength: generatedContent.length,
      savedVersion
    });
    
    // 저장된 콘텐츠가 있으면 즉시 복원
    if (savedContent && !isGeneratingContent) {
      console.log('📂 저장된 콘텐츠 복원:', savedContent.length + '자');
      setEditorContent(savedContent);
      setLastGeneratedContent(savedLastGenerated);
      setContentVersion(savedVersion);
      onContentChange(savedContent);
      
      // DOM 동기화 강화
      syncDOMWithContent(savedContent);
    }
  }, []); // 빈 의존성 배열로 최초 한 번만 실행
  
  // 새로운 생성 콘텐츠 처리 - 대폭 강화된 로직
  useEffect(() => {
    console.log('🔍 콘텐츠 동기화 체크:', {
      hasGeneratedContent: !!generatedContent,
      contentLength: generatedContent?.length || 0,
      isGenerating: isGeneratingContent,
      isDifferent: generatedContent !== lastGeneratedContent,
      editorContentLength: editorContent.length,
      contentVersion
    });

    // 새로운 콘텐츠가 있고, 생성이 완료되었고, 이전과 다른 경우에만 업데이트
    if (generatedContent && 
        !isGeneratingContent && 
        generatedContent !== lastGeneratedContent &&
        generatedContent.trim().length > 0) {
      
      console.log('✅ 새로운 콘텐츠 강제 적용 시작');
      
      const newVersion = contentVersion + 1;
      
      // 즉시 상태 업데이트
      setEditorContent(generatedContent);
      setLastGeneratedContent(generatedContent);
      setContentVersion(newVersion);
      
      // localStorage 저장
      safeLocalStorageSet(STORAGE_KEY, generatedContent);
      safeLocalStorageSet(LAST_GENERATED_KEY, generatedContent);
      safeLocalStorageSet(VERSION_KEY, newVersion.toString());
      
      // 부모 컴포넌트에 알림
      onContentChange(generatedContent);
      
      // 사용자 편집 상태 초기화
      setIsUserEditing(false);
      
      // DOM 동기화 - 여러 단계로 강화
      console.log('🔄 DOM 동기화 시작 (새 콘텐츠)');
      
      // 1차: 즉시 동기화
      syncDOMWithContent(generatedContent);
      
      // 2차: 약간의 딜레이 후 동기화 (이미지 로딩 등을 위해)
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      
      syncTimeoutRef.current = setTimeout(() => {
        console.log('🔄 지연된 DOM 동기화 실행');
        syncDOMWithContent(generatedContent);
        
        // 3차: 추가 지연 후 최종 동기화
        setTimeout(() => {
          console.log('🔄 최종 DOM 동기화 실행');
          syncDOMWithContent(generatedContent);
        }, 500);
      }, 200);
      
      toast({
        title: "✅ 블로그 글 로드 완료",
        description: "새로 생성된 글이 편집기에 적용되었습니다.",
        duration: 3000
      });
    }
  }, [generatedContent, isGeneratingContent, lastGeneratedContent, onContentChange, safeLocalStorageSet, toast, syncDOMWithContent, editorContent.length, contentVersion]);
  
  // 자동 저장 - 개선된 로직
  const performAutoSave = useCallback((content: string) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      const newVersion = contentVersion + 1;
      setContentVersion(newVersion);
      
      safeLocalStorageSet(STORAGE_KEY, content);
      safeLocalStorageSet(VERSION_KEY, newVersion.toString());
      onContentChange(content);
      console.log('💾 자동 저장 완료 (버전:', newVersion + ')');
    }, 300); // 더 빠른 자동 저장
  }, [safeLocalStorageSet, onContentChange, contentVersion]);
  
  // 사용자 입력 처리
  const handleInput = useCallback(() => {
    if (editorRef.current && !isGeneratingContent) {
      const newContent = editorRef.current.innerHTML;
      console.log('✏️ 사용자 편집 감지:', newContent.length + '자');
      
      setEditorContent(newContent);
      performAutoSave(newContent);
      
      // 사용자 편집 상태 설정
      setIsUserEditing(true);
      
      // 편집 완료 감지 (2초 후)
      if (userEditTimeoutRef.current) {
        clearTimeout(userEditTimeoutRef.current);
      }
      
      userEditTimeoutRef.current = setTimeout(() => {
        setIsUserEditing(false);
        console.log('⏹️ 사용자 편집 완료');
      }, 2000);
    }
  }, [isGeneratingContent, performAutoSave]);
  
  // 창 포커스/블러 이벤트 처리 - 강화
  useEffect(() => {
    const handleWindowFocus = () => {
      console.log('🔄 창 포커스 - 콘텐츠 복원 확인');
      const savedContent = safeLocalStorageGet(STORAGE_KEY);
      const savedVersion = parseInt(safeLocalStorageGet(VERSION_KEY) || '0');
      
      if (savedContent && (savedContent !== editorContent || savedVersion > contentVersion)) {
        console.log('📂 창 포커스 시 콘텐츠 복원 (버전:', savedVersion + ')');
        setEditorContent(savedContent);
        setContentVersion(savedVersion);
        syncDOMWithContent(savedContent);
      }
    };

    const handleWindowBlur = () => {
      console.log('💾 창 블러 - 현재 콘텐츠 저장');
      if (editorContent) {
        const newVersion = contentVersion + 1;
        setContentVersion(newVersion);
        safeLocalStorageSet(STORAGE_KEY, editorContent);
        safeLocalStorageSet(VERSION_KEY, newVersion.toString());
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [editorContent, safeLocalStorageGet, safeLocalStorageSet, syncDOMWithContent, contentVersion]);
  
  // 페이지 언로드 시 최종 저장 - 개선된 로직
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('💾 페이지 언로드 - 최종 저장');
      if (editorContent) {
        safeLocalStorageSet(STORAGE_KEY, editorContent);
        safeLocalStorageSet(VERSION_KEY, (contentVersion + 1).toString());
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden && editorContent) {
        console.log('💾 페이지 숨김 - 콘텐츠 저장');
        const newVersion = contentVersion + 1;
        setContentVersion(newVersion);
        safeLocalStorageSet(STORAGE_KEY, editorContent);
        safeLocalStorageSet(VERSION_KEY, newVersion.toString());
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (userEditTimeoutRef.current) {
        clearTimeout(userEditTimeoutRef.current);
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [editorContent, safeLocalStorageSet, contentVersion]);
  
  // 초기화 감지를 위한 전역 이벤트 리스너 - 강화
  useEffect(() => {
    const handleReset = () => {
      console.log('🔄 초기화 이벤트 감지 - 편집기 내용 삭제');
      setEditorContent('');
      setLastGeneratedContent('');
      setContentVersion(0);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_GENERATED_KEY);
      localStorage.removeItem(VERSION_KEY);
    };

    window.addEventListener('app-reset', handleReset);
    
    return () => {
      window.removeEventListener('app-reset', handleReset);
    };
  }, []);
  
  // 클립보드 복사
  const handleCopyToClipboard = useCallback(() => {
    if (!editorContent) {
      toast({ title: "복사 오류", description: "복사할 콘텐츠가 없습니다.", variant: "destructive" });
      return;
    }
    
    navigator.clipboard.writeText(editorContent).then(() => {
      toast({ title: "복사 완료", description: "수정된 HTML이 클립보드에 복사되었습니다." });
    }).catch(() => {
      toast({ title: "복사 실패", description: "클립보드 복사에 실패했습니다.", variant: "destructive" });
    });
  }, [editorContent, toast]);
  
  // HTML 파일 다운로드
  const handleDownloadHTML = useCallback(() => {
    if (!editorContent) {
      toast({ title: "다운로드 오류", description: "다운로드할 콘텐츠가 없습니다.", variant: "destructive" });
      return;
    }
    
    const blob = new Blob([editorContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = selectedTopic ? selectedTopic.replace(/[^a-zA-Z0-9가-힣]/g, '_') : 'article';
    a.download = `${filename}_edited.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "다운로드 완료", description: "수정된 HTML 파일이 다운로드되었습니다." });
  }, [editorContent, selectedTopic, toast]);

  // 디버깅을 위한 현재 상태 표시
  const showDebugInfo = process.env.NODE_ENV === 'development';

  return (
    <>
      <style>{`
        @keyframes wave {
          0%, 60%, 100% {
            transform: initial;
          }
          30% {
            transform: translateY(-10px);
          }
        }
      `}</style>
      
      <Card id="article-preview" className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center text-green-700">
              <Edit className="h-5 w-5 mr-2" />
              블로그 글 편집기 (강화된 자동 보존)
              {isUserEditing && <span className="ml-2 text-xs text-orange-500">⌨️ 편집 중</span>}
              {showDebugInfo && (
                <span className="ml-2 text-xs text-gray-400">
                  (콘텐츠: {editorContent.length}자, v{contentVersion})
                </span>
              )}
            </span>
            <div className="flex space-x-2">
              {editorContent && !isGeneratingContent && (
                <>
                  <Button 
                    onClick={handleCopyToClipboard}
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <ClipboardCopy className="h-4 w-4 mr-1" />
                    HTML 복사
                  </Button>
                  <Button 
                    onClick={handleDownloadHTML}
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    다운로드
                  </Button>
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isGeneratingContent ? (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center justify-center min-h-[200px]">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
              <p className="font-semibold text-lg">
                <span className="font-bold text-blue-600">
                  <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite] transform-origin-[70%_70%] mr-0.5">파</span>
                  <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite_0.1s] transform-origin-[70%_70%] mr-0.5">코</span>
                  <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite_0.2s] transform-origin-[70%_70%] mr-0.5">월</span>
                  <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite_0.3s] transform-origin-[70%_70%]">드</span>
                </span>
                가 글을 생성하고 있습니다...
              </p>
              <p className="text-sm animate-fade-in">잠시만 기다려주세요.</p>
            </div>
          ) : editorContent ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <p className="font-bold mb-1">📝 편집 가능한 블로그 글 (강화된 자동 보존)</p>
                <p>아래 내용을 자유롭게 수정하세요. 실시간 자동 저장되며 창 전환, 새로고침 시에도 안전하게 보존됩니다.</p>
                {isUserEditing && (
                  <p className="text-xs text-orange-600 mt-1">⌨️ 편집 중: 안전하게 보호됩니다</p>
                )}
              </div>
              <div
                ref={editorRef}
                contentEditable={true}
                className="border border-gray-300 rounded-lg p-6 min-h-[400px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent prose max-w-none"
                onInput={handleInput}
                suppressContentEditableWarning={true}
                style={{
                  lineHeight: '1.6',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Edit className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>주제를 선택하고 글을 생성해보세요!</p>
              {showDebugInfo && (
                <div className="mt-4 text-xs text-gray-400">
                  <p>생성된 콘텐츠: {generatedContent ? '있음' : '없음'}</p>
                  <p>생성 중: {isGeneratingContent ? '예' : '아니오'}</p>
                  <p>버전: {contentVersion}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
