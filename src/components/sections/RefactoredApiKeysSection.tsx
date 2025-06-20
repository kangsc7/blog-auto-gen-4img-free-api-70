
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key } from 'lucide-react';
import { GeminiApiKeyManager } from '@/components/control/GeminiApiKeyManager';
import { PixabayApiKeyManager } from '@/components/control/PixabayApiKeyManager';
import { HuggingFaceApiKeyManager } from '@/components/control/HuggingFaceApiKeyManager';

interface RefactoredApiKeysSectionProps {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  isGeminiApiKeyValidated: boolean;
  setIsGeminiApiKeyValidated: (validated: boolean) => void;
  isGeminiTesting: boolean;
  validateGeminiApiKey: (key: string) => Promise<boolean>;
  deleteGeminiApiKeyFromStorage: () => void;
  
  pixabayApiKey: string;
  setPixabayApiKey: (key: string) => void;
  isPixabayApiKeyValidated: boolean;
  setIsPixabayApiKeyValidated: (validated: boolean) => void;
  pixabayTesting: boolean;
  validatePixabayApiKey: (key: string) => Promise<boolean>;
  deletePixabayApiKeyFromStorage: () => void;
  
  huggingFaceApiKey: any;
  setHuggingFaceApiKey: any;
  isHuggingFaceApiKeyValidated: any;
  setIsHuggingFaceApiKeyValidated: any;
  validateHuggingFaceApiKey: any;
  deleteHuggingFaceApiKeyFromStorage: any;
}

export const RefactoredApiKeysSection: React.FC<RefactoredApiKeysSectionProps> = ({
  geminiApiKey,
  setGeminiApiKey,
  isGeminiApiKeyValidated,
  setIsGeminiApiKeyValidated,
  isGeminiTesting,
  validateGeminiApiKey,
  deleteGeminiApiKeyFromStorage,
  
  pixabayApiKey,
  setPixabayApiKey,
  isPixabayApiKeyValidated,
  setIsPixabayApiKeyValidated,
  pixabayTesting,
  validatePixabayApiKey,
  deletePixabayApiKeyFromStorage,
  
  huggingFaceApiKey,
  setHuggingFaceApiKey,
  isHuggingFaceApiKeyValidated,
  setIsHuggingFaceApiKeyValidated,
  validateHuggingFaceApiKey,
  deleteHuggingFaceApiKeyFromStorage,
}) => {
  return (
    <Card className="shadow-md border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center text-blue-700">
          <Key className="h-5 w-5 mr-2" />
          🔑 API 키 관리 (영구 보존)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <GeminiApiKeyManager
          geminiApiKey={geminiApiKey}
          setGeminiApiKey={setGeminiApiKey}
          isGeminiApiKeyValidated={isGeminiApiKeyValidated}
          setIsGeminiApiKeyValidated={setIsGeminiApiKeyValidated}
          isGeminiTesting={isGeminiTesting}
          validateGeminiApiKey={validateGeminiApiKey}
          deleteGeminiApiKeyFromStorage={deleteGeminiApiKeyFromStorage}
        />
        
        <PixabayApiKeyManager
          pixabayApiKey={pixabayApiKey}
          setPixabayApiKey={setPixabayApiKey}
          isPixabayApiKeyValidated={isPixabayApiKeyValidated}
          setIsPixabayApiKeyValidated={setIsPixabayApiKeyValidated}
          pixabayTesting={pixabayTesting}
          validatePixabayApiKey={validatePixabayApiKey}
          deletePixabayApiKeyFromStorage={deletePixabayApiKeyFromStorage}
        />
        
        <HuggingFaceApiKeyManager
          huggingFaceApiKey={huggingFaceApiKey}
          setHuggingFaceApiKey={setHuggingFaceApiKey}
          isHuggingFaceApiKeyValidated={isHuggingFaceApiKeyValidated}
          setIsHuggingFaceApiKeyValidated={setIsHuggingFaceApiKeyValidated}
          validateHuggingFaceApiKey={validateHuggingFaceApiKey}
          deleteHuggingFaceApiKeyFromStorage={deleteHuggingFaceApiKeyFromStorage}
        />
      </CardContent>
    </Card>
  );
};
