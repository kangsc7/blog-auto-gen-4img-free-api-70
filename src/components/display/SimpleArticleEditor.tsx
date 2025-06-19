import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download, RefreshCw, Edit3, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppState } from '@/types';

interface SimpleArticleEditorProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  isGeneratingContent: boolean;
}

export const SimpleArticleEditor: React.FC<SimpleArticleEditorProps> = ({
  appState,
  saveAppState,
  isGeneratingContent,
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [forceRender, setForceRender] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef<string>('');

  // 자동 저장 함수를 useCallback으로 감싸서 먼저 정의
  const performAutoSave = useCallback(() => {
    if (hasUnsavedChanges && editContent && editContent !== lastSavedContent) {
      console.log('자동 저장 실행:', editContent.substring(0, 100));
      saveAppState({ generatedContent: editContent });
      setLastSavedContent(editContent);
      setHasUnsavedChanges(false);
      
      toast({
        title: "자동 저장 완료",
        description: "변경사항이 자동으로 저장되었습니다.",
      });
    }
  }, [editContent, hasUnsavedChanges, lastSavedContent, saveAppState, toast]);

  useEffect(() => {
    if (appState.generatedContent) {
      setEditContent(appState.generatedContent);
      lastContentRef.current = appState.generatedContent;
    }
  }, [appState.generatedContent]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (!isEditing) {
      timeoutId = setTimeout(() => {
        performAutoSave();
      }, 60000); // 60초마다 자동 저장
    }

    return () => clearTimeout(timeoutId);
  }, [isEditing, performAutoSave]);

  useEffect(() => {
    if (editorRef.current && appState.generatedContent) {
      editorRef.current.innerHTML = appState.generatedContent;
    }
  }, [appState.generatedContent, forceRender]);

  // 수동 새로고침 함수
  const handleManualRefresh = () => {
    console.log('수동 새로고침 실행');
    setForceRender(prev => prev + 1);
    
    // DOM 강제 업데이트
    setTimeout(() => {
      if (editorRef.current && appState.generatedContent) {
        editorRef.current.innerHTML = appState.generatedContent;
        console.log('DOM 강제 업데이트 완료');
      }
    }, 100);
    
    toast({
      title: "편집기 새로고침",
      description: "편집기가 새로고침되었습니다.",
    });
  };

  // 클립보드에서 이미지 붙여넣기 처리
  const handlePaste = (e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    const items = clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // 이미지 데이터 확인 (Base64 등)
      if (item.type.indexOf('text') === 0) {
        item.getAsString((data) => {
          // Base64 이미지 데이터인지 확인
          if (data.startsWith('data:image/')) {
            console.log('Base64 이미지 붙여넣기 감지');
            
            // 현재 커서 위치에 이미지 삽입
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const imgElement = document.createElement('img');
              imgElement.src = data;
              imgElement.style.maxWidth = '100%';
              imgElement.style.height = 'auto';
              imgElement.style.margin = '10px 0';
              
              range.deleteContents();
              range.insertNode(imgElement);
              
              // 커서를 이미지 뒤로 이동
              range.setStartAfter(imgElement);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
              
              // 변경사항 저장
              if (editorRef.current) {
                const newContent = editorRef.current.innerHTML;
                setEditContent(newContent);
                setHasUnsavedChanges(true);
                saveAppState({ generatedContent: newContent });
              }
              
              toast({
                title: "이미지 삽입 완료",
                description: "Base64 이미지가 성공적으로 삽입되었습니다.",
              });
            }
            
            e.preventDefault();
            return;
          }
        });
      }
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: `${type} 복사 완료`,
          description: `${type}이(가) 클립보드에 복사되었습니다.`,
        });
      })
      .catch(err => {
        toast({
          title: "복사 실패",
          description: "클립보드 복사에 실패했습니다.",
          variant: "destructive"
        });
        console.error("클립보드 복사 실패:", err);
      });
  };

  const downloadHTML = () => {
    const contentToDownload = isEditing ? editContent : appState.generatedContent;
    if (contentToDownload) {
      const blob = new Blob([contentToDownload], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appState.selectedTopic ? appState.selectedTopic.replace(/[^a-zA-Z0-9가-힣]/g, '_') : 'article'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "다운로드 완료",
        description: "HTML 파일이 다운로드되었습니다.",
      });
    }
  };

  const startEditing = () => {
    setEditContent(appState.generatedContent || '');
    setLastSavedContent(appState.generatedContent || '');
    setIsEditing(true);
    setHasUnsavedChanges(false);
  };

  const saveChanges = () => {
    console.log('변경사항 저장:', editContent.substring(0, 100));
    saveAppState({ generatedContent: editContent });
    setLastSavedContent(editContent);
    setHasUnsavedChanges(false);
    setIsEditing(false);
    
    toast({
      title: "저장 완료",
      description: "변경사항이 저장되었습니다.",
    });
  };

  const cancelEditing = () => {
    if (hasUnsavedChanges) {
      const confirmDiscard = window.confirm('저장하지 않은 변경사항이 있습니다. 정말 취소하시겠습니까?');
      if (!confirmDiscard) return;
    }
    
    setEditContent('');
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  if (!appState.generatedContent && !isGeneratingContent) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
          <Edit3 className="mr-2 h-5 w-5" />
          블로그 글 편집기 {forceRender > 0 && `(새로고침 ${forceRender})`}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            새로고침
          </Button>
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={startEditing}
                disabled={isGeneratingContent}
              >
                <Edit3 className="mr-1 h-4 w-4" />
                편집
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(appState.generatedContent || '', "블로그 글")}
                disabled={isGeneratingContent}
              >
                <Copy className="mr-1 h-4 w-4" />
                복사
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadHTML}
                disabled={isGeneratingContent}
              >
                <Download className="mr-1 h-4 w-4" />
                다운로드
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={saveChanges}
                disabled={!hasUnsavedChanges}
              >
                <Save className="mr-1 h-4 w-4" />
                저장
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelEditing}
              >
                <X className="mr-1 h-4 w-4" />
                취소
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isGeneratingContent ? (
          <div className="space-y-3">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">AI가 블로그 글을 생성하고 있습니다...</p>
          </div>
        ) : (
          <>
            {isEditing ? (
              <div className="space-y-2">
                {hasUnsavedChanges && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border">
                    ⚠️ 저장하지 않은 변경사항이 있습니다.
                  </div>
                )}
                <div
                  ref={editorRef}
                  contentEditable
                  className="min-h-[400px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: editContent }}
                  onInput={(e) => {
                    const newContent = e.currentTarget.innerHTML;
                    setEditContent(newContent);
                    setHasUnsavedChanges(newContent !== lastSavedContent);
                  }}
                  onPaste={handlePaste}
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: '1.6'
                  }}
                />
              </div>
            ) : (
              <div 
                className="prose max-w-none p-4 border border-gray-200 rounded-lg bg-gray-50"
                dangerouslySetInnerHTML={{ 
                  __html: appState.generatedContent || '<p>생성된 콘텐츠가 없습니다.</p>' 
                }}
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: '1.6'
                }}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
