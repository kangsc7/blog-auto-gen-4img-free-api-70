
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Download, Loader2 } from 'lucide-react';

interface ArticlePreviewProps {
  generatedContent: string;
  isGeneratingContent: boolean;
  copyToClipboard: (text: string, type: string) => void;
  downloadHTML: () => void;
}

export const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  generatedContent,
  isGeneratingContent,
  copyToClipboard,
  downloadHTML,
}) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center text-green-700">
            <Edit className="h-5 w-5 mr-2" />
            블로그 글 미리보기
          </span>
          <div className="flex space-x-2">
            {generatedContent && !isGeneratingContent && (
              <>
                <Button 
                  onClick={() => copyToClipboard(generatedContent, 'HTML 복사')}
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  HTML 복사
                </Button>
                <Button 
                  onClick={downloadHTML}
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
            <p className="font-semibold text-lg">AI가 글을 생성하고 있습니다...</p>
            <p className="text-sm">잠시만 기다려주세요.</p>
          </div>
        ) : generatedContent ? (
          <div className="border p-4 rounded bg-gray-50 overflow-y-auto max-h-[1024px]">
            <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
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
