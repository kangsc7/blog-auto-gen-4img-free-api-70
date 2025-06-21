
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Eye } from 'lucide-react';

interface ContentActionsProps {
  generatedContent: string;
  copyToClipboard: (text: string, type: string) => void;
  downloadHTML: () => void;
}

export const ContentActions: React.FC<ContentActionsProps> = ({
  generatedContent,
  copyToClipboard,
  downloadHTML,
}) => {
  if (!generatedContent) return null;

  // 블로그 글 편집기로 이동하는 함수
  const scrollToEditor = () => {
    console.log('📋 블로그 글 편집기로 이동 시도');
    
    const editorElement = document.getElementById('article-preview');
    if (editorElement) {
      editorElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      console.log('✅ 블로그 글 편집기로 스크롤 완료');
    } else {
      console.error('❌ 블로그 글 편집기 요소를 찾을 수 없음');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex gap-2 justify-center mb-4">
        <Button
          onClick={scrollToEditor}
          disabled={!generatedContent}
          variant="outline"
          size="sm"
          className="text-purple-600 border-purple-600 hover:bg-purple-50"
        >
          <Eye className="h-4 w-4 mr-1" />
          블로그 글 편집기
        </Button>
        <Button
          onClick={() => copyToClipboard(generatedContent, 'HTML')}
          disabled={!generatedContent}
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          <Copy className="h-4 w-4 mr-1" />
          HTML 복사
        </Button>
        <Button
          onClick={() => downloadHTML()}
          disabled={!generatedContent}
          variant="outline"
          size="sm"
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          <Download className="h-4 w-4 mr-1" />
          다운로드
        </Button>
      </div>
    </div>
  );
};
