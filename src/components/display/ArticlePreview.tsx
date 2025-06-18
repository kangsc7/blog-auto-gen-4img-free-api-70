import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Download, Loader2, ClipboardCopy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const editableDivRef = useRef<HTMLDivElement>(null);
  const isUpdatingFromProps = useRef(false);
  const isComposing = useRef(false);
  const lastKnownCursorPosition = useRef(0);
  const skipNextCursorRestore = useRef(false);
  const isInternalUpdate = useRef(false);

  // 더 정확한 커서 위치 계산
  const getCursorPosition = (): number => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editableDivRef.current) {
      return lastKnownCursorPosition.current;
    }
    
    try {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editableDivRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      
      const position = preCaretRange.toString().length;
      lastKnownCursorPosition.current = position;
      return position;
    } catch (error) {
      console.warn('커서 위치 계산 중 오류:', error);
      return lastKnownCursorPosition.current;
    }
  };

  // 더 안정적인 커서 위치 복원
  const setCursorPosition = (position: number) => {
    if (!editableDivRef.current || isComposing.current || skipNextCursorRestore.current) {
      skipNextCursorRestore.current = false;
      return;
    }
    
    const selection = window.getSelection();
    if (!selection) return;

    try {
      let currentPosition = 0;
      const walker = document.createTreeWalker(
        editableDivRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node;
      while (node = walker.nextNode()) {
        const textLength = node.textContent?.length || 0;
        if (currentPosition + textLength >= position) {
          const range = document.createRange();
          const offsetInNode = Math.min(position - currentPosition, textLength);
          range.setStart(node, offsetInNode);
          range.setEnd(node, offsetInNode);
          
          selection.removeAllRanges();
          selection.addRange(range);
          lastKnownCursorPosition.current = position;
          return;
        }
        currentPosition += textLength;
      }

      // 위치를 찾지 못한 경우 마지막으로 이동
      const range = document.createRange();
      range.selectNodeContents(editableDivRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      lastKnownCursorPosition.current = editableDivRef.current.textContent?.length || 0;
    } catch (error) {
      console.warn('커서 위치 복원 중 오류:', error);
    }
  };

  useEffect(() => {
    if (editableDivRef.current && 
        editableDivRef.current.innerHTML !== generatedContent && 
        !isComposing.current &&
        !isInternalUpdate.current) {
      
      const cursorPosition = getCursorPosition();
      isUpdatingFromProps.current = true;
      
      editableDivRef.current.innerHTML = generatedContent;
      
      // DOM 업데이트 후 커서 복원
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setCursorPosition(cursorPosition);
          isUpdatingFromProps.current = false;
        });
      });
    }
  }, [generatedContent]);

  const handleContentEdit = () => {
    if (editableDivRef.current && 
        !isUpdatingFromProps.current && 
        !isComposing.current &&
        !isInternalUpdate.current) {
      
      isInternalUpdate.current = true;
      const updatedContent = editableDivRef.current.innerHTML;
      onContentChange(updatedContent);
      
      // 내부 업데이트 플래그 해제
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 50);
    }
  };

  // 한글 입력 이벤트 처리
  const handleCompositionStart = () => {
    console.log('한글 입력 시작');
    isComposing.current = true;
  };

  const handleCompositionUpdate = () => {
    // 입력 중에는 커서 위치만 업데이트
    getCursorPosition();
  };

  const handleCompositionEnd = () => {
    console.log('한글 입력 완료');
    isComposing.current = false;
    
    setTimeout(() => {
      if (!isUpdatingFromProps.current) {
        handleContentEdit();
      }
    }, 10);
  };

  // 특정 키에 대한 안전한 처리
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isComposing.current) return;

    const key = event.key;
    
    // 커서 위치 저장
    getCursorPosition();
    
    // 특별한 처리가 필요한 키들
    if (key === 'Enter') {
      event.stopPropagation();
      // 엔터는 기본 동작 허용하되 상태 업데이트는 지연
      setTimeout(() => {
        if (!isUpdatingFromProps.current) {
          skipNextCursorRestore.current = true; // 엔터 후 커서 복원 건너뛰기
          handleContentEdit();
        }
      }, 0);
    } else if (key === ' ' || key === 'Backspace' || key === 'Delete') {
      // 스페이스, 백스페이스, 델리트는 즉시 처리하지 않음
      skipNextCursorRestore.current = true;
    }
  };

  // 키를 놓았을 때의 처리
  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (isComposing.current) return;
    
    const key = event.key;
    
    // 특정 키들에 대해서만 지연된 업데이트
    if (key === ' ' || key === 'Backspace' || key === 'Delete') {
      setTimeout(() => {
        if (!isUpdatingFromProps.current && !isComposing.current) {
          handleContentEdit();
        }
      }, 10);
    }
  };

  const handleInput = (event: React.FormEvent) => {
    if (isComposing.current || isUpdatingFromProps.current) return;
    
    // 커서 위치 업데이트
    getCursorPosition();
    
    // 일반적인 텍스트 입력에 대해서만 즉시 처리
    const nativeEvent = event.nativeEvent as InputEvent;
    const inputType = nativeEvent.inputType;
    
    // 특정 입력 타입은 지연 처리
    if (inputType === 'deleteContentBackward' || 
        inputType === 'deleteContentForward' ||
        inputType === 'insertText' && nativeEvent.data === ' ') {
      return; // keyUp에서 처리됨
    }
    
    // 나머지는 즉시 처리
    setTimeout(() => {
      if (!isUpdatingFromProps.current && !isComposing.current) {
        handleContentEdit();
      }
    }, 0);
  };

  const handleBeforeInput = (event: React.FormEvent) => {
    getCursorPosition();
  };

  // 포커스 이벤트 처리
  const handleFocus = () => {
    getCursorPosition();
  };

  const handleClick = () => {
    // 클릭 후 커서 위치 업데이트
    setTimeout(() => {
      getCursorPosition();
    }, 0);
  };

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
            onCompositionUpdate={handleCompositionUpdate}
            onCompositionEnd={handleCompositionEnd}
            onBeforeInput={handleBeforeInput}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onFocus={handleFocus}
            onClick={handleClick}
            onBlur={handleContentEdit}
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
