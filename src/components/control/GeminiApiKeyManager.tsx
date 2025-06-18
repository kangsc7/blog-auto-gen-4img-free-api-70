
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, TestTube } from 'lucide-react';

interface GeminiApiKeyManagerProps {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  isGeminiApiKeyValidated: boolean;
  setIsGeminiApiKeyValidated: (validated: boolean) => void;
  isGeminiValidating: boolean;
  validateGeminiApiKey: (key: string) => Promise<boolean>;
  testGeminiConnection?: (key: string) => Promise<boolean>;
  deleteGeminiApiKeyFromStorage: () => void;
}

export const GeminiApiKeyManager: React.FC<GeminiApiKeyManagerProps> = ({
  geminiApiKey,
  setGeminiApiKey,
  isGeminiApiKeyValidated,
  setIsGeminiApiKeyValidated,
  isGeminiValidating,
  validateGeminiApiKey,
  testGeminiConnection,
  deleteGeminiApiKeyFromStorage,
}) => {
  console.log('GeminiApiKeyManager 렌더링:', { geminiApiKey, isGeminiApiKeyValidated });

  // API 키를 마스킹하여 표시하는 함수 - 개선된 버전
  const getMaskedApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 6) + '*'.repeat(Math.max(key.length - 12, 8)) + key.substring(key.length - 6);
  };

  const handleConnectionTest = async () => {
    if (!testGeminiConnection || !geminiApiKey) return;
    
    try {
      await testGeminiConnection(geminiApiKey);
      // 성공 시 토스트는 testGeminiConnection 내부에서 처리
    } catch (error) {
      // 실패 시 토스트는 testGeminiConnection 내부에서 처리
    }
  };

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
              type={isGeminiApiKeyValidated ? "password" : "text"}
              inputMode="text"
              placeholder="AIza로 시작하는 39자리 API 키를 입력해주세요"
              value={isGeminiApiKeyValidated ? getMaskedApiKey(geminiApiKey) : geminiApiKey || ''}
              onChange={(e) => {
                setGeminiApiKey(e.target.value);
                setIsGeminiApiKeyValidated(false);
              }}
              className="flex-1"
              readOnly={isGeminiApiKeyValidated}
            />
            <Button 
              onClick={() => validateGeminiApiKey(geminiApiKey)} 
              disabled={!geminiApiKey?.trim() || isGeminiValidating}
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
            {isGeminiApiKeyValidated && testGeminiConnection && (
              <Button 
                onClick={handleConnectionTest} 
                size="sm" 
                variant="outline" 
                className="flex-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                disabled={isGeminiValidating}
              >
                <TestTube className="h-4 w-4 mr-1" />
                연결 테스트
              </Button>
            )}
            <Button onClick={deleteGeminiApiKeyFromStorage} size="sm" variant="destructive" className="flex-1">
              키 삭제
            </Button>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="hover:underline">Google AI Studio에서 발급</a>
          </p>
          {isGeminiApiKeyValidated && (
            <p className="text-xs text-green-600 mt-1">✅ API 키가 검증 및 저장되었습니다.</p>
          )}
          {!isGeminiApiKeyValidated && geminiApiKey && (
            <p className="text-xs text-orange-600 mt-1">⚠️ API 키를 검증해주세요.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
