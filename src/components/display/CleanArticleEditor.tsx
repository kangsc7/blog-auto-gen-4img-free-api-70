
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Download, Loader2, ClipboardCopy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CleanArticleEditorProps {
  generatedContent: string;
  isGeneratingContent: boolean;
  selectedTopic: string;
  onContentChange: (content: string) => void;
}

export const CleanArticleEditor: React.FC<CleanArticleEditorProps> = ({
  generatedContent,
  isGeneratingContent,
  selectedTopic,
  onContentChange,
}) => {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorContent, setEditorContent] = useState('');
  
  // 이미지 클릭 핸들러 - 티스토리용 이미지 복사
  const handleImageClick = async (imageUrl: string) => {
    try {
      console.log('이미지 클릭 복사 시도:', imageUrl);
      
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
      console.error('이미지 복사 실패:', error);
      toast({
        title: "⚠️ 이미지 복사 실패",
        description: "이미지 우클릭 → '이미지 복사'를 시도해보세요.",
        variant: "default",
        duration: 3000
      });
    }
  };

  // 새로운 콘텐츠가 생성되면 편집기에 반영
  useEffect(() => {
    if (generatedContent && !isGeneratingContent && generatedContent !== editorContent) {
      console.log('새 콘텐츠 적용:', generatedContent.length + '자');
      setEditorContent(generatedContent);
      
      if (editorRef.current) {
        editorRef.current.innerHTML = generatedContent;
        
        // 이미지에 클릭 이벤트 추가
        const images = editorRef.current.querySelectorAll('img');
        images.forEach(img => {
          img.style.cursor = 'pointer';
          img.title = '클릭하면 이미지가 클립보드에 복사됩니다';
          
          img.addEventListener('click', () => {
            const src = img.getAttribute('src');
            if (src) {
              handleImageClick(src);
            }
          });
        });
      }
      
      onContentChange(generatedContent);
    }
  }, [generatedContent, isGeneratingContent, editorContent, onContentChange]);

  // 사용자 편집 처리
  const handleInput = () => {
    if (editorRef.current && !isGeneratingContent) {
      const newContent = editorRef.current.innerHTML;
      setEditorContent(newContent);
      onContentChange(newContent);
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
        title: "HTML 복사 완료", 
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
    toast({ title: "다운로드 완료" });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center text-green-700">
            <Edit className="h-5 w-5 mr-2" />
            블로그 글 편집기 (티스토리 이미지 복사 지원)
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
            <p className="font-semibold text-lg text-blue-600">글을 생성하고 있습니다...</p>
            <p className="text-sm">잠시만 기다려주세요.</p>
          </div>
        ) : editorContent ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              <p className="font-bold mb-1">📝 편집 가능한 블로그 글</p>
              <p>아래 내용을 자유롭게 수정하세요. 이미지 클릭 시 티스토리용 복사가 됩니다.</p>
            </div>
            <div
              ref={editorRef}
              contentEditable={true}
              className="border border-gray-300 rounded-lg p-6 min-h-[400px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 prose max-w-none"
              onInput={handleInput}
              suppressContentEditableWarning={true}
              style={{
                lineHeight: '1.6',
                fontFamily: 'inherit',
                width: '100%',
                maxWidth: '100%'
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
