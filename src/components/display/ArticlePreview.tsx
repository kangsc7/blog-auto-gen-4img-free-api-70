
import React, { useEffect, useRef, useState } from 'react';
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
  
  // 상태 관리를 더 명확하게 분리
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [lastSavedRange, setLastSavedRange] = useState<Range | null>(null);
  const [suppressNextUpdate, setSuppressNextUpdate] = useState(false);
  
  // 디바운싱을 위한 타이머
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restoreTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Range 기반 커서 위치 저장 - 더 정확하고 안정적
  const saveSelection = (): Range | null => {
    if (!editableDivRef.current) return null;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    try {
      const range = selection.getRangeAt(0).cloneRange();
      setLastSavedRange(range.cloneRange());
      return range;
    } catch (error) {
      console.warn('Selection save failed:', error);
      return null;
    }
  };

  // Range 기반 커서 위치 복원 - 훨씬 더 안정적
  const restoreSelection = (range: Range | null) => {
    if (!range || !editableDivRef.current || isComposing || suppressNextUpdate) {
      return;
    }

    try {
      const selection = window.getSelection();
      if (!selection) return;

      // DOM이 변경되었는지 확인
      if (!document.contains(range.startContainer) || !document.contains(range.endContainer)) {
        // 가장 가까운 유효한 위치로 복원
        const newRange = document.createRange();
        newRange.selectNodeContents(editableDivRef.current);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
        return;
      }

      selection.removeAllRanges();
      selection.addRange(range);
    } catch (error) {
      console.warn('Selection restore failed:', error);
      // 폴백: 마지막 위치로 이동
      try {
        const selection = window.getSelection();
        if (selection && editableDivRef.current) {
          const range = document.createRange();
          range.selectNodeContents(editableDivRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (fallbackError) {
        console.warn('Fallback selection failed:', fallbackError);
      }
    }
  };

  // 컨텐츠 업데이트를 위한 디바운싱 함수
  const debouncedContentUpdate = (content: string) => {
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }
    
    updateTimerRef.current = setTimeout(() => {
      if (!isComposing && !isInternalUpdate) {
        onContentChange(content);
      }
    }, 100);
  };

  // 외부에서 들어온 컨텐츠 업데이트 처리
  useEffect(() => {
    if (!editableDivRef.current || isInternalUpdate || isComposing || suppressNextUpdate) {
      return;
    }

    const currentContent = editableDivRef.current.innerHTML;
    if (currentContent === generatedContent) {
      return;
    }

    // 현재 선택 영역 저장
    const savedRange = saveSelection();
    
    setIsInternalUpdate(true);
    setSuppressNextUpdate(true);
    
    // DOM 업데이트
    editableDivRef.current.innerHTML = generatedContent;
    
    // 선택 영역 복원을 다음 프레임으로 지연
    if (restoreTimerRef.current) {
      clearTimeout(restoreTimerRef.current);
    }
    
    restoreTimerRef.current = setTimeout(() => {
      restoreSelection(savedRange);
      setIsInternalUpdate(false);
      setSuppressNextUpdate(false);
    }, 50);
    
  }, [generatedContent]);

  // 한글 입력 시작
  const handleCompositionStart = () => {
    console.log('Composition started');
    setIsComposing(true);
    saveSelection();
  };

  // 한글 입력 중
  const handleCompositionUpdate = () => {
    // 입력 중에는 위치만 저장하고 업데이트하지 않음
    saveSelection();
  };

  // 한글 입력 완료
  const handleCompositionEnd = () => {
    console.log('Composition ended');
    setIsComposing(false);
    
    // 약간의 지연 후 업데이트
    setTimeout(() => {
      if (editableDivRef.current && !isInternalUpdate) {
        const content = editableDivRef.current.innerHTML;
        debouncedContentUpdate(content);
      }
    }, 50);
  };

  // 키보드 입력 처리 - 특별한 키들에 대한 세밀한 제어
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isComposing || isInternalUpdate) return;

    const key = event.key;
    
    // 현재 선택 영역 저장
    saveSelection();
    
    // 특정 키들에 대해서는 즉시 처리하지 않고 keyup에서 처리
    if (key === ' ' || key === 'Backspace' || key === 'Delete') {
      setSuppressNextUpdate(true);
      
      // 다음 프레임에서 suppression 해제
      setTimeout(() => {
        setSuppressNextUpdate(false);
      }, 10);
    }
  };

  // 키를 놓았을 때 처리
  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (isComposing || isInternalUpdate) return;
    
    const key = event.key;
    
    // 특정 키들에 대해서만 지연된 업데이트
    if (key === ' ' || key === 'Backspace' || key === 'Delete') {
      setTimeout(() => {
        if (editableDivRef.current && !isComposing && !isInternalUpdate) {
          const content = editableDivRef.current.innerHTML;
          debouncedContentUpdate(content);
        }
      }, 100);
    }
  };

  // 일반적인 입력 처리
  const handleInput = (event: React.FormEvent) => {
    if (isComposing || isInternalUpdate || suppressNextUpdate) return;
    
    saveSelection();
    
    const nativeEvent = event.nativeEvent as InputEvent;
    const inputType = nativeEvent.inputType;
    
    // 특정 입력 타입들은 keyUp에서 처리되므로 여기서는 제외
    if (inputType === 'deleteContentBackward' || 
        inputType === 'deleteContentForward' ||
        (inputType === 'insertText' && nativeEvent.data === ' ')) {
      return;
    }
    
    // 즉시 처리할 수 있는 입력들
    if (editableDivRef.current) {
      const content = editableDivRef.current.innerHTML;
      debouncedContentUpdate(content);
    }
  };

  // 포커스 관련 이벤트들
  const handleFocus = () => {
    saveSelection();
  };

  const handleClick = () => {
    // 클릭 후 약간의 지연을 두고 선택 영역 저장
    setTimeout(() => {
      saveSelection();
    }, 10);
  };

  const handleBlur = () => {
    // 포커스를 잃을 때 마지막으로 업데이트
    if (editableDivRef.current && !isComposing && !isInternalUpdate) {
      const content = editableDivRef.current.innerHTML;
      onContentChange(content);
    }
  };

  // 클린업
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
      if (restoreTimerRef.current) {
        clearTimeout(restoreTimerRef.current);
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
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onFocus={handleFocus}
            onClick={handleClick}
            onBlur={handleBlur}
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
