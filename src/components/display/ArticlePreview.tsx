
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface ArticlePreviewProps {
  generatedContent: string;
  isGeneratingContent: boolean;
  selectedTopic: string;
}

export const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  generatedContent,
  isGeneratingContent,
  selectedTopic,
}) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-green-700">
          <FileText className="h-5 w-5 mr-2" />
          블로그 글 미리보기
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isGeneratingContent ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2">
              <span className="font-bold text-blue-600 animate-wave">파코월드</span>
              <span className="text-gray-600">가 매력적인 블로그 글을 작성중입니다...</span>
            </div>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
            <style jsx>{`
              @keyframes wave {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
              }
              .animate-wave {
                animation: wave 1.5s ease-in-out infinite;
                display: inline-block;
              }
            `}</style>
          </div>
        ) : generatedContent ? (
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: generatedContent }}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>주제를 선택하고 글 생성 버튼을 클릭해주세요.</p>
            {selectedTopic && (
              <p className="mt-2 text-sm">
                선택된 주제: <span className="font-semibold text-gray-700">{selectedTopic}</span>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
