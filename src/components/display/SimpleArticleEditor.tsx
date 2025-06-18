
import React, { useState, useRef, useEffect } from 'react';
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
  const [currentContent, setCurrentContent] = useState('');
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState('');

  // localStorage 키
  const STORAGE_KEY = 'blog_editor_content';

  // 안전한 localStorage 저장
  const saveContentToStorage = (content: string) => {
    try {
      if (content && content !== lastSavedContent) {
        localStorage.setItem(STORAGE_KEY, content);
        setLastSavedContent(content);
        console.log('SimpleArticleEditor - 콘텐츠 저장됨:', content.length, '글자');
      }
    } catch (error) {
      console.error('localStorage 저장 실패:', error);
    }
  };

  // localStorage에서 콘텐츠 복원
  const loadContentFromStorage = () => {
    try {
      const savedContent = localStorage.getItem(STORAGE_KEY);
      console.log('SimpleArticleEditor - 저장된 콘텐츠 로드:', {
        hasSavedContent: !!savedContent,
        length: savedContent?.length || 0
      });
      return savedContent || '';
    } catch (error) {
      console.error('localStorage 로드 실패:', error);
      return '';
    }
  };

  // 컴포넌트 초기화 - 한 번만 실행
  useEffect(() => {
    if (!hasInitialized) {
      console.log('SimpleArticleEditor - 초기화 시작');
      const savedContent = loadContentFromStorage();
      
      if (savedContent) {
        setCurrentContent(savedContent);
        setLastSavedContent(savedContent);
        if (editorRef.current) {
          editorRef.current.innerHTML = savedContent;
        }
        onContentChange(savedContent);
        console.log('SimpleArticleEditor - 저장된 콘텐츠 복원 완료');
      }
      
      setHasInitialized(true);
    }
  }, [hasInitialized, onContentChange]);

  // 새로운 생성 콘텐츠 처리 - 사용자가 편집 중이 아니고 기존 콘텐츠와 다를 때만
  useEffect(() => {
    if (hasInitialized && 
        generatedContent && 
        generatedContent !== currentContent && 
        !isUserEditing && 
        !isGeneratingContent) {
      
      console.log('SimpleArticleEditor - 새로운 생성 콘텐츠 적용:', {
        generatedLength: generatedContent.length,
        currentLength: currentContent.length,
        isUserEditing,
        isGeneratingContent
      });
      
      setCurrentContent(generatedContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = generatedContent;
      }
      saveContentToStorage(generatedContent);
      onContentChange(generatedContent);
    }
  }, [generatedContent, currentContent, isUserEditing, isGeneratingContent, hasInitialized, onContentChange]);

  // 페이지 언로드 시 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentContent) {
        saveContentToStorage(currentContent);
        console.log('SimpleArticleEditor - 페이지 종료 전 저장');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentContent]);

  // 사용자 편집 처리
  const handleInput = () => {
    if (editorRef.current && !isGeneratingContent) {
      const newContent = editorRef.current.innerHTML;
      setCurrentContent(newContent);
      onContentChange(newContent);
      saveContentToStorage(newContent);
      console.log('SimpleArticleEditor - 사용자 편집 저장');
    }
  };

  // 편집 상태 관리
  const handleFocus = () => {
    console.log('SimpleArticleEditor - 편집 시작');
    setIsUserEditing(true);
  };

  const handleBlur = () => {
    console.log('SimpleArticleEditor - 편집 종료');
    // 약간의 지연을 두고 편집 상태 해제
    setTimeout(() => {
      setIsUserEditing(false);
    }, 200);
  };

  // 키보드 이벤트
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // 기본 동작 허용
  };

  // 클립보드에 복사
  const handleCopyToClipboard = () => {
    if (!currentContent) {
      toast({ title: "복사 오류", description: "복사할 콘텐츠가 없습니다.", variant: "destructive" });
      return;
    }
    
    navigator.clipboard.writeText(currentContent).then(() => {
      toast({ title: "복사 완료", description: "수정된 HTML이 클립보드에 복사되었습니다." });
    }).catch(() => {
      toast({ title: "복사 실패", description: "클립보드 복사에 실패했습니다.", variant: "destructive" });
    });
  };

  // HTML 파일 다운로드
  const handleDownloadHTML = () => {
    if (!currentContent) {
      toast({ title: "다운로드 오류", description: "다운로드할 콘텐츠가 없습니다.", variant: "destructive" });
      return;
    }

    const blob = new Blob([currentContent], { type: 'text/html;charset=utf-8' });
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
  };

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
            </span>
            <div className="flex space-x-2">
              {currentContent && !isGeneratingContent && (
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
          ) : currentContent ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <p className="font-bold mb-1">📝 편집 가능한 블로그 글</p>
                <p>아래 내용을 자유롭게 수정하세요. 이미지도 Ctrl+V로 붙여넣을 수 있습니다.</p>
                <p className="text-xs text-green-600 mt-1">✅ 자동 저장: 창 전환/새로고침 시에도 안전하게 보존됩니다</p>
              </div>
              <div
                ref={editorRef}
                contentEditable={true}
                className="border border-gray-300 rounded-lg p-6 min-h-[400px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent prose max-w-none"
                onInput={handleInput}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
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
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
