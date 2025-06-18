
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ExternalLink, Quote, Save, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { AppState } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ExternalReferenceInputProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  deleteReferenceData?: () => void;
}

export const ExternalReferenceInput: React.FC<ExternalReferenceInputProps> = ({
  appState,
  saveAppState,
  deleteReferenceData,
}) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReferenceLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('참조 링크 변경 (영구 보존):', value);
    saveAppState({ referenceLink: value });
  };

  const handleReferenceSentenceChange = (e: React.ChangeEvent<HTMLTextAreaEvent>) => {
    const value = e.target.value;
    console.log('참조 문장 변경 (영구 보존):', value);
    saveAppState({ referenceSentence: value });
  };

  const handleSave = () => {
    toast({
      title: "영구 저장 완료",
      description: "참조 링크와 문장이 영구 저장되었습니다. 초기화, 재로그인, 새로고침해도 유지됩니다.",
    });
    console.log('참조 정보 영구 저장됨:', {
      referenceLink: appState.referenceLink,
      referenceSentence: appState.referenceSentence
    });
  };

  const handleDelete = () => {
    if (deleteReferenceData) {
      deleteReferenceData();
    } else {
      saveAppState({ 
        referenceLink: '', 
        referenceSentence: '' 
      });
      toast({
        title: "삭제 완료",
        description: "참조 링크와 문장이 삭제되었습니다.",
      });
    }
    console.log('참조 정보 삭제됨');
  };

  return (
    <Card className="shadow-md">
      <CardHeader 
        className="cursor-pointer"
        onDoubleClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between text-purple-700">
          <span className="flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            외부 링크 설정
          </span>
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="flex justify-end space-x-2 mb-4">
            <Button
              onClick={handleSave}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              영구 저장
            </Button>
            <Button
              onClick={handleDelete}
              size="sm"
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              영구 삭제
            </Button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              참조 링크 (영구 보존)
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
              참조 문장 (영구 보존)
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
            <br />
            🔒 <strong>영구 보존</strong>: 초기화, 재로그인, 새로고침해도 삭제되지 않습니다.
          </div>

          {(appState.referenceLink || appState.referenceSentence) && (
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded border">
              ✅ 현재 영구 저장된 참조 정보:
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
      )}
    </Card>
  );
};
