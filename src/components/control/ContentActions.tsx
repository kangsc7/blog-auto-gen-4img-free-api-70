
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, FileEdit } from 'lucide-react';

interface ContentActionsProps {
  generatedContent: string;
  copyToClipboard: (text: string, type: string) => void;
  downloadHTML: () => void;
  convertToMarkdown?: () => void;
}

export const ContentActions: React.FC<ContentActionsProps> = ({
  generatedContent,
  copyToClipboard,
  downloadHTML,
  convertToMarkdown,
}) => {
  if (!generatedContent) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex gap-2 justify-center mb-4 flex-wrap">
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
        {convertToMarkdown && (
          <Button
            onClick={convertToMarkdown}
            disabled={!generatedContent}
            variant="outline"
            size="sm"
            className="text-purple-600 border-purple-600 hover:bg-purple-50"
          >
            <FileEdit className="h-4 w-4 mr-1" />
            마크다운 변환
          </Button>
        )}
      </div>
    </div>
  );
};
