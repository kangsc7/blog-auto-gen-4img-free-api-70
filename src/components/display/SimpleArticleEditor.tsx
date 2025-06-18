
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

  // 컴포넌트 초기화 시 localStorage에서 복원
  useEffect(() => {
    const savedContent = localStorage.getItem('blog_editor_content');
    console.log('SimpleArticleEditor - 초기화, 저장된 콘텐츠 복원:', { 
      hasSavedContent: !!savedContent,
      savedContentLength: savedContent?.length || 0 
    });
    
    if (savedContent) {
      setCurrentContent(savedContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = savedContent;
      }
      onContentChange(savedContent);
    }
  }, [onContentChange]);

  // generatedContent 변경 시 에디터 업데이트 및 localStorage 저장
  useEffect(() => {
    if (generatedContent && generatedContent !== currentContent) {
      console.log('SimpleArticleEditor - 새로운 생성 콘텐츠 업데이트:', {
        generatedContentLength: generatedContent.length,
        currentContentLength: currentContent.length
      });
      
      setCurrentContent(generatedContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = generatedContent;
      }
      
      // localStorage에 즉시 저장
      localStorage.setItem('blog_editor_content', generatedContent);
      onContentChange(generatedContent);
    }
  }, [generatedContent, currentContent, onContentChange]);

  // 탭 변경/새로고침 감지 시 자동 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentContent) {
        localStorage.setItem('blog_editor_content', currentContent);
        console.log('SimpleArticleEditor - 페이지 종료 전 콘텐츠 저장');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && currentContent) {
        localStorage.setItem('blog_editor_content', currentContent);
        console.log('SimpleArticleEditor - 탭 변경 시 콘텐츠 저장');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentContent]);

  // 사용자가 직접 편집할 때
  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setCurrentContent(newContent);
      onContentChange(newContent);
      // localStorage에 즉시 저장
      localStorage.setItem('blog_editor_content', newContent);
      console.log('SimpleArticleEditor - 사용자 편집 시 콘텐츠 저장');
    }
  };

  // 키보드 이벤트 - 기본 동작만 허용
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // 기본 키보드 동작을 방해하지 않음
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
                <p className="text-xs text-green-600 mt-1">✅ 자동 저장: 탭 전환/새로고침 시에도 안전하게 보존됩니다</p>
              </div>
              <div
                ref={editorRef}
                contentEditable={true}
                className="border border-gray-300 rounded-lg p-6 min-h-[400px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent prose max-w-none"
                onInput={handleInput}
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
