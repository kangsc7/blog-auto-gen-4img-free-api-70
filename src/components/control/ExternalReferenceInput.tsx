import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ExternalLink, Quote, Save, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { AppState } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ExternalReferenceInputProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  deleteReferenceData?: () => void;
}

const STORAGE_KEYS = {
  LINK: ['blog_ref_link_1', 'blog_ref_link_2', 'blog_ref_link_backup_1'],
  SENTENCE: ['blog_ref_sentence_1', 'blog_ref_sentence_2', 'blog_ref_sentence_backup_1'],
};

const secureStorage = {
  set: (value: string, type: 'LINK' | 'SENTENCE') => {
    STORAGE_KEYS[type].forEach(key => {
      localStorage.setItem(key, value);
      sessionStorage.setItem(key, value);
    });
  },
  get: (type: 'LINK' | 'SENTENCE') => {
    for (const key of STORAGE_KEYS[type]) {
      const value = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (value) return value;
    }
    return '';
  },
  clear: () => {
    [...STORAGE_KEYS.LINK, ...STORAGE_KEYS.SENTENCE].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  },
};

export const ExternalReferenceInput: React.FC<ExternalReferenceInputProps> = ({
  appState,
  saveAppState,
  deleteReferenceData,
}) => {
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      const link = secureStorage.get('LINK');
      const sentence = secureStorage.get('SENTENCE');

      if (link || sentence) {
        saveAppState({ referenceLink: link, referenceSentence: sentence });
        toast({ title: '복구됨', description: '참조 정보가 복구되었습니다.' });
      }
      setIsInitialized(true);
    }
  }, [isInitialized, saveAppState, toast]);

  const saveSecure = (link: string, sentence: string) => {
    secureStorage.set(link, 'LINK');
    secureStorage.set(sentence, 'SENTENCE');
  };

  const handleChange = (field: 'referenceLink' | 'referenceSentence', value: string) => {
    const newState = { ...appState, [field]: value };
    saveAppState(newState);
    saveSecure(newState.referenceLink || '', newState.referenceSentence || '');
  };

  const handleDelete = () => {
    secureStorage.clear();
    saveAppState({ referenceLink: '', referenceSentence: '' });
    deleteReferenceData?.();
    toast({ title: '삭제됨', description: '참조 정보가 삭제되었습니다.' });
  };

  const handleSave = () => {
    saveSecure(appState.referenceLink || '', appState.referenceSentence || '');
    toast({ title: '저장됨', description: '참조 정보가 저장되었습니다.' });
  };

  return (
    <Card className="shadow-md border-2 border-green-200">
      <CardHeader onDoubleClick={() => setIsCollapsed(!isCollapsed)} className="cursor-pointer bg-green-50">
        <CardTitle className="flex items-center justify-between text-purple-700">
          <span className="flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            외부링크 설정
            {isCollapsed ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronUp className="h-4 w-4 ml-2" />}
          </span>
          <div className="flex space-x-2">
            <Button onClick={handleSave} size="sm" className="bg-green-600 text-white">
              <Save className="h-4 w-4 mr-1" /> 저장 확인
            </Button>
            <Button onClick={handleDelete} size="sm" variant="destructive">
              <Trash2 className="h-4 w-4 mr-1" /> 삭제 확인
            </Button>
          </div>
        </CardTitle>
        <p className="text-xs text-gray-500 mt-1">헤더를 더블클릭하면 창을 접거나 펼칠 수 있습니다</p>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">참조 링크</label>
            <Input
              type="url"
              value={appState.referenceLink || ''}
              onChange={(e) => handleChange('referenceLink', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Quote className="h-4 w-4 mr-1" /> 참조 문장
            </label>
            <Textarea
              value={appState.referenceSentence || ''}
              onChange={(e) => handleChange('referenceSentence', e.target.value)}
              placeholder="참조 문장을 입력하세요..."
              rows={3}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};
