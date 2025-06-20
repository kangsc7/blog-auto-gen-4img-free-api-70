import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Key, ChevronDown, ChevronUp } from 'lucide-react';
import { saveApiKeyToStorage, getApiKeyFromStorage, saveValidationStatusToStorage } from '@/lib/apiKeyStorage';

interface ApiKeyManagerProps {
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  isValidated: boolean;
  setIsValidated: (isValidated: boolean) => void;
  isValidating: boolean;
  validateApiKey: (apiKey: string) => Promise<void>;
  deleteApiKeyFromStorage: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  apiKey,
  setApiKey,
  isValidated,
  setIsValidated,
  isValidating,
  validateApiKey,
  deleteApiKeyFromStorage,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="api-key">API 키</Label>
        <Input
          id="api-key"
          placeholder="API 키를 입력하세요"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isValidating}
        />
      </div>
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => validateApiKey(apiKey)}
          disabled={isValidating || !apiKey}
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              검증 중...
            </>
          ) : (
            "API 키 검증"
          )}
        </Button>
        <Button
          variant="destructive"
          onClick={deleteApiKeyFromStorage}
          disabled={isValidating}
        >
          초기화
        </Button>
      </div>
      {isValidated && (
        <p className="text-sm text-green-500">API 키가 유효합니다.</p>
      )}
    </div>
  );
};

interface GeminiApiKeyManagerProps {
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  isValidated: boolean;
  setIsValidated: (isValidated: boolean) => void;
  isValidating: boolean;
  validateApiKey: (apiKey: string) => Promise<boolean>;
  deleteApiKeyFromStorage: () => void;
}

const GeminiApiKeyManager: React.FC<GeminiApiKeyManagerProps> = ({
  apiKey,
  setApiKey,
  isValidated,
  setIsValidated,
  isValidating,
  validateApiKey,
  deleteApiKeyFromStorage,
}) => {
  const { toast } = useToast();

  const handleValidateApiKey = async (apiKey: string) => {
    if (!apiKey.trim()) {
      toast({
        title: "API 키 오류",
        description: "Gemini API 키를 입력해주세요.",
        variant: "destructive",
      });
      return false;
    }

    setIsValidating(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Test" }] }],
          }),
        }
      );

      if (!response.ok) {
        setIsValidated(false);
        saveValidationStatusToStorage('GEMINI', false);
        toast({
          title: "API 키 검증 실패",
          description: "API 키가 유효하지 않습니다.",
          variant: "destructive",
        });
        return false;
      }

      setIsValidated(true);
      saveValidationStatusToStorage('GEMINI', true);
      toast({
        title: "API 키 검증 성공",
        description: "Gemini API 키가 성공적으로 검증되었습니다.",
      });
      return true;
    } catch (error) {
      setIsValidated(false);
      saveValidationStatusToStorage('GEMINI', false);
      toast({
        title: "API 키 검증 오류",
        description: "API 키 검증 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="gemini-api-key">Gemini API 키</Label>
        <Input
          id="gemini-api-key"
          placeholder="Gemini API 키를 입력하세요"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isValidating}
        />
      </div>
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => handleValidateApiKey(apiKey)}
          disabled={isValidating || !apiKey}
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              검증 중...
            </>
          ) : (
            "API 키 검증"
          )}
        </Button>
        <Button
          variant="destructive"
          onClick={deleteApiKeyFromStorage}
          disabled={isValidating}
        >
          초기화
        </Button>
      </div>
      {isValidated && (
        <p className="text-sm text-green-500">Gemini API 키가 유효합니다.</p>
      )}
    </div>
  );
};

interface PixabayApiKeyManagerProps {
    apiKey: string;
    setApiKey: (apiKey: string) => void;
    isValidated: boolean;
    setIsValidated: (isValidated: boolean) => void;
    isValidating: boolean;
    validateApiKey: (apiKey: string) => Promise<boolean>;
    deleteApiKeyFromStorage: () => void;
}

