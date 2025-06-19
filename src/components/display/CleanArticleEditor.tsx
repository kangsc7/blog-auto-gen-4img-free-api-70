
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Download, Loader2, ClipboardCopy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CleanArticleEditorProps {
  generatedContent: string;
  isGeneratingContent: boolean;
  selectedTopic: string;
  onContentChange: (content: string) => void;
}

const UNIFIED_EDITOR_KEY = 'blog_editor_content_permanent_v3';

export const CleanArticleEditor: React.FC<CleanArticleEditorProps> = ({
  generatedContent,
  isGeneratingContent,
  selectedTopic,
  onContentChange,
}) => {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorContent, setEditorContent] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [contentSyncKey, setContentSyncKey] = useState(0);

  // 콘텐츠 강제 동기화 함수
  const forceSyncContent = (content: string) => {
    console.log('🔄 콘텐츠 강제 동기화 시작:', content.length + '자');
    
    setEditorContent(content);
    
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
      setTimeout(() => addImageClickHandlers(), 300);
    }
    
    // 영구 저장
    try {
      localStorage.setItem(UNIFIED_EDITOR_KEY, content);
      console.log('✅ 강제 동기화 저장 완료:', content.length + '자');
    } catch (error) {
      console.error('❌ 강제 동기화 저장 실패:', error);
    }
    
    onContentChange(content);
    setContentSyncKey(prev => prev + 1);
  };

  // 통합된 콘텐츠 로드 함수
  const loadUnifiedContent = () => {
    try {
      const savedContent = localStorage.getItem(UNIFIED_EDITOR_KEY);
      console.log('🔄 통합 편집기 콘텐츠 로드 시도:', { 
        hasLocal: !!savedContent, 
        hasGenerated: !!generatedContent,
        localLength: savedContent?.length || 0,
        generatedLength: generatedContent?.length || 0,
        isGenerating: isGeneratingContent
      });
      
      // 생성 중이 아니고 새로운 콘텐츠가 있으면 우선 적용
      if (!isGeneratingContent && generatedContent && generatedContent.length > 100) {
        console.log('🆕 새 생성 콘텐츠 우선 적용');
        forceSyncContent(generatedContent);
        return true;
      }
      
      // 기존 저장된 콘텐츠 로드
      const finalContent = savedContent || '';
      
      if (finalContent && finalContent !== editorContent) {
        console.log('💾 기존 저장 콘텐츠 로드:', finalContent.length + '자');
        setEditorContent(finalContent);
        
        if (editorRef.current) {
          editorRef.current.innerHTML = finalContent;
          setTimeout(() => addImageClickHandlers(), 300);
        }
        
        onContentChange(finalContent);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ 통합 콘텐츠 로드 실패:', error);
      return false;
    }
  };

  // 초기 로드
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 편집기 초기화 시작');
      loadUnifiedContent();
      setIsInitialized(true);
    }
  }, []);

  // 새 생성 콘텐츠 감지 및 즉시 적용 - 생성 완료 시점 감지
  useEffect(() => {
    // 생성이 완료되고 새로운 콘텐츠가 있을 때
    if (!isGeneratingContent && generatedContent && generatedContent.length > 100) {
      console.log('🎯 생성 완료 감지 - 새 콘텐츠 즉시 적용:', generatedContent.length + '자');
      
      // 즉시 강제 동기화
      setTimeout(() => {
        forceSyncContent(generatedContent);
      }, 100);
    }
  }, [isGeneratingContent, generatedContent]);

  // 편집기 콘텐츠 업데이트 이벤트 리스너
  useEffect(() => {
    const handleContentUpdate = (event: CustomEvent) => {
      const newContent = event.detail.content;
      console.log('📢 편집기 콘텐츠 업데이트 이벤트 수신:', newContent.length + '자');
      
      if (newContent && newContent !== editorContent) {
        forceSyncContent(newContent);
      }
    };
    
    window.addEventListener('editor-content-updated', handleContentUpdate as EventListener);
    return () => {
      window.removeEventListener('editor-content-updated', handleContentUpdate as EventListener);
    };
  }, [editorContent]);

  // 통합 영구 저장 함수
  const savePermanently = (content: string) => {
    try {
      localStorage.setItem(UNIFIED_EDITOR_KEY, content);
      console.log('💾 통합 편집기 영구 저장:', content.length + '자');
    } catch (error) {
      console.error('❌ 통합 편집기 저장 실패:', error);
      toast({
        title: "저장 실패",
        description: "저장 공간이 부족할 수 있습니다.",
        variant: "destructive"
      });
    }
  };

  // 페이지 이벤트에서 즉시 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (editorContent) {
        savePermanently(editorContent);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && editorContent) {
        savePermanently(editorContent);
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
      permanentClearEditor();
    };
    
    window.addEventListener('app-reset', handleAppReset);
    return () => {
      window.removeEventListener('app-reset', handleAppReset);
    };
  }, []);

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

  // 사용자 편집 처리 및 즉시 저장
  const handleInput = () => {
    if (editorRef.current && !isGeneratingContent) {
      const newContent = editorRef.current.innerHTML;
      setEditorContent(newContent);
      onContentChange(newContent);
      
      // 편집 중 즉시 저장
      savePermanently(newContent);
      
      // 이미지 클릭 핸들러 다시 추가
      setTimeout(() => addImageClickHandlers(), 100);
    }
  };

  // 편집기 내용 영구 삭제
  const permanentClearEditor = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      setEditorContent('');
      localStorage.removeItem(UNIFIED_EDITOR_KEY);
      onContentChange('');
      
      toast({ 
        title: "🗑️ 편집기 영구 초기화", 
        description: "편집기 내용이 영구적으로 삭제되었습니다." 
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
              블로그 글 편집기 (API 키와 동일한 영구 보존)
            </span>
            <div className="flex flex-wrap gap-2">
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
        <CardContent className="w-full">
          {isGeneratingContent ? (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center justify-center min-h-[200px]">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
              <p className="font-semibold text-lg text-blue-600 mb-2">
                <span 
                  className="text-purple-600 font-bold text-xl animate-pulse"
                  style={{
                    background: 'linear-gradient(45deg, #8B5CF6, #EC4899, #06B6D4)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'wave 2s ease-in-out infinite, gradient 3s ease-in-out infinite'
                  }}
                >
                  파코월드
                </span>
                가 매력적인 블로그 글을 생성 중입니다...
              </p>
              <p className="text-sm">잠시만 기다려주세요.</p>
              <style jsx>{`
                @keyframes wave {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-10px); }
                }
                @keyframes gradient {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
              `}</style>
            </div>
          ) : editorContent ? (
            <div className="space-y-4 w-full">
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p className="font-bold mb-1">📝 편집 가능한 블로그 글 (API키와 동일한 영구 보존)</p>
                  <p>자유롭게 수정하세요. 이미지 클릭시 티스토리용 복사, 창 전환/새로고침해도 내용 영구 보존됨</p>
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
                key={contentSyncKey}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Edit className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>주제를 선택하고 글을 생성해보세요!</p>
              <p className="text-sm mt-2">또는 영구 저장된 내용이 자동으로 복원됩니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
