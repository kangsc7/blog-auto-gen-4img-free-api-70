
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Download, Loader2, ClipboardCopy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ArticlePreviewProps {
  generatedContent: string;
  isGeneratingContent: boolean;
  selectedTopic: string;
  onContentChange: (content: string) => void;
}

export const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  generatedContent,
  isGeneratingContent,
  selectedTopic,
  onContentChange,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const editableDivRef = useRef<HTMLDivElement>(null);
  
  // 상태 관리 단순화
  const [isUpdatingFromProps, setIsUpdatingFromProps] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  
  // 디바운싱을 위한 단일 타이머
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 커서 위치를 텍스트 오프셋으로 저장 (더 안정적)
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  // 현재 커서 위치 저장
  const saveCursorPosition = () => {
    if (!editableDivRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    try {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editableDivRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      
      const textContent = preCaretRange.toString();
      setCursorPosition(textContent.length);
    } catch (error) {
      console.warn('Failed to save cursor position:', error);
    }
  };

  // 커서 위치 복원
  const restoreCursorPosition = (position: number) => {
    if (!editableDivRef.current || isComposing || isUpdatingFromProps) return;
    
    try {
      const selection = window.getSelection();
      if (!selection) return;
      
      const walker = document.createTreeWalker(
        editableDivRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      let currentPosition = 0;
      let targetNode: Node | null = null;
      let targetOffset = 0;
      
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const nodeLength = node.textContent?.length || 0;
        
        if (currentPosition + nodeLength >= position) {
          targetNode = node;
          targetOffset = position - currentPosition;
          break;
        }
        currentPosition += nodeLength;
      }
      
      if (targetNode) {
        const range = document.createRange();
        range.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
        range.collapse(true);
        
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } catch (error) {
      console.warn('Failed to restore cursor position:', error);
    }
  };

  // 컨텐츠 업데이트 디바운싱
  const debouncedContentUpdate = (content: string) => {
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }
    
    updateTimerRef.current = setTimeout(() => {
      if (!isComposing && !isUpdatingFromProps) {
        onContentChange(content);
      }
    }, 300);
  };

  // 외부 컨텐츠 변경 처리
  useEffect(() => {
    if (!editableDivRef.current || isUpdatingFromProps || isComposing) {
      return;
    }

    const currentContent = editableDivRef.current.innerHTML;
    if (currentContent === generatedContent) {
      return;
    }

    setIsUpdatingFromProps(true);
    
    // 현재 커서 위치 저장
    saveCursorPosition();
    
    // DOM 업데이트
    editableDivRef.current.innerHTML = generatedContent;
    
    // 다음 프레임에서 커서 복원
    requestAnimationFrame(() => {
      restoreCursorPosition(cursorPosition);
      setIsUpdatingFromProps(false);
    });
    
  }, [generatedContent, cursorPosition]);

  // 한글 입력 시작
  const handleCompositionStart = () => {
    setIsComposing(true);
    saveCursorPosition();
  };

  // 한글 입력 완료
  const handleCompositionEnd = () => {
    setIsComposing(false);
    
    if (editableDivRef.current) {
      saveCursorPosition();
      const content = editableDivRef.current.innerHTML;
      debouncedContentUpdate(content);
    }
  };

  // 입력 처리 - 단순화된 로직
  const handleInput = () => {
    if (isComposing || isUpdatingFromProps) return;
    
    saveCursorPosition();
    
    if (editableDivRef.current) {
      const content = editableDivRef.current.innerHTML;
      debouncedContentUpdate(content);
    }
  };

  // 키보드 이벤트 - 최소한의 처리만
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isUpdatingFromProps) {
      event.preventDefault();
      return;
    }
    
    // 특수 키들에 대한 즉시 위치 저장
    if (event.key === ' ' || event.key === 'Backspace' || event.key === 'Delete') {
      setTimeout(() => {
        saveCursorPosition();
      }, 0);
    }
  };

  // 마우스 클릭
  const handleClick = () => {
    setTimeout(() => {
      saveCursorPosition();
    }, 0);
  };

  // 포커스 이벤트
  const handleFocus = () => {
    saveCursorPosition();
  };

  // 클린업
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  const handleCopyToClipboard = () => {
    if (!editableDivRef.current?.innerHTML) {
        toast({ title: "복사 오류", description: "복사할 콘텐츠가 없습니다.", variant: "destructive" });
        return;
    }
    const htmlToCopy = editableDivRef.current.innerHTML;
    navigator.clipboard.writeText(htmlToCopy).then(() => {
      toast({ title: "복사 완료", description: `수정된 HTML이 클립보드에 복사되었습니다.` });
    }).catch(() => {
      toast({ title: "복사 실패", description: "클립보드 복사에 실패했습니다.", variant: "destructive" });
    });
  };

  const handleDownloadHTML = () => {
    if (!editableDivRef.current?.innerHTML) {
      toast({ title: "다운로드 오류", description: "다운로드할 콘텐츠가 없습니다.", variant: "destructive" });
      return;
    }
    const htmlToDownload = editableDivRef.current.innerHTML;

    const blob = new Blob([htmlToDownload], { type: 'text/html;charset=utf-8' });
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

  // 블로그 글 편집기로 이동하는 함수
  const handleGoToEditor = () => {
    console.log('블로그 글 편집기로 이동');
    // 현재 편집된 내용을 localStorage에 저장
    if (editableDivRef.current?.innerHTML) {
      localStorage.setItem('blog_editor_content_permanent_v3', editableDivRef.current.innerHTML);
    }
    // 별도 편집기 페이지로 이동 (현재는 같은 페이지지만 향후 확장 가능)
    toast({ 
      title: "편집기 이동", 
      description: "블로그 글 편집기는 현재 이 화면에서 제공됩니다. 위 편집 영역을 이용해주세요.",
      duration: 3000
    });
  };

  return (
    <Card id="article-preview" className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center text-green-700">
            <Edit className="h-5 w-5 mr-2" />
            블로그 글 미리보기 (수정 가능)
          </span>
          <div className="flex space-x-2">
            {generatedContent && !isGeneratingContent && (
              <>
                <Button 
                  onClick={handleGoToEditor}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  편집기로 이동
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
              <span className="font-bold text-blue-600 animate-pulse inline-block transform transition-all duration-500 hover:scale-110">
                <span className="inline-block animate-[bounce_1s_ease-in-out_infinite]">파</span>
                <span className="inline-block animate-[bounce_1s_ease-in-out_infinite_0.05s]">코</span>
                <span className="inline-block animate-[bounce_1s_ease-in-out_infinite_0.1s]">월</span>
                <span className="inline-block animate-[bounce_1s_ease-in-out_infinite_0.15s]">드</span>
              </span>가 글을 생성하고 있습니다...
            </p>
            <p className="text-sm animate-fade-in">잠시만 기다려주세요.</p>
          </div>
        ) : generatedContent ? (
          <div
            ref={editableDivRef}
            contentEditable={true}
            className="border p-4 rounded bg-gray-50 min-h-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            suppressContentEditableWarning={true}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            onFocus={handleFocus}
            dangerouslySetInnerHTML={{ __html: generatedContent }}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Edit className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>주제를 선택하고 글을 생성해보세요!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
