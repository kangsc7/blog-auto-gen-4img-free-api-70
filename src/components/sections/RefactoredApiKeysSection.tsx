
import React, { useState, useEffect } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDoubleClick = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    setIsExpanded(false);
  }, []);

  console.log('RefactoredApiKeysSection 렌더링 - 매니저 상태:', {
    gemini: { key: geminiManager.geminiApiKey, validated: geminiManager.isGeminiApiKeyValidated },
    pixabay: { key: pixabayManager.pixabayApiKey, validated: pixabayManager.isPixabayApiKeyValidated },
    huggingface: { key: huggingFaceManager.huggingFaceApiKey, validated: huggingFaceManager.isHuggingFaceApiKeyValidated }
  });

  return (
    <div className={`container mx-auto mt-2 relative z-[200] transition-all duration-500 ease-in-out ${
      isExpanded ? 'mb-4' : 'mb-1'
    }`}>
      <div 
        onDoubleClick={handleDoubleClick}
        className={`cursor-pointer transition-all duration-500 ease-in-out transform ${
          isExpanded 
            ? 'opacity-100 max-h-[600px] scale-100' 
            : 'opacity-70 max-h-12 scale-95 overflow-hidden'
        }`}
      >
        {/* 통합된 API 키 설정 창 */}
        <div className={`bg-white rounded-lg shadow-lg border-2 border-gray-200 p-4 transition-all duration-300 ${
          isExpanded ? 'border-blue-300' : 'border-gray-200'
        }`}>
          {!isExpanded ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-1">🔑 API 키 설정</h3>
              <p className="text-sm text-gray-600">
                💡 더블클릭해서 API 키 설정 보기
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-center text-blue-700 mb-4">🔑 API 키 통합 설정</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
          )}
        </div>
      </div>
    </div>
  );
};
