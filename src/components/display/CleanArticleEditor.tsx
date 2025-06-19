
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Download, Loader2, ClipboardCopy, RefreshCw, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CleanArticleEditorProps {
  generatedContent: string;
  isGeneratingContent: boolean;
  selectedTopic: string;
  onContentChange: (content: string) => void;
}

const STORAGE_KEY = 'blog_editor_content_permanent_v2';

export const CleanArticleEditor: React.FC<CleanArticleEditorProps> = ({
  generatedContent,
  isGeneratingContent,
  selectedTopic,
  onContentChange,
}) => {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorContent, setEditorContent] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);

  // 영구 저장된 콘텐츠 로드 (최우선 실행)
  useEffect(() => {
    const loadSavedContent = () => {
      try {
        const savedContent = localStorage.getItem(STORAGE_KEY);
        if (savedContent && !generatedContent && !isGeneratingContent) {
          console.log('💾 영구 저장된 편집기 내용 복원:', savedContent.length + '자');
          setEditorContent(savedContent);
          if (editorRef.current) {
            editorRef.current.innerHTML = savedContent;
            setTimeout(() => addImageClickHandlers(), 300);
          }
          onContentChange(savedContent);
          
          // 마지막 저장 시간 업데이트
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('❌ 영구 저장 콘텐츠 로드 실패:', error);
      }
    };

    loadSavedContent();
  }, []);

  // 자동 저장 기능 (5초마다)
  useEffect(() => {
    if (editorContent && !isGeneratingContent) {
      // 기존 인터벌 정리
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }

      // 새로운 자동 저장 설정
      const interval = setInterval(() => {
        saveContentPermanently(editorContent);
      }, 5000); // 5초마다 자동 저장

      setAutoSaveInterval(interval);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [editorContent, isGeneratingContent]);

  // 페이지 떠나기 전 저장
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editorContent) {
        saveContentPermanently(editorContent);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && editorContent) {
        saveContentPermanently(editorContent);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [editorContent]);

  // 앱 초기화 이벤트 리스너
  useEffect(() => {
    const handleAppReset = () => {
      console.log('🔄 편집기 초기화 이벤트 수신');
      clearEditor();
    };
    
    window.addEventListener('app-reset', handleAppReset);
    return () => {
      window.removeEventListener('app-reset', handleAppReset);
    };
  }, []);

  // 영구 저장 함수
  const saveContentPermanently = (content: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, content);
      setLastSaved(new Date());
      console.log('💾 편집기 내용 영구 저장 완료:', content.length + '자');
    } catch (error) {
      console.error('❌ 편집기 내용 영구 저장 실패:', error);
      toast({
        title: "저장 실패",
        description: "저장 공간이 부족할 수 있습니다.",
        variant: "destructive"
      });
    }
  };

  // 글로벌 이미지 클릭 핸들러 함수 등록
  useEffect(() => {
    (window as any).copyImageToClipboard = async (imageUrl: string) => {
      try {
        console.log('🖼️ 티스토리용 이미지 복사 시도:', imageUrl);
        
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        const clipboardItem = new ClipboardItem({
          [blob.type]: blob
        });
        
        await navigator.clipboard.write([clipboardItem]);
        
        toast({
          title: "✅ 티스토리용 이미지 복사 완료!",
          description: "티스토리에서 Ctrl+V로 붙여넣으세요. 대표이미지 설정도 가능합니다.",
          duration: 4000
        });
        
      } catch (error) {
        console.error('❌ 이미지 복사 실패:', error);
        toast({
          title: "⚠️ 이미지 복사 실패",
          description: "이미지 우클릭 → '이미지 복사'를 시도해보세요.",
          variant: "default",
          duration: 3000
        });
      }
    };

    return () => {
      delete (window as any).copyImageToClipboard;
    };
  }, [toast]);

  // 이미지 클릭 핸들러 - 로컬 버전
  const handleImageClick = async (imageUrl: string) => {
    try {
      console.log('🖼️ 로컬 이미지 클릭 복사 시도:', imageUrl);
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const clipboardItem = new ClipboardItem({
        [blob.type]: blob
      });
      
      await navigator.clipboard.write([clipboardItem]);
      
      toast({
        title: "✅ 이미지 복사 완료!",
        description: "티스토리에서 Ctrl+V로 붙여넣으세요.",
        duration: 3000
      });
      
    } catch (error) {
      console.error('❌ 이미지 복사 실패:', error);
      toast({
        title: "⚠️ 이미지 복사 실패",
        description: "이미지 우클릭 → '이미지 복사'를 시도해보세요.",
        variant: "default",
        duration: 3000
      });
    }
  };

  // 이미지에 클릭 이벤트 추가
  const addImageClickHandlers = () => {
    if (editorRef.current) {
      const images = editorRef.current.querySelectorAll('img');
      console.log('🖼️ 이미지 클릭 핸들러 추가:', images.length + '개');
      
      images.forEach((img, index) => {
        img.style.cursor = 'pointer';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.transition = 'all 0.3s ease';
        img.title = '🖱️ 클릭하면 티스토리용으로 이미지가 복사됩니다';
        
        // 기존 이벤트 리스너 제거
        img.onclick = null;
        img.onmouseover = null;
        img.onmouseout = null;
        
        // 새로운 이벤트 리스너 추가
        img.onclick = () => {
          const src = img.getAttribute('src') || img.getAttribute('data-image-url');
          if (src) {
            console.log(`🖼️ ${index+1}번째 이미지 클릭:`, src);
            handleImageClick(src);
          }
        };
        
        img.onmouseover = () => {
          img.style.transform = 'scale(1.03)';
          img.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
        };
        
        img.onmouseout = () => {
          img.style.transform = 'scale(1)';
          img.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
        };
      });
    }
  };

  // 새로운 콘텐츠가 생성되면 편집기에 반영
  useEffect(() => {
    if (generatedContent && !isGeneratingContent && generatedContent !== editorContent) {
      console.log('📝 새 콘텐츠 적용 및 영구 저장:', generatedContent.length + '자');
      setEditorContent(generatedContent);
      
      if (editorRef.current) {
        editorRef.current.innerHTML = generatedContent;
        setTimeout(() => addImageClickHandlers(), 300);
      }
      
      // 즉시 영구 저장
      saveContentPermanently(generatedContent);
      onContentChange(generatedContent);
    }
  }, [generatedContent, isGeneratingContent, editorContent, onContentChange]);

  // 사용자 편집 처리
  const handleInput = () => {
    if (editorRef.current && !isGeneratingContent) {
      const newContent = editorRef.current.innerHTML;
      setEditorContent(newContent);
      onContentChange(newContent);
      
      // 이미지 클릭 핸들러 다시 추가
      setTimeout(() => addImageClickHandlers(), 100);
    }
  };

  // 편집기 내용 완전 삭제
  const clearEditor = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      setEditorContent('');
      localStorage.removeItem(STORAGE_KEY);
      onContentChange('');
      setLastSaved(null);
      
      // 자동 저장 인터벌 정리
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        setAutoSaveInterval(null);
      }
      
      toast({ 
        title: "🗑️ 편집기 완전 초기화", 
        description: "편집기 내용이 영구적으로 삭제되었습니다." 
      });
    }
  };

  // 수동 저장
  const handleManualSave = () => {
    if (editorContent) {
      saveContentPermanently(editorContent);
      toast({ 
        title: "💾 영구 저장 완료", 
        description: "편집기 내용이 영구적으로 저장되었습니다. 창 전환, 새로고침해도 유지됩니다." 
      });
    }
  };

  // HTML 복사
  const handleCopyToClipboard = () => {
    if (!editorContent) {
      toast({ title: "복사할 콘텐츠가 없습니다.", variant: "destructive" });
      return;
    }
    
    navigator.clipboard.writeText(editorContent).then(() => {
      toast({ 
        title: "✅ HTML 복사 완료", 
        description: "티스토리 코드 편집창에 붙여넣으세요." 
      });
    });
  };

  // HTML 다운로드
  const handleDownloadHTML = () => {
    if (!editorContent) {
      toast({ title: "다운로드할 콘텐츠가 없습니다.", variant: "destructive" });
      return;
    }
    
    const blob = new Blob([editorContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = selectedTopic ? selectedTopic.replace(/[^a-zA-Z0-9가-힣]/g, '_') : 'article';
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "📥 다운로드 완료" });
  };

  return (
    <div className="w-full max-w-full">
      <Card className="shadow-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center text-green-700">
              <Edit className="h-5 w-5 mr-2" />
              블로그 글 편집기 (영구 저장 + 이미지 클릭 복사)
            </span>
            <div className="flex flex-wrap gap-2">
              {editorContent && !isGeneratingContent && (
                <>
                  <Button 
                    onClick={handleManualSave}
                    size="sm"
                    variant="outline"
                    className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    수동저장
                  </Button>
                  <Button 
                    onClick={clearEditor}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    삭제
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
        <CardContent className="w-full">
          {isGeneratingContent ? (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center justify-center min-h-[200px]">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
              <p className="font-semibold text-lg text-blue-600">컬러테마 + 시각카드 + 이미지 추가하여 글을 생성하고 있습니다...</p>
              <p className="text-sm">잠시만 기다려주세요.</p>
            </div>
          ) : editorContent ? (
            <div className="space-y-4 w-full">
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p className="font-bold mb-1">📝 편집 가능한 블로그 글 (영구 보존 + 자동저장)</p>
                  <p>자유롭게 수정하세요. 이미지 클릭시 티스토리용 복사, 창 전환/새로고침해도 내용 유지됨</p>
                </div>
                <div className="text-xs">
                  {lastSaved && (
                    <div className="text-green-600">
                      💾 마지막 저장: {lastSaved.toLocaleTimeString()}
                    </div>
                  )}
                  <div className="text-blue-600 mt-1">
                    🔄 자동저장: 5초마다
                  </div>
                </div>
              </div>
              <div
                ref={editorRef}
                contentEditable={true}
                className="border border-gray-300 rounded-lg p-6 min-h-[400px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 prose prose-lg max-w-none w-full overflow-auto"
                onInput={handleInput}
                onPaste={(e) => {
                  setTimeout(() => addImageClickHandlers(), 300);
                }}
                suppressContentEditableWarning={true}
                style={{
                  lineHeight: '1.6',
                  fontFamily: 'inherit',
                  width: '100%',
                  maxWidth: '100%',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  minWidth: '0'
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Edit className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>주제를 선택하고 글을 생성해보세요!</p>
              <p className="text-sm mt-2">또는 저장된 내용이 자동으로 복원됩니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
