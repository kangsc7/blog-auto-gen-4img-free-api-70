
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ExternalLink, Quote, Save, Trash2 } from 'lucide-react';
import { AppState } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ExternalReferenceInputProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
}

export const ExternalReferenceInput: React.FC<ExternalReferenceInputProps> = ({
  appState,
  saveAppState,
}) => {
  const { toast } = useToast();

  const handleReferenceLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('참조 링크 변경:', value);
    saveAppState({ referenceLink: value });
  };

  const handleReferenceSentenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    console.log('참조 문장 변경:', value);
    saveAppState({ referenceSentence: value });
  };

  const handleSave = () => {
    // 이미 saveAppState로 실시간 저장되고 있으므로 확인 메시지만 표시
    toast({
      title: "저장 완료",
      description: "참조 링크와 문장이 저장되었습니다. 블로그 글 생성 시 자동으로 반영됩니다.",
    });
    console.log('참조 정보 저장됨:', {
      referenceLink: appState.referenceLink,
      referenceSentence: appState.referenceSentence
    });
  };

  const handleDelete = () => {
    saveAppState({ 
      referenceLink: '', 
      referenceSentence: '' 
    });
    toast({
      title: "삭제 완료",
      description: "참조 링크와 문장이 삭제되었습니다.",
    });
    console.log('참조 정보 삭제됨');
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-purple-700">
          <span className="flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            외부 링크 및 문장 참조
          </span>
          <div className="flex space-x-2">
            <Button
              onClick={handleSave}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              저장
            </Button>
            <Button
              onClick={handleDelete}
              size="sm"
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              삭제
            </Button>
          </div>
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
          💡 참조 링크와 문장은 AI가 글을 작성할 때 추가적인 맥락과 정보로 활용되며, 
          저장된 참조 링크는 블로그 글 하단에 자동으로 하이퍼링크로 연결됩니다.
        </div>

        {(appState.referenceLink || appState.referenceSentence) && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded border">
            ✅ 현재 저장된 참조 정보:
            {appState.referenceLink && (
              <div className="mt-1">
                <strong>링크:</strong> {appState.referenceLink}
              </div>
            )}
            {appState.referenceSentence && (
              <div className="mt-1">
                <strong>문장:</strong> {appState.referenceSentence.substring(0, 50)}...
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
