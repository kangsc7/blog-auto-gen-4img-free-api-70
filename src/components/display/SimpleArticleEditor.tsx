
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Download, Loader2, ClipboardCopy, RefreshCw, Copy } from 'lucide-react';
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
  const [contentVersion, setContentVersion] = useState(0);
  const [isContentVisible, setIsContentVisible] = useState(false);
  
  const STORAGE_KEY = 'blog_editor_content';
  const LAST_GENERATED_KEY = 'blog_last_generated_content';
  const VERSION_KEY = 'blog_content_version';
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const userEditTimeoutRef = useRef<NodeJS.Timeout>();
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const forceRenderTimeoutRef = useRef<NodeJS.Timeout>();
  
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
  
  const forceDOMSync = useCallback((content: string) => {
    if (!editorRef.current || !content) {
      console.log('❌ DOM 동기화 조건 불충족:', { hasEditor: !!editorRef.current, hasContent: !!content });
      return false;
    }
    
    console.log('🔄 강화된 DOM 동기화 시작:', content.length + '자');
    
    try {
      const editor = editorRef.current;
      
      editor.innerHTML = content;
      console.log('✅ 1차 innerHTML 설정 완료');
      
      const originalDisplay = editor.style.display;
      editor.style.display = 'none';
      editor.offsetHeight;
      editor.style.display = originalDisplay || 'block';
      console.log('✅ 2차 강제 리플로우 완료');
      
      requestAnimationFrame(() => {
        if (editor.innerHTML !== content) {
          console.log('⚠️ 3차 검증 실패 - 재설정');
          editor.innerHTML = content;
        } else {
          console.log('✅ 3차 검증 성공');
        }
      });
      
      setTimeout(() => {
        if (editor.innerHTML !== content) {
          console.log('⚠️ 최종 검증 실패 - 최종 재설정');
          editor.innerHTML = content;
          
          editor.style.opacity = '0';
          setTimeout(() => {
            editor.style.opacity = '1';
          }, 10);
        } else {
          console.log('✅ 최종 검증 성공 - DOM 동기화 완료');
        }
        
        setIsContentVisible(true);
      }, 500);
      
      return true;
    } catch (error) {
      console.error('❌ DOM 동기화 중 오류:', error);
      return false;
    }
  }, []);
  
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
    
    if (savedContent && !isGeneratingContent) {
      console.log('📂 저장된 콘텐츠 복원:', savedContent.length + '자');
      setEditorContent(savedContent);
      setLastGeneratedContent(savedLastGenerated);
      setContentVersion(savedVersion);
      onContentChange(savedContent);
      
      setTimeout(() => forceDOMSync(savedContent), 100);
    }
  }, []);
  
  useEffect(() => {
    console.log('🔍 새 콘텐츠 동기화 체크:', {
      hasGeneratedContent: !!generatedContent,
      contentLength: generatedContent?.length || 0,
      isGenerating: isGeneratingContent,
      isDifferent: generatedContent !== lastGeneratedContent,
      editorContentLength: editorContent.length,
      contentVersion
    });

    if (generatedContent && 
        !isGeneratingContent && 
        generatedContent !== lastGeneratedContent &&
        generatedContent.trim().length > 0) {
      
      console.log('🚀 새로운 콘텐츠 강제 적용 시작 - 최우선 처리');
      
      const newVersion = contentVersion + 1;
      
      setEditorContent(generatedContent);
      setLastGeneratedContent(generatedContent);
      setContentVersion(newVersion);
      setIsContentVisible(false);
      
      safeLocalStorageSet(STORAGE_KEY, generatedContent);
      safeLocalStorageSet(LAST_GENERATED_KEY, generatedContent);
      safeLocalStorageSet(VERSION_KEY, newVersion.toString());
      
      onContentChange(generatedContent);
      setIsUserEditing(false);
      
      console.log('🔄 다단계 DOM 동기화 시작');
      
      const success1 = forceDOMSync(generatedContent);
      
      setTimeout(() => {
        console.log('🔄 2단계 DOM 동기화');
        forceDOMSync(generatedContent);
      }, 200);
      
      setTimeout(() => {
        console.log('🔄 3단계 DOM 동기화 (이미지 로딩 대기)');
        forceDOMSync(generatedContent);
      }, 1000);
      
      setTimeout(() => {
        console.log('🔄 4단계 최종 DOM 동기화');
        const finalSuccess = forceDOMSync(generatedContent);
        
        if (finalSuccess) {
          toast({
            title: "✅ 블로그 글 로드 완료",
            description: "새로 생성된 글이 편집기에 성공적으로 적용되었습니다.",
            duration: 3000
          });
        } else {
          console.error('❌ 최종 DOM 동기화 실패');
          toast({
            title: "⚠️ 편집기 로드 문제",
            description: "글이 생성되었지만 편집기 표시에 문제가 있습니다. 새로고침을 시도해보세요.",
            variant: "default",
            duration: 5000
          });
        }
      }, 2000);
    }
  }, [generatedContent, isGeneratingContent, lastGeneratedContent, onContentChange, safeLocalStorageSet, toast, forceDOMSync, editorContent.length, contentVersion]);
  
  const handleManualRefresh = useCallback(() => {
    console.log('🔄 수동 새로고침 시작');
    if (editorContent) {
      setIsContentVisible(false);
      setTimeout(() => {
        const success = forceDOMSync(editorContent);
        if (success) {
          toast({
            title: "새로고침 완료",
            description: "편집기가 새로고침되었습니다.",
          });
        }
      }, 100);
    }
  }, [editorContent, forceDOMSync, toast]);
  
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
    }, 300);
  }, [safeLocalStorageSet, onContentChange, contentVersion]);
  
  const handleInput = useCallback(() => {
    if (editorRef.current && !isGeneratingContent) {
      const newContent = editorRef.current.innerHTML;
      console.log('✏️ 사용자 편집 감지:', newContent.length + '자');
      
      setEditorContent(newContent);
      performAutoSave(newContent);
      
      setIsUserEditing(true);
      
      if (userEditTimeoutRef.current) {
        clearTimeout(userEditTimeoutRef.current);
      }
      
      userEditTimeoutRef.current = setTimeout(() => {
        setIsUserEditing(false);
        console.log('⏹️ 사용자 편집 완료');
      }, 2000);
    }
  }, [isGeneratingContent, performAutoSave]);
  
  // 창 포커스/블러 이벤트 처리
  useEffect(() => {
    const handleWindowFocus = () => {
      console.log('🔄 창 포커스 - 콘텐츠 복원 확인');
      const savedContent = safeLocalStorageGet(STORAGE_KEY);
      const savedVersion = parseInt(safeLocalStorageGet(VERSION_KEY) || '0');
      
      if (savedContent && (savedContent !== editorContent || savedVersion > contentVersion)) {
        console.log('📂 창 포커스 시 콘텐츠 복원 (버전:', savedVersion + ')');
        setEditorContent(savedContent);
        setContentVersion(savedVersion);
        forceDOMSync(savedContent);
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
  }, [editorContent, safeLocalStorageGet, safeLocalStorageSet, forceDOMSync, contentVersion]);
  
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
      [autoSaveTimeoutRef, userEditTimeoutRef, syncTimeoutRef, forceRenderTimeoutRef].forEach(ref => {
        if (ref.current) clearTimeout(ref.current);
      });
    };
  }, [editorContent, safeLocalStorageSet, contentVersion]);
  
  useEffect(() => {
    const handleReset = () => {
      console.log('🔄 초기화 이벤트 감지 - 편집기 내용 삭제');
      setEditorContent('');
      setLastGeneratedContent('');
      setContentVersion(0);
      setIsContentVisible(false);
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
  
  // 티스토리 대표 이미지 설정을 위한 HTML 복사 (개선됨)
  const handleCopyHTMLForTistory = useCallback(async () => {
    if (!editorContent) {
      toast({ title: "복사 오류", description: "복사할 콘텐츠가 없습니다.", variant: "destructive" });
      return;
    }
    
    try {
      // 티스토리 호환 HTML 생성
      const tistoryOptimizedHtml = editorContent
        .replace(/class="tistory-image"/g, 'class="tistory-image" style="cursor: pointer; user-select: auto; -webkit-user-drag: auto;"')
        .replace(/<img([^>]*)>/g, '<img$1 oncontextmenu="return true;" draggable="true">');
      
      // HTML과 텍스트 모두 클립보드에 복사
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([tistoryOptimizedHtml], { type: 'text/html' }),
        'text/plain': new Blob([tistoryOptimizedHtml], { type: 'text/plain' }),
      });

      await navigator.clipboard.write([clipboardItem]);
      
      toast({ 
        title: "✅ 티스토리용 HTML 복사 완료", 
        description: "티스토리에 붙여넣기 후 이미지를 잘라내고 다시 붙여넣으면 대표 이미지로 설정 가능합니다!",
        duration: 6000
      });
    } catch (error) {
      console.error('티스토리용 HTML 복사 실패:', error);
      // 일반 텍스트로 폴백
      try {
        await navigator.clipboard.writeText(editorContent);
        toast({ 
          title: "HTML 텍스트 복사 완료", 
          description: "HTML 코드가 텍스트로 복사되었습니다.",
          duration: 5000
        });
      } catch (fallbackError) {
        toast({ title: "복사 실패", description: "클립보드 복사에 실패했습니다.", variant: "destructive" });
      }
    }
  }, [editorContent, toast]);
  
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
        
        .editor-transition {
          transition: opacity 0.3s ease-in-out;
        }
      `}</style>
      
      <Card id="article-preview" className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center text-green-700">
              <Edit className="h-5 w-5 mr-2" />
              블로그 글 편집기 (티스토리 대표이미지 지원)
              {isUserEditing && <span className="ml-2 text-xs text-orange-500">⌨️ 편집 중</span>}
              {!isContentVisible && editorContent && <span className="ml-2 text-xs text-blue-500">🔄 렌더링 중</span>}
              {showDebugInfo && (
                <span className="ml-2 text-xs text-gray-400">
                  (콘텐츠: {editorContent.length}자, v{contentVersion}, 표시: {isContentVisible ? '✅' : '❌'})
                </span>
              )}
            </span>
            <div className="flex space-x-2">
              {editorContent && !isGeneratingContent && (
                <>
                  <Button 
                    onClick={handleManualRefresh}
                    size="sm"
                    variant="outline"
                    className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    새로고침
                  </Button>
                  <Button 
                    onClick={handleCopyHTMLForTistory}
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    티스토리용 복사
                  </Button>
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
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
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
                <p className="font-bold mb-1">📝 편집 가능한 블로그 글 (티스토리 대표이미지 설정 지원)</p>
                <p>아래 내용을 자유롭게 수정하세요. 실시간 자동 저장되며 "티스토리용 복사" 버튼으로 이미지 잘라내기/붙여넣기가 가능합니다.</p>
                {isUserEditing && (
                  <p className="text-xs text-orange-600 mt-1">⌨️ 편집 중: 안전하게 보호됩니다</p>
                )}
                {!isContentVisible && (
                  <p className="text-xs text-blue-600 mt-1">🔄 렌더링 중: 잠시만 기다려주세요</p>
                )}
              </div>
              <div
                ref={editorRef}
                contentEditable={true}
                className="border border-gray-300 rounded-lg p-6 min-h-[400px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent prose max-w-none editor-transition"
                onInput={handleInput}
                suppressContentEditableWarning={true}
                style={{
                  lineHeight: '1.6',
                  fontFamily: 'inherit',
                  opacity: isContentVisible ? 1 : 0.7
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
                  <p>표시 상태: {isContentVisible ? '표시됨' : '숨김'}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
