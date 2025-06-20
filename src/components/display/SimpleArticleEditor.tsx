import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, BarChart3 } from 'lucide-react';
import { AppState } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { InfographicConfirmDialog } from '@/components/dialog/InfographicConfirmDialog';

interface SimpleArticleEditorProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  copyToClipboard: (text: string, type: string) => void;
  downloadHTML: () => void;
}

export const SimpleArticleEditor: React.FC<SimpleArticleEditorProps> = ({
  appState,
  saveAppState,
  copyToClipboard,
  downloadHTML,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isInfographicDialogOpen, setIsInfographicDialogOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const isEditingRef = useRef(false);

  useEffect(() => {
    const handleAppReset = () => {
      if (editorRef.current) {
        editorRef.current.innerHTML = '<p style="color: #999;">여기에 생성된 블로그 글이 표시됩니다...</p>';
      }
    };

    window.addEventListener('app-reset', handleAppReset);

    return () => {
      window.removeEventListener('app-reset', handleAppReset);
    };
  }, []);

  useEffect(() => {
    const storedContent = localStorage.getItem('generatedContent');
    if (storedContent && !appState.generatedContent) {
      saveAppState({ generatedContent: storedContent });
    }

    const handleBeforeUnload = () => {
      if (appState.generatedContent) {
        localStorage.setItem('generatedContent', appState.generatedContent);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [appState.generatedContent, saveAppState]);

  const handleContentChange = () => {
    if (editorRef.current && !isEditingRef.current) {
      isEditingRef.current = true;
      const content = editorRef.current.innerHTML;
      const cleanedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      saveAppState({ generatedContent: cleanedContent });
      
      setTimeout(() => {
        isEditingRef.current = false;
      }, 100);
    }
  };

  const handleInfographicGeneration = () => {
    if (!appState.generatedContent?.trim()) {
      toast({
        title: "⚠️ 콘텐츠 없음",
        description: "인포그래픽을 생성하려면 먼저 블로그 글을 작성해주세요.",
        variant: "destructive"
      });
      return;
    }
    setIsInfographicDialogOpen(true);
  };

  const handleInfographicConfirm = () => {
    setIsInfographicDialogOpen(false);
    
    // Navigate to infographic page with blog content
    navigate('/infographic-generator', {
      state: {
        blogContent: appState.generatedContent,
        blogTitle: appState.selectedTopic || '블로그 글'
      }
    });
  };

  const handleInfographicCancel = () => {
    setIsInfographicDialogOpen(false);
  };

  return (
    <Card className="shadow-lg border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center justify-between text-blue-700">
          <span>📝 블로그 글 편집기</span>
          <div className="flex space-x-2">
            <Button
              onClick={handleInfographicGeneration}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              인포그래픽 생성
            </Button>
            <Button
              onClick={() => copyToClipboard(appState.generatedContent || '', "HTML")}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Copy className="h-4 w-4 mr-1" />
              HTML 복사
            </Button>
            <Button
              onClick={downloadHTML}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-1" />
              다운로드
            </Button>
          </div>
        </CardTitle>
        <p className="text-xs text-gray-500 mt-1">
          자유롭게 수정하세요.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          onBlur={handleContentChange}
          className="min-h-[400px] p-6 focus:outline-none prose prose-sm max-w-none"
          style={{
            lineHeight: '1.6',
            fontSize: '16px',
          }}
          dangerouslySetInnerHTML={{
            __html: appState.generatedContent || '<p style="color: #999;">여기에 생성된 블로그 글이 표시됩니다...</p>'
          }}
        />
        
        {/* Bottom Infographic Button */}
        <div className="p-4 bg-gray-50 border-t flex justify-center">
          <Button
            onClick={handleInfographicGeneration}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            인포그래픽 생성하기
          </Button>
        </div>
      </CardContent>

      <InfographicConfirmDialog
        isOpen={isInfographicDialogOpen}
        onConfirm={handleInfographicConfirm}
        onCancel={handleInfographicCancel}
      />
    </Card>
  );
};
