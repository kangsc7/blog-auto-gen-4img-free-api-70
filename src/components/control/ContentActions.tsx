
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  if (!generatedContent) return null;

  // 인포그래픽 페이지로 이동하는 함수
  const goToInfographic = () => {
    console.log('📊 인포그래픽 페이지로 이동');
    navigate('/infographic-generator');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex gap-2 justify-center mb-4">
        <Button
          onClick={goToInfographic}
          disabled={!generatedContent}
          variant="outline"
          size="sm"
          className="text-purple-600 border-purple-600 hover:bg-purple-50"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          인포그래픽 페이지 이동
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
