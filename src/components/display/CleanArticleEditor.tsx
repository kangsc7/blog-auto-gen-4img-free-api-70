
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Download, Loader2, ClipboardCopy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorContent, setEditorContent] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const initLockRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  // 명령 실행 상태 추적을 위한 ref
  const isCommandExecutingRef = useRef(false);
  const lastUserActionRef = useRef<'typing' | 'command' | 'loading'>('typing');

  // 안전한 localStorage 저장
  const saveToStorage = (content: string) => {
    try {
      localStorage.setItem(UNIFIED_EDITOR_KEY, content);
      console.log('✅ 편집기 내용 저장 완료:', content.length + '자');
    } catch (error) {
      console.error('❌ 편집기 내용 저장 실패:', error);
    }
  };

  // 안전한 localStorage 로드 - 명령 실행 중에는 차단
  const loadFromStorage = (): string => {
    if (isCommandExecutingRef.current) {
      console.log('🚫 명령 실행 중 - 자동 복원 차단');
      return '';
    }
    
    try {
      const saved = localStorage.getItem(UNIFIED_EDITOR_KEY);
      console.log('📖 편집기 내용 로드:', saved ? saved.length + '자' : '없음');
      return saved || '';
    } catch (error) {
      console.error('❌ 편집기 내용 로드 실패:', error);
      return '';
    }
  };

  // 명령어 감지 함수
  const detectCommand = (content: string): boolean => {
    const commandPatterns = [
      /\/생성/,
      /\/새글/,
      /\/초기화/,
      /\/저장/,
      /\/복원/,
      /\/삭제/,
      // 추가 명령어 패턴들
    ];
    
    return commandPatterns.some(pattern => pattern.test(content));
  };

  // 편집기 내용 업데이트 (명령 실행 상태 고려)
  const updateEditorContent = (content: string, source: string) => {
    console.log(`🔄 편집기 내용 업데이트 시도 - ${source}:`, {
      contentLength: content.length,
      isCommandExecuting: isCommandExecutingRef.current,
      lastUserAction: lastUserActionRef.current
    });

    // 명령 실행 중이고 소스가 자동 복원인 경우 차단
    if (isCommandExecutingRef.current && (source === '초기로드' || source === '글로벌이벤트')) {
      console.log(`🚫 명령 실행 중 자동 복원 차단 - ${source}`);
      return;
    }

    if (content === editorContent) {
      console.log(`⏭️ 편집기 내용 동일 - ${source} 건너뜀`);
      return;
    }
    
    setEditorContent(content);
    
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
      setTimeout(() => addImageClickHandlers(), 100);
    }
    
    onContentChange(content);
    
    // 디바운스된 저장 (명령 실행 중이 아닐 때만)
    if (!isCommandExecutingRef.current) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveToStorage(content);
      }, 500);
    }
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

  // 새 생성 콘텐츠 처리 (생성 완료 시에만, 명령 실행 중이 아닐 때)
  useEffect(() => {
    if (!isGeneratingContent && generatedContent && generatedContent.length > 100 && isInitialized) {
      console.log('🎯 새 생성 콘텐츠 감지:', {
        contentLength: generatedContent.length,
        isCommandExecuting: isCommandExecutingRef.current
      });
      
      // 명령 실행이 완료된 후에만 업데이트
      if (!isCommandExecutingRef.current) {
        updateEditorContent(generatedContent, '새생성');
        lastUserActionRef.current = 'loading';
      }
    }
  }, [isGeneratingContent, generatedContent, isInitialized]);

  // 글로벌 이벤트 리스너 - 명령 실행 상태 고려
  useEffect(() => {
    const handleContentUpdate = (event: CustomEvent) => {
      const newContent = event.detail.content;
      if (newContent && isInitialized) {
        console.log('📢 글로벌 콘텐츠 업데이트 이벤트:', {
          contentLength: newContent.length,
          isCommandExecuting: isCommandExecutingRef.current
        });
        
        // 명령 실행 중이 아닐 때만 업데이트
        if (!isCommandExecutingRef.current) {
          updateEditorContent(newContent, '글로벌이벤트');
        }
      }
    };

    const handleAppReset = () => {
      console.log('🔄 앱 리셋 이벤트');
      isCommandExecutingRef.current = false; // 리셋 시 명령 상태도 초기화
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

  // 페이지 종료 시 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (editorContent && !isCommandExecutingRef.current) {
        saveToStorage(editorContent);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && editorContent && !isCommandExecutingRef.current) {
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

  // 향상된 이미지 클릭 핸들러
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

  // 사용자 편집 처리 - 명령어 감지 및 상태 추적
  const handleInput = () => {
    if (editorRef.current && !isGeneratingContent) {
      const newContent = editorRef.current.innerHTML;
      
      // 명령어 감지
      const isCommand = detectCommand(newContent);
      
      if (isCommand) {
        console.log('🎯 명령어 감지됨:', newContent.substring(0, 50) + '...');
        isCommandExecutingRef.current = true;
        lastUserActionRef.current = 'command';
        
        // 명령어 실행 타임아웃 설정 (5초 후 자동 해제)
        setTimeout(() => {
          if (isCommandExecutingRef.current) {
            console.log('⏰ 명령 실행 타임아웃 - 상태 자동 해제');
            isCommandExecutingRef.current = false;
          }
        }, 5000);
      } else {
        // 일반 타이핑인 경우
        if (lastUserActionRef.current === 'command') {
          // 명령어 실행 후 일반 타이핑으로 변경됨
          console.log('✏️ 명령어 → 일반 타이핑으로 전환');
          isCommandExecutingRef.current = false;
        }
        lastUserActionRef.current = 'typing';
      }
      
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
    
    const cleanContent = editorContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    navigator.clipboard.writeText(cleanContent).then(() => {
      toast({ 
        title: "✅ HTML 복사 완료 (SCRIPT 태그 제거됨)", 
        description: "티스토리 코드 편집창에 안전하게 붙여넣으세요." 
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

  // 인포그래픽 페이지로 이동
  const goToInfographic = () => {
    console.log('📊 인포그래픽 페이지로 이동');
    navigate('/infographic-generator');
  };

  return (
    <div className="w-full max-w-full">
      <Card className="shadow-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center text-green-700">
              <Edit className="h-5 w-5 mr-2" />
              블로그 글 편집기
              {isCommandExecutingRef.current && (
                <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                  명령 실행 중
                </span>
              )}
            </span>
            <div style={{ height: '10px' }}></div>
            <div className="flex flex-wrap gap-2 justify-center w-full">
              {editorContent && !isGeneratingContent && (
                <>
                  <Button 
                    onClick={goToInfographic}
                    size="sm"
                    variant="outline"
                    className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    인포그래픽 페이지 이동
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
                  <p className="font-bold mb-1">📝 편집 가능한 블로그 글을 자유롭게 수정하세요.</p>
                  {isCommandExecutingRef.current && (
                    <p className="text-xs text-orange-600 mt-1">⚠️ 명령 실행 중 - 자동 복원이 차단됩니다</p>
                  )}
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
                  lineHeight: '1.7',
                  fontFamily: 'inherit',
                  width: '100%',
                  maxWidth: '100%',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  minWidth: '0',
                  fontSize: '18px'
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
      
      {/* 왼쪽 정렬 강제 적용 스타일 */}
      <style>{`
        .prose * {
          text-align: left !important;
        }
        
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          text-align: left !important;
        }
        
        .prose p {
          text-align: left !important;
          line-height: 1.7 !important;
          margin-bottom: 18px !important;
          font-size: 18px !important;
        }
        
        @media (max-width: 768px) {
          .prose {
            max-width: 680px !important;
            padding: 16px !important;
            font-size: 18px !important;
          }
          
          .prose h1, .prose h2, .prose h3 {
            text-align: left !important;
          }
          
          .prose p {
            text-align: left !important;
            line-height: 1.7 !important;
            margin-bottom: 18px !important;
          }
        }
      `}</style>
    </div>
  );
};
