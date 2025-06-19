
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Link, Save, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [pendingLink, setPendingLink] = useState(appState.referenceLink || '');
  const [pendingSentence, setPendingSentence] = useState(appState.referenceSentence || '');

  // 더블클릭으로 토글
  const handleDoubleClick = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSave = () => {
    saveAppState({
      referenceLink: pendingLink,
      referenceSentence: pendingSentence,
    });
  };

  const hasChanges = 
    pendingLink !== (appState.referenceLink || '') || 
    pendingSentence !== (appState.referenceSentence || '');

  return (
    <Card className="shadow-md">
      <CardHeader 
        className={`cursor-pointer transition-all duration-300 ${isCollapsed ? 'pb-3' : ''}`}
        onDoubleClick={handleDoubleClick}
      >
        <CardTitle className="flex items-center justify-between text-purple-700">
          <span className="flex items-center">
            <Link className="h-5 w-5 mr-2" />
            외부 참조 링크 설정
          </span>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <Button 
                onClick={handleSave}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4 mr-1" />
                저장
              </Button>
            )}
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </CardTitle>
        {isCollapsed && (
          <p className="text-xs text-gray-500 mt-1">
            더블클릭하여 내용 보기 • 현재: {pendingLink ? '링크 설정됨' : '링크 없음'}
          </p>
        )}
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">참조 링크 URL</label>
            <Input
              type="url"
              placeholder="https://example.com (선택사항)"
              value={pendingLink}
              onChange={(e) => setPendingLink(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              글 마지막에 표시될 외부 링크를 입력하세요 (미입력 시 기본 링크 사용)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">링크 텍스트</label>
            <Textarea
              placeholder="워드프레스 꿀팁 더 보러가기 (기본값)"
              value={pendingSentence}
              onChange={(e) => setPendingSentence(e.target.value)}
              className="min-h-20"
            />
            <p className="text-xs text-gray-500 mt-1">
              링크에 표시될 텍스트를 입력하세요 (미입력 시 기본 텍스트 사용)
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>💡 사용 팁:</strong> 더블클릭으로 창을 접거나 펼 수 있습니다.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              참조 링크는 블로그 글의 신뢰도를 높이고 독자에게 추가 정보를 제공합니다.
            </p>
          </div>

          {hasChanges && (
            <Button 
              onClick={handleSave}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              외부 참조 설정 저장
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
};
