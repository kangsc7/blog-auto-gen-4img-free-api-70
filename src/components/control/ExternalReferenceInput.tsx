
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash } from 'lucide-react';
import { AppState } from '@/types';

interface ExternalReferenceInputProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  deleteReferenceData?: () => void;
}

export const ExternalReferenceInput: React.FC<ExternalReferenceInputProps> = ({
  appState,
  saveAppState,
  deleteReferenceData = () => {
    saveAppState({
      referenceLink: '',
      referenceSentence: ''
    });
  }
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">외부 링크 URL</label>
        <Input
          placeholder="https://example.com"
          value={appState.referenceLink || ''}
          onChange={(e) => saveAppState({ referenceLink: e.target.value })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">표시할 문장</label>
        <Textarea
          placeholder="관련 정보 더 보러가기"
          value={appState.referenceSentence || ''}
          onChange={(e) => saveAppState({ referenceSentence: e.target.value })}
          className="w-full resize-none"
          rows={2}
        />
      </div>

      {appState.referenceLink && (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={deleteReferenceData} 
          className="w-full"
        >
          <Trash className="h-4 w-4 mr-2" />
          링크 삭제
        </Button>
      )}
    </div>
  );
};