const PixabayApiKeyManager: React.FC<PixabayApiKeyManagerProps> = ({
    apiKey,
    setApiKey,
    isValidated,
    setIsValidated,
    isValidating,
    validateApiKey,
    deleteApiKeyFromStorage,
}) => {
    const { toast } = useToast();

    const handleValidateApiKey = async (apiKey: string) => {
        if (!apiKey.trim()) {
            toast({
                title: "API 키 오류",
                description: "Pixabay API 키를 입력해주세요.",
                variant: "destructive",
            });
            return false;
        }

        setIsValidating(true);
        try {
            const testUrl = `https://pixabay.com/api/?key=${apiKey}&q=test&image_type=photo&per_page=3`;
            const response = await fetch(testUrl);

            if (response.status === 400) {
                toast({
                    title: "API 키 검증 실패",
                    description: "Pixabay API 키가 유효하지 않습니다.",
                    variant: "destructive",
                });
                setIsValidated(false);
                saveValidationStatusToStorage('PIXABAY', false);
                return false;
            }

            if (!response.ok) {
                toast({
                    title: "API 키 검증 오류",
                    description: `Pixabay API 키 검증 중 오류가 발생했습니다. 상태 코드: ${response.status}`,
                    variant: "destructive",
                });
                setIsValidated(false);
                saveValidationStatusToStorage('PIXABAY', false);
                return false;
            }

            setIsValidated(true);
            saveValidationStatusToStorage('PIXABAY', true);
            toast({
                title: "API 키 검증 성공",
                description: "Pixabay API 키가 성공적으로 검증되었습니다.",
            });
            return true;

        } catch (error) {
            console.error("Pixabay API 키 검증 오류:", error);
            setIsValidated(false);
            saveValidationStatusToStorage('PIXABAY', false);
            toast({
                title: "API 키 검증 오류",
                description: "Pixabay API 키 검증 중 오류가 발생했습니다.",
                variant: "destructive",
            });
            return false;
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="pixabay-api-key">Pixabay API 키</Label>
                <Input
                    id="pixabay-api-key"
                    placeholder="Pixabay API 키를 입력하세요"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isValidating}
                />
            </div>
            <div className="flex justify-between">
                <Button
                    variant="secondary"
                    onClick={() => handleValidateApiKey(apiKey)}
                    disabled={isValidating || !apiKey}
                >
                    {isValidating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            검증 중...
                        </>
                    ) : (
                        "API 키 검증"
                    )}
                </Button>
                <Button
                    variant="destructive"
                    onClick={deleteApiKeyFromStorage}
                    disabled={isValidating}
                >
                    초기화
                </Button>
            </div>
            {isValidated && (
                <p className="text-sm text-green-500">Pixabay API 키가 유효합니다.</p>
            )}
        </div>
    );
};

interface HuggingFaceApiKeyManagerProps {
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  isValidated: boolean;
  setIsValidated: (isValidated: boolean) => void;
  isValidating: boolean;
  validateApiKey: (apiKey: string) => Promise<boolean>;
  deleteApiKeyFromStorage: () => void;
}

const HuggingFaceApiKeyManager: React.FC<HuggingFaceApiKeyManagerProps> = ({
  apiKey,
  setApiKey,
  isValidated,
  setIsValidated,
  isValidating,
  validateApiKey,
  deleteApiKeyFromStorage,
}) => {
  const { toast } = useToast();

  const handleValidateApiKey = async (apiKey: string) => {
    if (!apiKey.trim()) {
      toast({
        title: "API 키 오류",
        description: "Hugging Face API 키를 입력해주세요.",
        variant: "destructive",
      });
      return false;
    }

    setIsValidating(true);
    try {
      // Hugging Face API 키 유효성 검사 로직 (예: 간단한 GET 요청)
      const response = await fetch(
        `https://api-inference.huggingface.co/status`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );

      if (response.status === 401) {
        setIsValidated(false);
        saveValidationStatusToStorage('HUGGING_FACE', false);
        toast({
          title: "API 키 검증 실패",
          description: "Hugging Face API 키가 유효하지 않습니다.",
          variant: "destructive",
        });
        return false;
      }

      if (!response.ok) {
        setIsValidated(false);
        saveValidationStatusToStorage('HUGGING_FACE', false);
        toast({
          title: "API 키 검증 오류",
          description: `Hugging Face API 키 검증 중 오류가 발생했습니다. 상태 코드: ${response.status}`,
          variant: "destructive",
        });
        return false;
      }

      setIsValidated(true);
      saveValidationStatusToStorage('HUGGING_FACE', true);
      toast({
        title: "API 키 검증 성공",
        description: "Hugging Face API 키가 성공적으로 검증되었습니다.",
      });
      return true;

    } catch (error) {
      console.error("Hugging Face API 키 검증 오류:", error);
      setIsValidated(false);
      saveValidationStatusToStorage('HUGGING_FACE', false);
      toast({
        title: "API 키 검증 오류",
        description: "Hugging Face API 키 검증 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="huggingface-api-key">Hugging Face API 키</Label>
        <Input
          id="huggingface-api-key"
          placeholder="Hugging Face API 키를 입력하세요"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isValidating}
        />
      </div>
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => handleValidateApiKey(apiKey)}
          disabled={isValidating || !apiKey}
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              검증 중...
            </>
          ) : (
            "API 키 검증"
          )}
        </Button>
        <Button
          variant="destructive"
          onClick={deleteApiKeyFromStorage}
          disabled={isValidating}
        >
          초기화
        </Button>
      </div>
      {isValidated && (
        <p className="text-sm text-green-500">Hugging Face API 키가 유효합니다.</p>
      )}
    </div>
  );
};

