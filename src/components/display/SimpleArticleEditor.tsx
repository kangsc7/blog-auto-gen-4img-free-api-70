
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [editorContent, setEditorContent] = useState('');
  const [isUserEditing, setIsUserEditing] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastExternalContentRef = useRef('');
  
  const STORAGE_KEY = 'blog_editor_content';

  // 안전한 localStorage 작업
  const saveToStorage = useCallback((content: string) => {
    try {
      if (content) {
        localStorage.setItem(STORAGE_KEY, content);
        console.log('✅ 편집기 콘텐츠 저장됨:', content.length, '글자');
      }
    } catch (error) {
      console.error('localStorage 저장 실패:', error);
    }
  }, []);

  const loadFromStorage = useCallback(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch (error) {
      console.error('localStorage 로드 실패:', error);
      return '';
    }
  }, []);

  // 초기화 - 한번만 실행
  useEffect(() => {
    const savedContent = loadFromStorage();
    if (savedContent && savedContent !== generatedContent) {
      console.log('📂 저장된 편집 내용 복원:', savedContent.length, '글자');
      setEditorContent(savedContent);
      onContentChange(savedContent);
      lastExternalContentRef.current = savedContent;
    } else if (generatedContent && !isGeneratingContent) {
      console.log('🆕 초기 생성 콘텐츠 설정:', generatedContent.length, '글자');
      setEditorContent(generatedContent);
      saveToStorage(generatedContent);
      onContentChange(generatedContent);
      lastExternalContentRef.current = generatedContent;
    }
  }, []); // 빈 의존성 배열로 한번만 실행

  // 새로운 외부 콘텐츠 처리 - 사용자가 편집 중이 아닐 때만
  useEffect(() => {
    if (generatedContent && 
        generatedContent !== lastExternalContentRef.current && 
        !isUserEditing && 
        !isGeneratingContent) {
      
      console.log('🔄 새로운 외부 콘텐츠 적용 (사용자 편집 중 아님)');
      setEditorContent(generatedContent);
      saveToStorage(generatedContent);
      onContentChange(generatedContent);
      lastExternalContentRef.current = generatedContent;
    }
  }, [generatedContent, isUserEditing, isGeneratingContent, onContentChange, saveToStorage]);

  // DOM 업데이트 - 사용자가 편집 중이 아닐 때만
  useEffect(() => {
    if (editorRef.current && 
        editorContent && 
        editorRef.current.innerHTML !== editorContent &&
        !isUserEditing) {
      
      console.log('🔄 DOM 업데이트 (사용자 편집 중 아님)');
      editorRef.current.innerHTML = editorContent;
    }
  }, [editorContent, isUserEditing]);

  // 자동 저장
  const performAutoSave = useCallback((content: string) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveToStorage(content);
      onContentChange(content);
      console.log('💾 자동 저장 완료:', content.length, '글자');
    }, 800);
  }, [saveToStorage, onContentChange]);

  // 사용자 입력 처리
  const handleInput = useCallback(() => {
    if (editorRef.current && !isGeneratingContent) {
      const newContent = editorRef.current.innerHTML;
      console.log('✏️ 사용자 입력 감지:', newContent.length, '글자');
      
      setEditorContent(newContent);
      setIsUserEditing(true);
      performAutoSave(newContent);
      
      // 3초 후 편집 상태 해제
      setTimeout(() => {
        setIsUserEditing(false);
        console.log('⏹️ 사용자 편집 상태 해제');
      }, 3000);
    }
  }, [isGeneratingContent, performAutoSave]);

  // 포커스 관리
  const handleFocus = useCallback(() => {
    console.log('🎯 편집기 포커스 획득');
    setIsUserEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    console.log('📝 편집기 포커스 해제');
    setTimeout(() => {
      setIsUserEditing(false);
    }, 1000);
  }, []);

  // 클립보드 복사
  const handleCopyToClipboard = useCallback(() => {
    if (!editorContent) {
      toast({ title: "복사 오류", description: "복사할 콘텐츠가 없습니다.", variant: "destructive" });
      return;
    }
    
    navigator.clipboard.writeText(editorContent).then(() => {
      toast({ title: "복사 완료", description: "수정된 HTML이 클립보드에 복사되었습니다." });
    }).catch(() => {
      toast({ title: "복사 실패", description: "클립보드 복사에 실패했습니다.", variant: "destructive" });
    });
  }, [editorContent, toast]);

  // HTML 파일 다운로드
  const handleDownloadHTML = useCallback(() => {
    if (!editorContent) {
      toast({ title: "다운로드 오류", description: "다운로드할 콘텐츠가 없습니다.", variant: "destructive" });
      return;
    }
    
    const blob = new Blob([editorContent], { type: 'text/html;charset=utf-8' });
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
  }, [editorContent, selectedTopic, toast]);

  // 페이지 언로드 시 최종 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (editorContent) {
        saveToStorage(editorContent);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [editorContent, saveToStorage]);

  return (
    <Card id="article-preview" className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center text-green-700">
            <Edit className="h-5 w-5 mr-2" />
            블로그 글 편집기
            {isUserEditing && <span className="ml-2 text-xs text-orange-500">✏️ 편집 중</span>}
          </span>
          <div className="flex space-x-2">
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
      <CardContent>
        {isGeneratingContent ? (
          <div className="text-center py-8 text-gray-500 flex flex-col items-center justify-center min-h-[200px]">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
            <p className="font-semibold text-lg text-blue-600">블로그 글을 생성하고 있습니다...</p>
            <p className="text-sm animate-fade-in">잠시만 기다려주세요.</p>
          </div>
        ) : editorContent ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              <p className="font-bold mb-1">📝 편집 가능한 블로그 글</p>
              <p>아래 내용을 자유롭게 수정하세요. 수정사항은 자동으로 저장됩니다.</p>
              <p className="text-xs text-green-600 mt-1">✅ 실시간 자동 저장: 편집 내용이 안전하게 보존됩니다</p>
            </div>
            <div
              ref={editorRef}
              contentEditable={true}
              className="border border-gray-300 rounded-lg p-6 min-h-[400px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent prose max-w-none"
              onInput={handleInput}
              onFocus={handleFocus}
              onBlur={handleBlur}
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
  );
};
