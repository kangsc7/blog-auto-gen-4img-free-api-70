
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ExternalLink, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { AppState } from '@/types';

interface ExternalReferenceInputProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
}

export const ExternalReferenceInput: React.FC<ExternalReferenceInputProps> = ({
  appState,
  saveAppState,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleReferenceUrlChange = (url: string) => {
    saveAppState({ referenceLink: url });
  };

  const handleReferenceSentenceChange = (sentence: string) => {
    saveAppState({ referenceSentence: sentence });
  };

  const clearReferenceData = () => {
    saveAppState({ 
      referenceLink: '', 
      referenceSentence: '' 
    });
  };

  const handleDoubleClick = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Card className="shadow-md" onDoubleClick={handleDoubleClick}>
      <CardHeader className="cursor-pointer">
        <CardTitle className="flex items-center justify-between text-indigo-700">
          <span className="flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            4. 외부 링크 설정 (선택사항)
          </span>
          <div className="flex items-center space-x-2">
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
            <span className="text-xs text-gray-500">더블클릭으로 접기/펼치기</span>
          </div>
        </CardTitle>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">외부 참조 링크</label>
            <Input
              placeholder="관련 웹사이트 URL을 입력하세요 (예: https://example.com)"
              value={appState.referenceLink || ''}
              onChange={(e) => handleReferenceUrlChange(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">블로그 글 하단에 추가될 외부 링크입니다.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">링크 설명 문구</label>
            <Textarea
              placeholder="링크에 대한 설명을 입력하세요 (예: 더 자세한 정보 확인하기)"
              value={appState.referenceSentence || ''}
              onChange={(e) => handleReferenceSentenceChange(e.target.value)}
              className="min-h-16"
            />
            <p className="text-xs text-gray-500 mt-1">링크와 함께 표시될 설명 문구입니다.</p>
          </div>

          {(appState.referenceLink || appState.referenceSentence) && (
            <Button
              onClick={clearReferenceData}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              링크 정보 삭제
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
};
