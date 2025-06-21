
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface ContentDisplayProps {
  title: string;
  content: string;
  selectedStyle: string;
  sourceAnalysis: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLoadContent: () => void;
  styleOptions: Array<{ id: string; name: string; }>;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({
  title,
  content,
  selectedStyle,
  sourceAnalysis,
  isCollapsed,
  onToggleCollapse,
  onLoadContent,
  styleOptions
}) => {
  return (
    <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader 
        className="bg-gradient-to-r from-gray-50 to-gray-100 cursor-pointer"
        onDoubleClick={onToggleCollapse}
      >
        <CardTitle className="flex items-center text-gray-800">
          <FileText className="mr-2 h-5 w-5" />
          원본 블로그 콘텐츠
          {isCollapsed ? (
            <ChevronDown className="ml-auto h-5 w-5" />
          ) : (
            <ChevronUp className="ml-auto h-5 w-5" />
          )}
          {selectedStyle && (
            <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
              {styleOptions.find(s => s.id === selectedStyle)?.name}
            </span>
          )}
        </CardTitle>
        <p className="text-xs text-gray-500">더블클릭으로 접기/펼치기</p>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="p-6 max-h-96 overflow-y-auto">
          <h3 className="font-bold text-lg mb-3 text-gray-800">{title || '제목 없음'}</h3>
          {content ? (
            <div 
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
              <p className="text-gray-500 mb-4">블로그 편집기에서 콘텐츠를 가져와주세요.</p>
              <Button 
                onClick={onLoadContent}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                콘텐츠 자동 로드
              </Button>
            </div>
          )}
          {sourceAnalysis && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <p className="text-sm text-blue-700">{sourceAnalysis}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ContentDisplay;
