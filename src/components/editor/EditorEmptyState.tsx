
import React from 'react';
import { Edit } from 'lucide-react';

interface EditorEmptyStateProps {
  showDebugInfo?: boolean;
  generatedContent?: string;
  isGeneratingContent?: boolean;
  contentVersion?: number;
  isContentVisible?: boolean;
}

export const EditorEmptyState: React.FC<EditorEmptyStateProps> = ({
  showDebugInfo,
  generatedContent,
  isGeneratingContent,
  contentVersion,
  isContentVisible,
}) => {
  return (
    <div className="text-center py-8 text-gray-500">
      <Edit className="h-12 w-12 mx-auto mb-2 opacity-50" />
      <p>주제를 선택하고 글을 생성해보세요!</p>
      {showDebugInfo && (
        <div className="mt-4 text-xs text-gray-400">
          <p>생성된 콘텐츠: {generatedContent ? '있음' : '없음'}</p>
          <p>생성 중: {isGeneratingContent ? '예' : '아니오'}</p>
          <p>버전: {contentVersion}</p>
          <p>표시 상태: {isContentVisible ? '표시됨' : '숨김'}</p>
        </div>
      )}
    </div>
  );
};
