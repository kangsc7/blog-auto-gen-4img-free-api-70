
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RefactoredApiKeysSectionProps {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  isGeminiApiKeyValidated: boolean;
  setIsGeminiApiKeyValidated: (validated: boolean) => void;
  isGeminiValidating: boolean;
  validateGeminiApiKey: () => Promise<void>;
  deleteGeminiApiKeyFromStorage: () => void;
  
  pixabayApiKey: string;
  setPixabayApiKey: (key: string) => void;
  isPixabayApiKeyValidated: boolean;
  setIsPixabayApiKeyValidated: (validated: boolean) => void;
  isPixabayValidating: boolean;
  validatePixabayApiKey: () => Promise<void>;
  deletePixabayApiKeyFromStorage: () => void;
  
  huggingFaceApiKey: string;
  setHuggingFaceApiKey: (key: string) => void;
  isHuggingFaceApiKeyValidated: boolean;
  setIsHuggingFaceApiKeyValidated: (validated: boolean) => void;
  isHuggingFaceValidating: boolean;
  validateHuggingFaceApiKey: () => Promise<void>;
  deleteHuggingFaceApiKeyFromStorage: () => void;
}

export const RefactoredApiKeysSection: React.FC<RefactoredApiKeysSectionProps> = ({
  geminiApiKey,
  setGeminiApiKey,
  isGeminiApiKeyValidated,
  setIsGeminiApiKeyValidated,
  isGeminiValidating,
  validateGeminiApiKey,
  deleteGeminiApiKeyFromStorage,
  
  pixabayApiKey,
  setPixabayApiKey,
  isPixabayApiKeyValidated,
  setIsPixabayApiKeyValidated,
  isPixabayValidating,
  validatePixabayApiKey,
  deletePixabayApiKeyFromStorage,
  
  huggingFaceApiKey,
  setHuggingFaceApiKey,
  isHuggingFaceApiKeyValidated,
  setIsHuggingFaceApiKeyValidated,
  isHuggingFaceValidating,
  validateHuggingFaceApiKey,
  deleteHuggingFaceApiKeyFromStorage,
}) => {
  const { toast } = useToast();
  const [showGeminiKey, setShowGeminiKey] = React.useState(false);
  const [showPixabayKey, setShowPixabayKey] = React.useState(false);
  const [showHuggingFaceKey, setShowHuggingFaceKey] = React.useState(false);

  const handleGeminiDelete = () => {
    if (window.confirm('정말로 Gemini API 키를 삭제하시겠습니까?')) {
      deleteGeminiApiKeyFromStorage();
      setShowGeminiKey(false);
      toast({
        title: "API 키 삭제됨",
        description: "Gemini API 키가 성공적으로 삭제되었습니다.",
        variant: "default"
      });
    }
  };

  const handlePixabayDelete = () => {
    if (window.confirm('정말로 Pixabay API 키를 삭제하시겠습니까?')) {
      deletePixabayApiKeyFromStorage();
      setShowPixabayKey(false);
      toast({
        title: "API 키 삭제됨",
        description: "Pixabay API 키가 성공적으로 삭제되었습니다.",
        variant: "default"
      });
    }
  };

  const handleHuggingFaceDelete = () => {
    if (window.confirm('정말로 Hugging Face API 키를 삭제하시겠습니까?')) {
      deleteHuggingFaceApiKeyFromStorage();
      setShowHuggingFaceKey(false);
      toast({
        title: "API 키 삭제됨",
        description: "Hugging Face API 키가 성공적으로 삭제되었습니다.",
        variant: "default"
      });
    }
  };

  const handleGeminiValidate = async () => {
    if (!geminiApiKey.trim()) {
      toast({
        title: "API 키 입력 필요",
        description: "먼저 Gemini API 키를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    await validateGeminiApiKey();
  };

  const handlePixabayValidate = async () => {
    if (!pixabayApiKey.trim()) {
      toast({
        title: "API 키 입력 필요",
        description: "먼저 Pixabay API 키를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    await validatePixabayApiKey();
  };

  const handleHuggingFaceValidate = async () => {
    if (!huggingFaceApiKey.trim()) {
      toast({
        title: "API 키 입력 필요",
        description: "먼저 Hugging Face API 키를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    await validateHuggingFaceApiKey();
  };

  return (
    <div className="content-container mb-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-blue-700 text-xl font-bold">
            API 키 관리
          </CardTitle>
          <p className="text-gray-600 text-sm">
            각 서비스의 API 키를 입력하고 검증하세요. 키는 안전하게 브라우저에 저장됩니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gemini API Key */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">🤖 Gemini API</h3>
              {isGeminiApiKeyValidated && (
                <div className="flex items-center text-green-600 text-sm">
                  <Check className="h-4 w-4 mr-1" />
                  검증됨
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showGeminiKey ? "text" : "password"}
                  placeholder="Gemini API 키를 입력하세요"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className={`pr-20 ${
                    isGeminiApiKeyValidated 
                      ? 'border-green-500 bg-green-50' 
                      : geminiApiKey 
                        ? 'border-orange-400 bg-orange-50' 
                        : 'border-gray-300'
                  }`}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {showGeminiKey ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  {geminiApiKey && (
                    <button
                      type="button"
                      onClick={handleGeminiDelete}
                      className="p-1 hover:bg-red-200 rounded"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
              <Button
                onClick={handleGeminiValidate}
                disabled={isGeminiValidating || !geminiApiKey.trim()}
                className={`min-w-[80px] ${
                  isGeminiApiKeyValidated 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isGeminiValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isGeminiApiKeyValidated ? (
                  <Check className="h-4 w-4" />
                ) : (
                  '검증'
                )}
              </Button>
            </div>
            {!isGeminiApiKeyValidated && geminiApiKey && (
              <div className="flex items-center text-orange-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                검증이 필요합니다
              </div>
            )}
          </div>

          {/* Pixabay API Key */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">🖼️ Pixabay API</h3>
              {isPixabayApiKeyValidated && (
                <div className="flex items-center text-green-600 text-sm">
                  <Check className="h-4 w-4 mr-1" />
                  검증됨
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPixabayKey ? "text" : "password"}
                  placeholder="Pixabay API 키를 입력하세요"
                  value={pixabayApiKey}
                  onChange={(e) => setPixabayApiKey(e.target.value)}
                  className={`pr-20 ${
                    isPixabayApiKeyValidated 
                      ? 'border-green-500 bg-green-50' 
                      : pixabayApiKey 
                        ? 'border-orange-400 bg-orange-50' 
                        : 'border-gray-300'
                  }`}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPixabayKey(!showPixabayKey)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {showPixabayKey ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  {pixabayApiKey && (
                    <button
                      type="button"
                      onClick={handlePixabayDelete}
                      className="p-1 hover:bg-red-200 rounded"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
              <Button
                onClick={handlePixabayValidate}
                disabled={isPixabayValidating || !pixabayApiKey.trim()}
                className={`min-w-[80px] ${
                  isPixabayApiKeyValidated 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isPixabayValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPixabayApiKeyValidated ? (
                  <Check className="h-4 w-4" />
                ) : (
                  '검증'
                )}
              </Button>
            </div>
            {!isPixabayApiKeyValidated && pixabayApiKey && (
              <div className="flex items-center text-orange-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                검증이 필요합니다
              </div>
            )}
            <p className="text-xs text-gray-500">
              블로그 글에 이미지를 자동으로 추가하려면 Pixabay API 키가 필요합니다.
            </p>
          </div>

          {/* Hugging Face API Key */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">🤗 Hugging Face API</h3>
              {isHuggingFaceApiKeyValidated && (
                <div className="flex items-center text-green-600 text-sm">
                  <Check className="h-4 w-4 mr-1" />
                  검증됨
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showHuggingFaceKey ? "text" : "password"}
                  placeholder="Hugging Face API 키를 입력하세요"
                  value={huggingFaceApiKey}
                  onChange={(e) => setHuggingFaceApiKey(e.target.value)}
                  className={`pr-20 ${
                    isHuggingFaceApiKeyValidated 
                      ? 'border-green-500 bg-green-50' 
                      : huggingFaceApiKey 
                        ? 'border-orange-400 bg-orange-50' 
                        : 'border-gray-300'
                  }`}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowHuggingFaceKey(!showHuggingFaceKey)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {showHuggingFaceKey ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  {huggingFaceApiKey && (
                    <button
                      type="button"
                      onClick={handleHuggingFaceDelete}
                      className="p-1 hover:bg-red-200 rounded"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
              <Button
                onClick={handleHuggingFaceValidate}
                disabled={isHuggingFaceValidating || !huggingFaceApiKey.trim()}
                className={`min-w-[80px] ${
                  isHuggingFaceApiKeyValidated 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isHuggingFaceValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isHuggingFaceApiKeyValidated ? (
                  <Check className="h-4 w-4" />
                ) : (
                  '검증'
                )}
              </Button>
            </div>
            {!isHuggingFaceApiKeyValidated && huggingFaceApiKey && (
              <div className="flex items-center text-orange-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                검증이 필요합니다
              </div>
            )}
            <p className="text-xs text-gray-500">
              AI 이미지 생성 기능을 사용하려면 Hugging Face API 키가 필요합니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
