
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Download, Loader2, ClipboardCopy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimpleArticleEditorProps {
  generatedContent: string;
  isGeneratingContent: boolean;
  selectedTopic: string;
  onContentChange: (content: string) => void;
}

// Script 태그 제거 함수
const removeScriptTags = (htmlContent: string): string => {
  console.log('🧹 Script 태그 제거 시작');
  const cleanedContent = htmlContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  console.log('✅ Script 태그 제거 완료');
  return cleanedContent;
};

// 스크롤 위치 저장/복원을 위한 키
const SCROLL_POSITION_KEY = 'blog_editor_scroll_position';

export const SimpleArticleEditor: React.FC<SimpleArticleEditorProps> = ({
  generatedContent,
  isGeneratingContent,
  selectedTopic,
  onContentChange,
}) => {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  
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

  // 스크롤 위치 저장
  const saveScrollPosition = useCallback(() => {
    try {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      localStorage.setItem(SCROLL_POSITION_KEY, scrollPosition.toString());
      console.log('📍 스크롤 위치 저장:', scrollPosition);
    } catch (error) {
      console.error('스크롤 위치 저장 실패:', error);
    }
  }, []);

  // 스크롤 위치 복원
  const restoreScrollPosition = useCallback(() => {
    try {
      const savedPosition = localStorage.getItem(SCROLL_POSITION_KEY);
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        window.scrollTo(0, position);
        console.log('📍 스크롤 위치 복원:', position);
      }
    } catch (error) {
      console.error('스크롤 위치 복원 실패:', error);
    }
  }, []);
  
  const handleImageClick = useCallback(async (imageUrl: string, altText: string) => {
    try {
      console.log('이미지 클릭 복사 시도:', imageUrl);
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const clipboardItem = new ClipboardItem({
        [blob.type]: blob
      });
      
      await navigator.clipboard.write([clipboardItem]);
      
      toast({
        title: "✅ 이미지 복사 완료!",
        description: "티스토리 편집창에서 Ctrl+V로 붙여넣으세요. 실제 이미지 파일이 복사되어 안전하게 업로드됩니다.",
        duration: 4000
      });
      
    } catch (error) {
      console.error('이미지 복사 실패:', error);
      toast({
        title: "⚠️ 이미지 복사 실패",
        description: "이미지 우클릭 → '이미지 복사'를 시도해보세요.",
        variant: "default",
        duration: 3000
      });
    }
  }, [toast]);
  
  const forceDOMSync = useCallback((content: string) => {
    if (!editorRef.current || !content) {
      console.log('❌ DOM 동기화 조건 불충족:', { hasEditor: !!editorRef.current, hasContent: !!content });
      return false;
    }
    
    console.log('🔄 강화된 DOM 동기화 시작:', content.length + '자');
    
    try {
      const editor = editorRef.current;
      
      // 주제 스타일을 H4 크기, 검은색으로 적용
      let processedContent = content.replace(
        /<h3([^>]*style="[^"]*color:\s*[^;]*;[^"]*")([^>]*)>/gi,
        '<h4 style="color: #000000; font-weight: bold; font-size: 1.2em; margin: 20px 0 15px 0; line-height: 1.4;">$2>'
      );
      
      // 주제 H3를 H4로 변경하고 색상을 검은색으로 설정
      processedContent = processedContent.replace(
        /<h3([^>]*)>/gi,
        '<h4 style="color: #000000; font-weight: bold; font-size: 1.2em; margin: 20px 0 15px 0; line-height: 1.4;"$1>'
      );
      
      // H3 종료 태그를 H4로 변경
      processedContent = processedContent.replace(/<\/h3>/gi, '</h4>');
      
      // 주제 뒤에 공백 줄 추가
      processedContent = processedContent.replace(
        /(<h4[^>]*>[^<]*<\/h4>)/gi,
        '$1\n<p style="height: 20px;">&nbsp;</p>'
      );
      
      editor.innerHTML = processedContent;
      console.log('✅ 1차 innerHTML 설정 완료 (주제 H4 스타일 적용)');
      
      // 이미지 클릭 이벤트 리스너 추가
      const images = editor.querySelectorAll('img');
      images.forEach(img => {
        img.style.cursor = 'pointer';
        img.title = '클릭하면 이미지가 클립보드에 복사됩니다 (티스토리 붙여넣기용)';
        
        img.addEventListener('click', () => {
          const src = img.getAttribute('src');
          const alt = img.getAttribute('alt') || '블로그 이미지';
          if (src) {
            handleImageClick(src, alt);
          }
        });
      });
      
      const originalDisplay = editor.style.display;
      editor.style.display = 'none';
      editor.offsetHeight;
      editor.style.display = originalDisplay || 'block';
      console.log('✅ 2차 강제 리플로우 완료');
      
      requestAnimationFrame(() => {
        if (editor.innerHTML !== processedContent) {
          console.log('⚠️ 3차 검증 실패 - 재설정');
          editor.innerHTML = processedContent;
        } else {
          console.log('✅ 3차 검증 성공');
        }
      });
      
      setTimeout(() => {
        if (editor.innerHTML !== processedContent) {
          console.log('⚠️ 최종 검증 실패 - 최종 재설정');
          editor.innerHTML = processedContent;
          
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
  }, [handleImageClick]);
  
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

    // 페이지 로드 시 스크롤 위치 복원
    setTimeout(restoreScrollPosition, 100);
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

  // 붙여넣기 이벤트 처리 (이미지 포함)
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    
    // 이미지 파일이 있는지 확인
    const items = Array.from(clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        console.log('📎 이미지 붙여넣기 감지:', file.name || 'clipboard-image');
        
        // 이미지를 Data URL로 변환하여 편집기에 삽입
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          if (dataUrl && editorRef.current) {
            // 현재 커서 위치에 이미지 삽입
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const img = document.createElement('img');
              img.src = dataUrl;
              img.style.maxWidth = '100%';
              img.style.height = 'auto';
              img.style.cursor = 'pointer';
              img.title = '클릭하면 이미지가 클립보드에 복사됩니다';
              
              range.deleteContents();
              range.insertNode(img);
              
              // 이미지 클릭 이벤트 추가
              img.addEventListener('click', () => {
                handleImageClick(dataUrl, 'Pasted image');
              });
              
              // 편집 내용 업데이트
              handleInput();
              
              toast({
                title: "📎 이미지 붙여넣기 완료",
                description: "이미지가 편집기에 추가되었습니다. 클릭하면 복사할 수 있습니다.",
                duration: 3000
              });
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }, [handleImageClick, handleInput, toast]);
  
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

      // 스크롤 위치 복원
      restoreScrollPosition();
    };

    const handleWindowBlur = () => {
      console.log('💾 창 블러 - 현재 콘텐츠 저장');
      if (editorContent) {
        const newVersion = contentVersion + 1;
        setContentVersion(newVersion);
        safeLocalStorageSet(STORAGE_KEY, editorContent);
        safeLocalStorageSet(VERSION_KEY, newVersion.toString());
      }

      // 스크롤 위치 저장
      saveScrollPosition();
    };

    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('scroll', saveScrollPosition);
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('scroll', saveScrollPosition);
    };
  }, [editorContent, safeLocalStorageGet, safeLocalStorageSet, forceDOMSync, contentVersion, saveScrollPosition, restoreScrollPosition]);
  
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('💾 페이지 언로드 - 최종 저장');
      if (editorContent) {
        safeLocalStorageSet(STORAGE_KEY, editorContent);
        safeLocalStorageSet(VERSION_KEY, (contentVersion + 1).toString());
      }
      saveScrollPosition();
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden && editorContent) {
        console.log('💾 페이지 숨김 - 콘텐츠 저장');
        const newVersion = contentVersion + 1;
        setContentVersion(newVersion);
        safeLocalStorageSet(STORAGE_KEY, editorContent);
        safeLocalStorageSet(VERSION_KEY, newVersion.toString());
        saveScrollPosition();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // 모든 타이머 정리
      [autoSaveTimeoutRef, userEditTimeoutRef, syncTimeoutRef, forceRenderTimeoutRef].forEach(ref => {
        if (ref.current) clearTimeout(ref.current);
      });
    };
  }, [editorContent, safeLocalStorageSet, contentVersion, saveScrollPosition]);
  
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
  
  const handleCopyToClipboard = useCallback(() => {
    if (!editorContent) {
      toast({ title: "복사 오류", description: "복사할 콘텐츠가 없습니다.", variant: "destructive" });
      return;
    }
    
    console.log('📋 HTML 복사 시작 - Script 태그 제거 적용');
    
    // Script 태그 제거된 버전을 클립보드에 복사
    const cleanedContent = removeScriptTags(editorContent);
    
    navigator.clipboard.writeText(cleanedContent).then(() => {
      toast({ 
        title: "HTML 복사 완료", 
        description: "Script 태그가 제거된 HTML 코드가 클립보드에 복사되었습니다." 
      });
      console.log('✅ Script 태그 제거된 HTML 복사 완료');
    }).catch(() => {
      toast({ title: "복사 실패", description: "클립보드 복사에 실패했습니다.", variant: "destructive" });
    });
  }, [editorContent, toast]);
  
  const handleDownloadHTML = useCallback(() => {
    if (!editorContent) {
      toast({ title: "다운로드 오류", description: "다운로드할 콘텐츠가 없습니다.", variant: "destructive" });
      return;
    }
    
    console.log('💾 HTML 다운로드 시작 - Script 태그 제거 적용');
    
    // Script 태그 제거된 버전을 다운로드
    const cleanedContent = removeScriptTags(editorContent);
    
    const blob = new Blob([cleanedContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = selectedTopic ? selectedTopic.replace(/[^a-zA-Z0-9가-힣]/g, '_') : 'article';
    a.download = `${filename}_edited_clean.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "다운로드 완료", description: "Script 태그가 제거된 HTML 파일이 다운로드되었습니다." });
    console.log('✅ Script 태그 제거된 HTML 다운로드 완료');
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
        
        .editor-content img {
          cursor: pointer !important;
          transition: transform 0.2s ease-in-out;
        }
        
        .editor-content img:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* 주제 H4 스타일 강제 적용 */
        .editor-content h4 {
          color: #000000 !important;
          font-size: 1.2em !important;
          font-weight: bold !important;
          margin: 20px 0 15px 0 !important;
          line-height: 1.4 !important;
        }
      `}</style>
      
      <Card id="article-preview" className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center text-green-700">
              <Edit className="h-5 w-5 mr-2" />
              블로그 글 편집기
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
                <p>아래 내용을 자유롭게 수정하세요. 이미지를 복사하여 붙여넣을 수도 있습니다.</p>
                <div className="mt-2 text-xs bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                  <p className="font-bold text-yellow-800">🎯 티스토리 사용법:</p>
                  <p>1. HTML 복사 → 티스토리 코드 편집창 붙여넣기</p>
                  <p>2. 일반 모드로 전환 → 이미지 클릭 → Ctrl+V로 실제 이미지 파일 붙여넣기</p>
                </div>
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
                className="border border-gray-300 rounded-lg p-6 min-h-[400px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent prose max-w-none editor-transition editor-content"
                onInput={handleInput}
                onPaste={handlePaste}
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
