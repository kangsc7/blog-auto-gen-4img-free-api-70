
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, KeyRound } from 'lucide-react';
import { useHuggingFaceManager } from '@/hooks/useHuggingFaceManager';

interface HuggingFaceApiKeyManagerProps {
  manager: ReturnType<typeof useHuggingFaceManager>;
}

export const HuggingFaceApiKeyManager: React.FC<HuggingFaceApiKeyManagerProps> = ({
  manager
}) => {
  const { 
    huggingFaceApiKey, 
    setHuggingFaceApiKey,
    isHuggingFaceApiKeyValidated, 
    isHuggingFaceValidating, 
    validateHuggingFaceApiKey, 
    deleteHuggingFaceApiKeyFromStorage 
  } = manager;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-700">
          <KeyRound className="h-5 w-5 mr-2" />
          Hugging Face API 키 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hugging Face User Access Token</label>
          <div className="flex space-x-2">
            <Input
              type="password"
              placeholder="hf_... 형식의 API 키"
              value={huggingFaceApiKey}
              onChange={(e) => setHuggingFaceApiKey(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={validateHuggingFaceApiKey} 
              disabled={!huggingFaceApiKey.trim() || isHuggingFaceValidating}
              variant="outline" 
              className={isHuggingFaceApiKeyValidated ? "text-green-600 border-green-600 hover:bg-green-50" : "text-blue-600 border-blue-600 hover:bg-blue-50"}
            >
              {isHuggingFaceValidating ? (
                <>검증 중...</>
              ) : isHuggingFaceApiKeyValidated ? (
                <><CheckCircle className="h-4 w-4 mr-1" />연결됨</>
              ) : (
                '검증 및 저장'
              )}
            </Button>
          </div>
          <div className="flex space-x-2 mt-2">
            <Button onClick={deleteHuggingFaceApiKeyFromStorage} size="sm" variant="destructive" className="w-full">
              키 삭제
            </Button>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="hover:underline">Hugging Face에서 Access Token 발급</a>
          </p>
           {isHuggingFaceApiKeyValidated && (
            <p className="text-xs text-green-600 mt-1">✅ API 키가 검증 및 저장되었습니다.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