interface RefactoredApiKeysSectionProps {
  geminiApiKey: string;
  setGeminiApiKey: (apiKey: string) => void;
  isGeminiApiKeyValidated: boolean;
  setIsGeminiApiKeyValidated: (isValidated: boolean) => void;
  isGeminiValidating: boolean;
  validateGeminiApiKey: (apiKey: string) => Promise<boolean>;
  deleteGeminiApiKeyFromStorage: () => void;
  
  pixabayApiKey: string;
  setPixabayApiKey: (apiKey: string) => void;
  isPixabayApiKeyValidated: boolean;
  setIsPixabayApiKeyValidated: (isValidated: boolean) => void;
  isPixabayValidating: boolean;
  validatePixabayApiKey: (apiKey: string) => Promise<boolean>;
  deletePixabayApiKeyFromStorage: () => void;
  
  huggingFaceApiKey: string;
  setHuggingFaceApiKey: (apiKey: string) => void;
  isHuggingFaceApiKeyValidated: boolean;
  setIsHuggingFaceApiKeyValidated: (isValidated: boolean) => void;
  isHuggingFaceValidating: boolean;
  validateHuggingFaceApiKey: (apiKey: string) => Promise<boolean>;
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
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="content-container mb-6">
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
        <CardHeader 
          className="cursor-pointer select-none" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title="클릭하여 접기/펼치기"
        >
          <CardTitle className="flex items-center justify-between text-purple-700">
            <div className="flex items-center">
              <Key className="h-6 w-6 mr-2" />
              API 키 관리
            </div>
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
          </CardTitle>
          {!isCollapsed && (
            <p className="text-sm text-gray-600">
              Gemini, Pixabay, Hugging Face API 키를 설정하고 관리합니다.
            </p>
          )}
        </CardHeader>
        {!isCollapsed && (
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gemini API 키 관리 */}
            <GeminiApiKeyManager
              apiKey={geminiApiKey}
              setApiKey={setGeminiApiKey}
              isValidated={isGeminiApiKeyValidated}
              setIsValidated={setIsGeminiApiKeyValidated}
              isValidating={isGeminiValidating}
              validateApiKey={validateGeminiApiKey}
              deleteApiKeyFromStorage={deleteGeminiApiKeyFromStorage}
            />

            {/* Pixabay API 키 관리 */}
            <PixabayApiKeyManager
              apiKey={pixabayApiKey}
              setApiKey={setPixabayApiKey}
              isValidated={isPixabayApiKeyValidated}
              setIsValidated={setIsPixabayApiKeyValidated}
              isValidating={isPixabayValidating}
              validateApiKey={validatePixabayApiKey}
              deleteApiKeyFromStorage={deletePixabayApiKeyFromStorage}
            />

            {/* Hugging Face API 키 관리 */}
            <HuggingFaceApiKeyManager
              apiKey={huggingFaceApiKey}
              setApiKey={setHuggingFaceApiKey}
              isValidated={isHuggingFaceApiKeyValidated}
              setIsValidated={setIsHuggingFaceApiKeyValidated}
              isValidating={isHuggingFaceValidating}
              validateApiKey={validateHuggingFaceApiKey}
              deleteApiKeyFromStorage={deleteHuggingFaceApiKeyFromStorage}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
};
