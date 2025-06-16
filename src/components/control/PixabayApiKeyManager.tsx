
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus, CheckCircle } from 'lucide-react';

interface PixabayApiKeyManagerProps {
  pixabayApiKey: string;
  setPixabayApiKey: (key: string) => void;
  isPixabayApiKeyValidated: boolean;
  setIsPixabayApiKeyValidated: (validated: boolean) => void;
  isPixabayValidating: boolean;
  validatePixabayApiKey: (key: string) => Promise<boolean>;
  deletePixabayApiKeyFromStorage: () => void;
}

export const PixabayApiKeyManager: React.FC<PixabayApiKeyManagerProps> = ({
  pixabayApiKey,
  setPixabayApiKey,
  isPixabayApiKeyValidated,
  setIsPixabayApiKeyValidated,
  isPixabayValidating,
  validatePixabayApiKey,
  deletePixabayApiKeyFromStorage,
}) => {
  console.log('PixabayApiKeyManager 렌더링:', { pixabayApiKey, isPixabayApiKeyValidated });

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300 relative z-[100]">
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
              value={pixabayApiKey || ''}
              onChange={(e) => {
                setPixabayApiKey(e.target.value);
                setIsPixabayApiKeyValidated(false);
              }}
              className="flex-1"
            />
            <Button 
              onClick={() => validatePixabayApiKey(pixabayApiKey)} 
              disabled={!pixabayApiKey?.trim() || isPixabayValidating}
              variant="outline" 
              className={isPixabayApiKeyValidated ? "text-green-600 border-green-600 hover:bg-green-50" : "text-orange-600 border-orange-600 hover:bg-orange-50"}
            >
              {isPixabayValidating ? (
                <>검증 중...</>
              ) : isPixabayApiKeyValidated ? (
                <><CheckCircle className="h-4 w-4 mr-1" />연결됨</>
              ) : (
                '검증 및 저장'
              )}
            </Button>
          </div>
          <div className="flex space-x-2 mt-2">
            <Button onClick={deletePixabayApiKeyFromStorage} size="sm" variant="destructive" className="w-full">
              키 삭제
            </Button>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            <a href="https://pixabay.com/api/docs/" target="_blank" rel="noopener noreferrer" className="hover:underline">Pixabay에서 API 키 발급</a>
          </p>
          {isPixabayApiKeyValidated && (
            <p className="text-xs text-green-600 mt-1">✅ Pixabay API 키가 검증 및 저장되었습니다.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
