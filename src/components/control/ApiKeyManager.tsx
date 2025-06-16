
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ApiKeyManagerProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  isApiKeyValidated: boolean;
  setIsApiKeyValidated: (validated: boolean) => void;
  isValidatingApi: boolean;
  validateApiKey: (key: string) => Promise<boolean>;
  deleteApiKeyFromStorage: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  apiKey,
  setApiKey,
  isApiKeyValidated,
  setIsApiKeyValidated,
  isValidatingApi,
  validateApiKey,
  deleteApiKeyFromStorage,
}) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300 relative z-[100]">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          Gemini API 키 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API 키</label>
          <div className="flex space-x-2">
            <Input
              type="password"
              placeholder="API 키를 입력해주세요"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsApiKeyValidated(false);
              }}
              className="flex-1"
            />
            <Button 
              onClick={() => validateApiKey(apiKey)} 
              disabled={!apiKey.trim() || isValidatingApi}
              variant="outline" 
              className={isApiKeyValidated ? "text-green-600 border-green-600 hover:bg-green-50" : "text-blue-600 border-blue-600 hover:bg-blue-50"}
            >
              {isValidatingApi ? (
                <>검증 중...</>
              ) : isApiKeyValidated ? (
                <><CheckCircle className="h-4 w-4 mr-1" />연결됨</>
              ) : (
                '검증 및 저장'
              )}
            </Button>
          </div>
          <div className="flex space-x-2 mt-2">
            <Button onClick={deleteApiKeyFromStorage} size="sm" variant="destructive" className="w-full">
              키 삭제
            </Button>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="hover:underline">Google AI Studio에서 발급</a>
          </p>
          {isApiKeyValidated && (
            <p className="text-xs text-green-600 mt-1">✅ API 키가 검증 및 저장되었습니다.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
