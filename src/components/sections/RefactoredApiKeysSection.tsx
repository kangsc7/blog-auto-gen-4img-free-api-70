
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
  huggingFaceManager,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDoubleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="content-container mt-6 mb-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {!isExpanded ? (
          <div 
            className="p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onDoubleClick={handleDoubleClick}
          >
            <h2 className="text-2xl font-bold text-gray-800">
              🔑 API 키 통합 설정
            </h2>
            <p className="text-sm text-gray-500 mt-2">더블클릭하여 설정창 열기</p>
          </div>
        ) : (
          <div>
            <div 
              className="p-4 bg-gray-50 text-center cursor-pointer hover:bg-gray-100 transition-colors border-b"
              onDoubleClick={handleDoubleClick}
            >
              <h2 className="text-xl font-bold text-gray-800">
                🔑 API 키 통합 설정
              </h2>
              <p className="text-sm text-gray-500 mt-1">더블클릭하여 설정창 닫기</p>
            </div>
            
            <div className="p-6 space-y-6">
              <GeminiApiKeyManager 
                geminiApiKey={geminiManager.geminiApiKey}
                setGeminiApiKey={geminiManager.setGeminiApiKey}
                isGeminiApiKeyValidated={geminiManager.isApiKeyValidated}
                setIsGeminiApiKeyValidated={geminiManager.setIsApiKeyValidated}
                isGeminiValidating={geminiManager.isTesting}
                validateGeminiApiKey={geminiManager.testApiKey}
                deleteGeminiApiKeyFromStorage={geminiManager.deleteApiKey}
              />
              
              <PixabayApiKeyManager 
                pixabayApiKey={pixabayManager.pixabayApiKey}
                setPixabayApiKey={pixabayManager.setPixabayApiKey}
                isPixabayApiKeyValidated={pixabayManager.isPixabayValidated}
                setIsPixabayApiKeyValidated={pixabayManager.setIsPixabayValidated}
                isPixabayValidating={pixabayManager.isPixabayTesting}
                validatePixabayApiKey={pixabayManager.testPixabayKey}
                deletePixabayApiKeyFromStorage={pixabayManager.deletePixabayKey}
              />
              
              <HuggingFaceApiKeyManager 
                huggingFaceApiKey={huggingFaceManager.huggingFaceApiKey}
                setHuggingFaceApiKey={huggingFaceManager.setHuggingFaceApiKey}
                isHuggingFaceApiKeyValidated={huggingFaceManager.isHuggingFaceValidated}
                setIsHuggingFaceApiKeyValidated={huggingFaceManager.setIsHuggingFaceValidated}
                isHuggingFaceTesting={huggingFaceManager.isHuggingFaceTesting}
                validateHuggingFaceApiKey={huggingFaceManager.testHuggingFaceKey}
                deleteHuggingFaceApiKeyFromStorage={huggingFaceManager.deleteHuggingFaceKey}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
