
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface GeminiApiKeyManagerProps {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  isGeminiApiKeyValidated: boolean;
  setIsGeminiApiKeyValidated: (validated: boolean) => void;
  isGeminiValidating: boolean;
  validateGeminiApiKey: (key: string) => Promise<boolean>;
  deleteGeminiApiKeyFromStorage: () => void;
}

export const GeminiApiKeyManager: React.FC<GeminiApiKeyManagerProps> = ({
  geminiApiKey,
  setGeminiApiKey,
  isGeminiApiKeyValidated,
  setIsGeminiApiKeyValidated,
  isGeminiValidating,
  validateGeminiApiKey,
  deleteGeminiApiKeyFromStorage,
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
              value={geminiApiKey}
              onChange={(e) => {
                setGeminiApiKey(e.target.value);
                setIsGeminiApiKeyValidated(false);
              }}
              className="flex-1"
            />
            <Button 
              onClick={() => validateGeminiApiKey(geminiApiKey)} 
              disabled={!geminiApiKey.trim() || isGeminiValidating}
              variant="outline" 
              className={isGeminiApiKeyValidated ? "text-green-600 border-green-600 hover:bg-green-50" : "text-blue-600 border-blue-600 hover:bg-blue-50"}
            >
              {isGeminiValidating ? (
                <>검증 중...</>
              ) : isGeminiApiKeyValidated ? (
                <><CheckCircle className="h-4 w-4 mr-1" />연결됨</>
              ) : (
                '검증 및 저장'
              )}
            </Button>
          </div>
          <div className="flex space-x-2 mt-2">
            <Button onClick={deleteGeminiApiKeyFromStorage} size="sm" variant="destructive" className="w-full">
              기본값으로 복원
            </Button>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="hover:underline">Google AI Studio에서 발급</a>
          </p>
          {isGeminiApiKeyValidated && (
            <p className="text-xs text-green-600 mt-1">✅ API 키가 검증 및 저장되었습니다.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
