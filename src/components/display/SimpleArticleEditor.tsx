
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
  
  // 편집기 상태 관리
  const [editorContent, setEditorContent] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false); // 새로운 타이핑 상태
  const [lastSavedContent, setLastSavedContent] = useState('');
  
  // localStorage 키
  const STORAGE_KEY = 'blog_editor_content';
  
  // 타이핑 감지용 타이머
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  // 안전한 localStorage 작업
  const safeLocalStorageGet = useCallback(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch (error) {
      console.error('localStorage 읽기 실패:', error);
      return '';
    }
  }, []);
  
  const safeLocalStorageSet = useCallback((content: string) => {
    try {
      if (content && content !== lastSavedContent) {
        localStorage.setItem(STORAGE_KEY, content);
        setLastSavedContent(content);
        console.log('✅ 콘텐츠 저장됨:', content.length, '글자');
        return true;
      }
      return false;
    } catch (error) {
      console.error('localStorage 저장 실패:', error);
      return false;
    }
  }, [lastSavedContent]);
  
  // 한 번만 실행되는 초기화
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 SimpleArticleEditor 초기화 시작');
      
      const savedContent = safeLocalStorageGet();
      
      if (savedContent) {
        console.log('📂 저장된 콘텐츠 복원:', savedContent.length, '글자');
        setEditorContent(savedContent);
        setLastSavedContent(savedContent);
        onContentChange(savedContent);
      } else if (generatedContent && !isGeneratingContent) {
        console.log('🆕 초기 생성 콘텐츠 설정:', generatedContent.length, '글자');
        setEditorContent(generatedContent);
        safeLocalStorageSet(generatedContent);
        onContentChange(generatedContent);
      }
      
      setIsInitialized(true);
      console.log('✅ 초기화 완료');
    }
  }, [isInitialized, generatedContent, isGeneratingContent, onContentChange, safeLocalStorageGet, safeLocalStorageSet]);
  
  // 새로운 생성 콘텐츠 처리 - 사용자가 타이핑 중이 아닐 때만
  useEffect(() => {
    if (isInitialized && 
        generatedContent && 
        generatedContent !== editorContent && 
        !isEditorFocused && 
        !isUserTyping && // 타이핑 중이 아닐 때만
        !isGeneratingContent) {
      
      console.log('🔄 새로운 생성 콘텐츠 적용 (사용자 비활성 상태)');
      setEditorContent(generatedContent);
      safeLocalStorageSet(generatedContent);
      onContentChange(generatedContent);
    }
  }, [generatedContent, editorContent, isEditorFocused, isUserTyping, isGeneratingContent, isInitialized, onContentChange, safeLocalStorageSet]);
  
  // DOM과 React 상태 동기화 - 사용자가 타이핑 중이 아닐 때만
  useEffect(() => {
    if (editorRef.current && 
        editorContent && 
        editorRef.current.innerHTML !== editorContent &&
        !isEditorFocused && 
        !isUserTyping) { // 타이핑 중이 아닐 때만 DOM 업데이트
      
      console.log('🔄 DOM 업데이트 (사용자 비활성 상태)');
      editorRef.current.innerHTML = editorContent;
    }
  }, [editorContent, isEditorFocused, isUserTyping]);
  
  // 자동 저장 - 디바운스 적용
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const performAutoSave = useCallback((content: string) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      safeLocalStorageSet(content);
      onContentChange(content);
    }, 500);
  }, [safeLocalStorageSet, onContentChange]);
  
  // 사용자 입력 처리 - 타이핑 상태 관리 추가
  const handleInput = useCallback(() => {
    if (editorRef.current && !isGeneratingContent) {
      const newContent = editorRef.current.innerHTML;
      setEditorContent(newContent);
      performAutoSave(newContent);
      
      // 타이핑 상태 설정
      setIsUserTyping(true);
      console.log('✏️ 사용자 타이핑 시작');
      
      // 타이핑 완료 감지 (1초 후)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsUserTyping(false);
        console.log('⏹️ 사용자 타이핑 완료');
      }, 1000);
    }
  }, [isGeneratingContent, performAutoSave]);
  
  // 편집기 포커스 상태 관리
  const handleFocus = useCallback(() => {
    console.log('🎯 편집기 포커스 획득');
    setIsEditorFocused(true);
  }, []);
  
  const handleBlur = useCallback(() => {
    console.log('📝 편집기 포커스 해제');
    setIsEditorFocused(false);
    
    // 포커스 해제 시 타이핑 상태도 초기화
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setTimeout(() => {
      setIsUserTyping(false);
      console.log('🔄 포커스 해제로 인한 타이핑 상태 초기화');
    }, 100);
  }, []);
  
  // 마우스 이벤트 처리
  const handleMouseEnter = useCallback(() => {
    console.log('🖱️ 마우스 편집기 진입');
    setIsEditorFocused(true);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    console.log('🖱️ 마우스 편집기 이탈');
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (activeElement !== editorRef.current && !isUserTyping) {
        setIsEditorFocused(false);
      }
    }, 100);
  }, [isUserTyping]);
  
  // 페이지 언로드 시 최종 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (editorContent) {
        safeLocalStorageSet(editorContent);
        console.log('💾 페이지 종료 전 최종 저장');
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden && editorContent) {
        safeLocalStorageSet(editorContent);
        console.log('👁️ 창 전환 시 저장');
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
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [editorContent, safeLocalStorageSet]);
  
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
              블로그 글 편집기
              {isEditorFocused && <span className="ml-2 text-xs text-blue-500">✏️ 편집 중</span>}
              {isUserTyping && <span className="ml-2 text-xs text-orange-500">⌨️ 타이핑 중</span>}
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
                <p className="font-bold mb-1">📝 편집 가능한 블로그 글</p>
                <p>아래 내용을 자유롭게 수정하세요. 이미지도 Ctrl+V로 붙여넣을 수 있습니다.</p>
                <p className="text-xs text-green-600 mt-1">✅ 실시간 자동 저장: 창 전환/새로고침 시에도 안전하게 보존됩니다</p>
                {isUserTyping && (
                  <p className="text-xs text-orange-600 mt-1">⌨️ 타이핑 중: DOM 업데이트가 일시 중단되어 커서 위치가 보호됩니다</p>
                )}
              </div>
              <div
                ref={editorRef}
                contentEditable={true}
                className="border border-gray-300 rounded-lg p-6 min-h-[400px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent prose max-w-none"
                onInput={handleInput}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                suppressContentEditableWarning={true}
                style={{
                  lineHeight: '1.6',
                  fontFamily: 'inherit'
                }}
                dangerouslySetInnerHTML={{ __html: editorContent }}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Edit className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>주제를 선택하고 글을 생성해보세요!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
