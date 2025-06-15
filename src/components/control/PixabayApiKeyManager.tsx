
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus, CheckCircle } from 'lucide-react';

interface PixabayApiKeyManagerProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  isValidated: boolean;
  isValidating: boolean;
  validateApiKey: () => void;
  deleteApiKey: () => void;
}

export const PixabayApiKeyManager: React.FC<PixabayApiKeyManagerProps> = ({
  apiKey,
  setApiKey,
  isValidated,
  isValidating,
  validateApiKey,
  deleteApiKey,
}) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-700">
          <ImagePlus className="h-5 w-5 mr-2" />
          Pixabay API 키 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pixabay API 키</label>
          <div className="flex space-x-2">
            <Input
              type="password"
              placeholder="Pixabay API 키를 입력해주세요"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={validateApiKey} 
              disabled={!apiKey.trim() || isValidating}
              variant="outline" 
              className={isValidated ? "text-green-600 border-green-600 hover:bg-green-50" : "text-orange-600 border-orange-600 hover:bg-orange-50"}
            >
              {isValidating ? (
                <>검증 중...</>
              ) : isValidated ? (
                <><CheckCircle className="h-4 w-4 mr-1" />연결됨</>
              ) : (
                '검증 및 저장'
              )}
            </Button>
          </div>
          <div className="flex space-x-2 mt-2">
            <Button onClick={deleteApiKey} size="sm" variant="destructive" className="w-full">
              키 삭제
            </Button>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            <a href="https://pixabay.com/api/docs/" target="_blank" rel="noopener noreferrer" className="hover:underline">Pixabay에서 API 키 발급</a>
          </p>
          {isValidated && (
            <p className="text-xs text-green-600 mt-1">✅ Pixabay API 키가 검증 및 저장되었습니다.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
