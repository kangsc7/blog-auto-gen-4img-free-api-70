
import React from 'react';
import { GeminiApiKeyManager } from '@/components/control/GeminiApiKeyManager';
import { PixabayApiKeyManager } from '@/components/control/PixabayApiKeyManager';
import { HuggingFaceApiKeyManager } from '@/components/control/HuggingFaceApiKeyManager';

interface RefactoredApiKeysSectionProps {
  geminiManager: any;
  pixabayManager: any;
  huggingFaceManager: any;
}

export const RefactoredApiKeysSection: React.FC<RefactoredApiKeysSectionProps> = ({
  geminiManager,
  pixabayManager,
  huggingFaceManager
}) => {
  console.log('RefactoredApiKeysSection 렌더링 - 매니저 상태:', {
    gemini: { key: geminiManager.geminiApiKey, validated: geminiManager.isGeminiApiKeyValidated },
    pixabay: { key: pixabayManager.pixabayApiKey, validated: pixabayManager.isPixabayApiKeyValidated },
    huggingface: { key: huggingFaceManager.huggingFaceApiKey, validated: huggingFaceManager.isHuggingFaceApiKeyValidated }
  });

  return (
    <div className="container mx-auto mt-20 relative z-[200]">
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <div className="relative z-[200]">
          <GeminiApiKeyManager
            geminiApiKey={geminiManager.geminiApiKey}
            setGeminiApiKey={geminiManager.setGeminiApiKey}
            isGeminiApiKeyValidated={geminiManager.isGeminiApiKeyValidated}
            setIsGeminiApiKeyValidated={geminiManager.setIsGeminiApiKeyValidated}
            isGeminiValidating={geminiManager.isGeminiValidating}
            validateGeminiApiKey={geminiManager.validateGeminiApiKey}
            deleteGeminiApiKeyFromStorage={geminiManager.deleteGeminiApiKeyFromStorage}
          />
        </div>
        
        <div className="relative z-[200]">
          <PixabayApiKeyManager
            pixabayApiKey={pixabayManager.pixabayApiKey}
            setPixabayApiKey={pixabayManager.setPixabayApiKey}
            isPixabayApiKeyValidated={pixabayManager.isPixabayApiKeyValidated}
            setIsPixabayApiKeyValidated={pixabayManager.setIsPixabayApiKeyValidated}
            isPixabayValidating={pixabayManager.isPixabayValidating}
            validatePixabayApiKey={pixabayManager.validatePixabayApiKey}
            deletePixabayApiKeyFromStorage={pixabayManager.deletePixabayApiKeyFromStorage}
          />
        </div>
        
        <div className="relative z-[200]">
          <HuggingFaceApiKeyManager
            huggingFaceApiKey={huggingFaceManager.huggingFaceApiKey}
            setHuggingFaceApiKey={huggingFaceManager.setHuggingFaceApiKey}
            isHuggingFaceApiKeyValidated={huggingFaceManager.isHuggingFaceApiKeyValidated}
            setIsHuggingFaceApiKeyValidated={huggingFaceManager.setIsHuggingFaceApiKeyValidated}
            isHuggingFaceValidating={huggingFaceManager.isHuggingFaceValidating}
            validateHuggingFaceApiKey={huggingFaceManager.validateHuggingFaceApiKey}
            deleteHuggingFaceApiKeyFromStorage={huggingFaceManager.deleteHuggingFaceApiKeyFromStorage}
          />
        </div>
      </div>
    </div>
  );
};
