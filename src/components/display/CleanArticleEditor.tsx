
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
  const initLockRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // 안전한 localStorage 저장
  const saveToStorage = (content: string) => {
    try {
      localStorage.setItem(UNIFIED_EDITOR_KEY, content);
      console.log('✅ 편집기 내용 저장 완료:', content.length + '자');
    } catch (error) {
      console.error('❌ 편집기 내용 저장 실패:', error);
    }
  };

  const loadFromStorage = (): string => {
    try {
      const saved = localStorage.getItem(UNIFIED_EDITOR_KEY);
      console.log('📖 편집기 내용 로드:', saved ? saved.length + '자' : '없음');
      return saved || '';
    } catch (error) {
      console.error('❌ 편집기 내용 로드 실패:', error);
      return '';
    }
  };

  const updateEditorContent = (content: string, source: string) => {
    if (content === editorContent) {
      console.log(`⏭️ 편집기 내용 동일 - ${source} 건너뜀`);
      return;
    }

    console.log(`🔄 편집기 내용 업데이트 - ${source}:`, content.length + '자');
    
    setEditorContent(content);
    
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
      setTimeout(() => addImageClickHandlers(), 100);
    }
    
    onContentChange(content);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage(content);
    }, 500);
  };

  // 초기 로드 (한 번만 실행)
  useEffect(() => {
    if (!isInitialized && !initLockRef.current) {
      initLockRef.current = true;
      console.log('🚀 편집기 초기 로드 시작');
      
      const savedContent = loadFromStorage();
      if (savedContent) {
        updateEditorContent(savedContent, '초기로드');
      }
      
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isGeneratingContent && generatedContent && generatedContent.length > 100 && isInitialized) {
      console.log('🎯 새 생성 콘텐츠 감지:', generatedContent.length + '자');
      updateEditorContent(generatedContent, '새생성');
    }
  }, [isGeneratingContent, generatedContent, isInitialized]);

  useEffect(() => {
    const handleContentUpdate = (event: CustomEvent) => {
      const newContent = event.detail.content;
      if (newContent && isInitialized) {
        console.log('📢 글로벌 콘텐츠 업데이트 이벤트:', newContent.length + '자');
        updateEditorContent(newContent, '글로벌이벤트');
      }
    };

    const handleAppReset = () => {
      console.log('🔄 앱 리셋 이벤트');
      updateEditorContent('', '앱리셋');
      localStorage.removeItem(UNIFIED_EDITOR_KEY);
    };

    window.addEventListener('editor-content-updated', handleContentUpdate as EventListener);
    window.addEventListener('app-reset', handleAppReset);
    
    return () => {
      window.removeEventListener('editor-content-updated', handleContentUpdate as EventListener);
      window.removeEventListener('app-reset', handleAppReset);
    };
  }, [isInitialized]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (editorContent) {
        saveToStorage(editorContent);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && editorContent) {
        saveToStorage(editorContent);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editorContent]);

  // 향상된 이미지 클릭 핸들러 - 불필요한 정보 제거
  const addImageClickHandlers = () => {
    if (editorRef.current) {
      const images = editorRef.current.querySelectorAll('img');
      console.log('🖼️ 이미지 클릭 핸들러 추가:', images.length + '개');
      
      images.forEach((img) => {
        img.style.cursor = 'pointer';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.transition = 'all 0.3s ease';
        img.title = '🖱️ 클릭하면 티스토리용으로 이미지가 복사됩니다';
        
        img.onclick = async () => {
          const src = img.getAttribute('src') || img.getAttribute('data-image-url');
          if (src) {
            try {
              const response = await fetch(src);
              const blob = await response.blob();
              const clipboardItem = new ClipboardItem({ [blob.type]: blob });
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

  const handleInput = () => {
    if (editorRef.current && !isGeneratingContent) {
      const newContent = editorRef.current.innerHTML;
      updateEditorContent(newContent, '사용자편집');
      setTimeout(() => addImageClickHandlers(), 100);
    }
  };

  // HTML 복사 - SCRIPT 태그 제거
  const handleCopyToClipboard = () => {
    if (!editorContent) {
      toast({ title: "복사할 콘텐츠가 없습니다.", variant: "destructive" });
      return;
    }
    
    // SCRIPT 태그와 JavaScript 코드 제거
    const cleanedContent = editorContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:[^"']*/gi, '');
    
    navigator.clipboard.writeText(cleanedContent).then(() => {
      toast({ 
        title: "✅ HTML 복사 완료", 
        description: "티스토리 코드 편집창에 붙여넣으세요. (SCRIPT 태그 제거됨)" 
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
                  className="text-purple-600 font-bold text-xl inline-block"
                  style={{
                    background: 'linear-gradient(45deg, #8B5CF6, #EC4899, #06B6D4)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'waveFloat 2s ease-in-out infinite, gradientShift 3s ease-in-out infinite'
                  }}
                >
                  파코월드
                </span>
                가 매력적인 블로그 글을 생성 중입니다...
              </p>
              <p className="text-sm">잠시만 기다려주세요.</p>
              <style>{`
                @keyframes waveFloat {
                  0%, 100% { 
                    transform: translateY(0px) rotate(0deg) scale(1);
                  }
                  25% { 
                    transform: translateY(-12px) rotate(-3deg) scale(1.05);
                  }
                  50% { 
                    transform: translateY(-8px) rotate(2deg) scale(1.1);
                  }
                  75% { 
                    transform: translateY(-15px) rotate(-2deg) scale(1.05);
                  }
                }
                @keyframes gradientShift {
                  0% { 
                    background-position: 0% 50%;
                    filter: hue-rotate(0deg);
                  }
                  33% { 
                    background-position: 100% 50%;
                    filter: hue-rotate(120deg);
                  }
                  66% { 
                    background-position: 50% 100%;
                    filter: hue-rotate(240deg);
                  }
                  100% { 
                    background-position: 0% 50%;
                    filter: hue-rotate(360deg);
                  }
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
                dangerouslySetInnerHTML={{ __html: editorContent }}
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
