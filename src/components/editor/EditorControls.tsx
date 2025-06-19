
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Download, Loader2, ClipboardCopy, RefreshCw } from 'lucide-react';

interface EditorControlsProps {
  editorContent: string;
  isGeneratingContent: boolean;
  onManualRefresh: () => void;
  onCopyToClipboard: () => void;
  onDownloadHTML: () => void;
}

export const EditorControls: React.FC<EditorControlsProps> = ({
  editorContent,
  isGeneratingContent,
  onManualRefresh,
  onCopyToClipboard,
  onDownloadHTML,
}) => {
  if (!editorContent || isGeneratingContent) {
    return null;
  }

  return (
    <div className="flex space-x-2">
      <Button 
        onClick={onManualRefresh}
        size="sm"
        variant="outline"
        className="text-purple-600 border-purple-600 hover:bg-purple-50"
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        새로고침
      </Button>
      <Button 
        onClick={onCopyToClipboard}
        size="sm"
        variant="outline"
        className="text-green-600 border-green-600 hover:bg-green-50"
      >
        <ClipboardCopy className="h-4 w-4 mr-1" />
        HTML 복사
      </Button>
      <Button 
        onClick={onDownloadHTML}
        size="sm"
        variant="outline"
        className="text-blue-600 border-blue-600 hover:bg-blue-50"
      >
        <Download className="h-4 w-4 mr-1" />
        다운로드
      </Button>
    </div>
  );
};
