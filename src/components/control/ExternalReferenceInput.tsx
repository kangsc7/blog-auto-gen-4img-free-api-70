
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, Quote } from 'lucide-react';
import { AppState } from '@/types';

interface ExternalReferenceInputProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
}

export const ExternalReferenceInput: React.FC<ExternalReferenceInputProps> = ({
  appState,
  saveAppState,
}) => {
  const handleReferenceLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    saveAppState({ referenceLink: e.target.value });
  };

  const handleReferenceSentenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    saveAppState({ referenceSentence: e.target.value });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-700">
          <ExternalLink className="h-5 w-5 mr-2" />
          외부 링크 및 문장 참조
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            참조 링크 (선택사항)
          </label>
          <Input
            type="url"
            placeholder="https://example.com"
            value={appState.referenceLink || ''}
            onChange={handleReferenceLinkChange}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            참조할 웹페이지 URL을 입력하면 해당 내용을 분석하여 글에 반영합니다
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Quote className="h-4 w-4 mr-1" />
            참조 문장 (선택사항)
          </label>
          <Textarea
            placeholder="참조하고 싶은 특정 문장이나 내용을 입력하세요..."
            value={appState.referenceSentence || ''}
            onChange={handleReferenceSentenceChange}
            className="w-full min-h-[80px] resize-none"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            특정 문장이나 내용을 참조하여 관련된 글을 작성합니다
          </p>
        </div>

        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border">
          💡 참조 링크와 문장은 AI가 글을 작성할 때 추가적인 맥락과 정보로 활용됩니다.
        </div>
      </CardContent>
    </Card>
  );
};
