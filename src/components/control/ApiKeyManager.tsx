
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { AppState } from '@/types';

interface ApiKeyManagerProps {
  appState: AppState;
  saveAppState: (newState: Partial<AppState>) => void;
  isValidatingApi: boolean;
  validateApiKey: () => void;
  saveApiKeyToStorage: () => void;
  deleteApiKeyFromStorage: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  appState,
  saveAppState,
  isValidatingApi,
  validateApiKey,
  saveApiKeyToStorage,
  deleteApiKeyFromStorage,
}) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          API 키 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API 키</label>
          <div className="flex space-x-2">
            <Input
              type="password"
              placeholder="API 키를 입력해주세요"
              value={appState.apiKey}
              onChange={(e) => saveAppState({ apiKey: e.target.value, isApiKeyValidated: false })}
              className="flex-1"
            />
            <Button 
              onClick={validateApiKey} 
              disabled={!appState.apiKey.trim() || isValidatingApi}
              variant="outline" 
              className={appState.isApiKeyValidated ? "text-green-600 border-green-600 hover:bg-green-50" : "text-blue-600 border-blue-600 hover:bg-blue-50"}
            >
              {isValidatingApi ? (
                <>검증 중...</>
              ) : appState.isApiKeyValidated ? (
                <><CheckCircle className="h-4 w-4 mr-1" />연결됨</>
              ) : (
                '검증'
              )}
            </Button>
          </div>
          <div className="flex space-x-2 mt-2">
            <Button onClick={saveApiKeyToStorage} size="sm" className="flex-1 bg-gray-600 hover:bg-gray-700">
              키 저장
            </Button>
            <Button onClick={deleteApiKeyFromStorage} size="sm" variant="destructive" className="flex-1">
              키 삭제
            </Button>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="hover:underline">Google AI Studio에서 발급</a>
          </p>
          {appState.isApiKeyValidated && (
            <p className="text-xs text-green-600 mt-1">✅ API 키가 검증되었습니다.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
