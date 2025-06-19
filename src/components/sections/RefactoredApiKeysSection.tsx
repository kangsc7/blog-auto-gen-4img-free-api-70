
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

  // 더블클릭으로 확장/축소 토글
  const handleDoubleClick = () => {
    setIsExpanded(!isExpanded);
  };

  // 컴포넌트 마운트 시 초기 상태 설정
  useEffect(() => {
    setIsExpanded(false);
  }, []);

  console.log('RefactoredApiKeysSection 렌더링 - 매니저 상태:', {
    gemini: { key: geminiManager?.geminiApiKey, validated: geminiManager?.isGeminiApiKeyValidated },
    pixabay: { key: pixabayManager?.pixabayApiKey, validated: pixabayManager?.isPixabayApiKeyValidated },
    huggingface: { key: huggingFaceManager?.huggingFaceApiKey, validated: huggingFaceManager?.isHuggingFaceApiKeyValidated }
  });

  return (
    <div className={`container mx-auto mt-2 relative z-[200] transition-all duration-500 ease-in-out ${
      isExpanded ? 'mb-4' : 'mb-1'
    }`}>
      <div 
        onDoubleClick={handleDoubleClick}
        className={`cursor-pointer transition-all duration-500 ease-in-out transform ${
          isExpanded 
            ? 'opacity-100 max-h-96 scale-100' 
            : 'opacity-70 max-h-12 scale-95 overflow-hidden'
        }`}
      >
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="relative z-[200]">
            <GeminiApiKeyManager
              geminiApiKey={geminiManager?.geminiApiKey || ''}
              setGeminiApiKey={geminiManager?.setGeminiApiKey}
              isGeminiApiKeyValidated={geminiManager?.isGeminiApiKeyValidated || false}
              setIsGeminiApiKeyValidated={geminiManager?.setIsGeminiApiKeyValidated}
              isGeminiValidating={geminiManager?.isGeminiValidating || false}
              validateGeminiApiKey={geminiManager?.validateGeminiApiKey}
              deleteGeminiApiKeyFromStorage={geminiManager?.deleteGeminiApiKeyFromStorage}
            />
          </div>
          
          <div className="relative z-[200]">
            <PixabayApiKeyManager
              pixabayApiKey={pixabayManager?.pixabayApiKey || ''}
              setPixabayApiKey={pixabayManager?.setPixabayApiKey}
              isPixabayApiKeyValidated={pixabayManager?.isPixabayApiKeyValidated || false}
              setIsPixabayApiKeyValidated={pixabayManager?.setIsPixabayApiKeyValidated}
              isPixabayValidating={pixabayManager?.isPixabayValidating || false}
              validatePixabayApiKey={pixabayManager?.validatePixabayApiKey}
              deletePixabayApiKeyFromStorage={pixabayManager?.deletePixabayApiKeyFromStorage}
            />
          </div>
          
          <div className="relative z-[200]">
            <HuggingFaceApiKeyManager
              huggingFaceApiKey={huggingFaceManager?.huggingFaceApiKey || ''}
              setHuggingFaceApiKey={huggingFaceManager?.setHuggingFaceApiKey}
              isHuggingFaceApiKeyValidated={huggingFaceManager?.isHuggingFaceApiKeyValidated || false}
              setIsHuggingFaceApiKeyValidated={huggingFaceManager?.setIsHuggingFaceApiKeyValidated}
              isHuggingFaceValidating={huggingFaceManager?.isHuggingFaceValidating || false}
              validateHuggingFaceApiKey={huggingFaceManager?.validateHuggingFaceApiKey}
              deleteHuggingFaceApiKeyFromStorage={huggingFaceManager?.deleteHuggingFaceApiKeyFromStorage}
            />
          </div>
        </div>
        
        {!isExpanded && (
          <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2 mt-2 border border-gray-200">
            💡 더블클릭해서 API 키 설정 보기
          </div>
        )}
      </div>
    </div>
  );
};
