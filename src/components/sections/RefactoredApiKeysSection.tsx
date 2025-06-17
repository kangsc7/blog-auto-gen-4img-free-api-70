
import React, { useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);

  console.log('RefactoredApiKeysSection 렌더링 - 매니저 상태:', {
    gemini: { key: geminiManager.geminiApiKey, validated: geminiManager.isGeminiApiKeyValidated },
    pixabay: { key: pixabayManager.pixabayApiKey, validated: pixabayManager.isPixabayApiKeyValidated },
    huggingface: { key: huggingFaceManager.huggingFaceApiKey, validated: huggingFaceManager.isHuggingFaceApiKeyValidated }
  });

  return (
    <div 
      className="container mx-auto mt-4 relative z-[200] transition-all duration-300 ease-in-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`transition-all duration-300 ease-in-out ${
        isHovered ? 'opacity-100 max-h-96' : 'opacity-60 max-h-16 overflow-hidden'
      }`}>
        <div className="flex flex-wrap gap-3 mb-4 justify-center">
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
        
        {!isHovered && (
          <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-2">
            마우스를 올려서 API 키 설정 보기
          </div>
        )}
      </div>
    </div>
  );
};
