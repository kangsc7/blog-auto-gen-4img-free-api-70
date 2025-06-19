
import React, { useState, useEffect } from 'react';
import { ImageCreation } from '@/components/control/ImageCreation';
import { HuggingFaceImageGenerator } from '@/components/display/HuggingFaceImageGenerator';
import { AppState } from '@/types';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface StickyImageSidebarProps {
  appState: AppState;
  isGeneratingImage: boolean;
  isDirectlyGenerating: boolean;
  createImagePrompt: (text: string) => Promise<boolean>;
  generateDirectImage: () => Promise<string | null>;
  copyToClipboard: (text: string, type: string) => void;
  openWhisk: () => void;
  huggingFaceApiKey: string;
  hasAccess: boolean;
}

export const StickyImageSidebar: React.FC<StickyImageSidebarProps> = ({
  appState,
  isGeneratingImage,
  isDirectlyGenerating,
  createImagePrompt,
  generateDirectImage,
  copyToClipboard,
  openWhisk,
  huggingFaceApiKey,
  hasAccess,
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 300; // 300px 스크롤 시 sticky 모드 활성화
      setIsSticky(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stickyClasses = isSticky 
    ? 'fixed top-4 right-4 z-50 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto shadow-2xl' 
    : 'relative w-full';

  return (
    <div className={`transition-all duration-300 ${stickyClasses}`}>
      {isSticky && (
        <div className="mb-2 flex justify-end">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1"
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>이미지 도구 열기</span>
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>이미지 도구 접기</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {(!isSticky || !isCollapsed) && (
        <div className="space-y-4">
          <ImageCreation
            appState={appState}
            isGeneratingImage={isGeneratingImage}
            isDirectlyGenerating={isDirectlyGenerating}
            createImagePrompt={createImagePrompt}
            generateDirectImage={generateDirectImage}
            copyToClipboard={copyToClipboard}
            openWhisk={openWhisk}
          />
          
          <HuggingFaceImageGenerator
            huggingFaceApiKey={huggingFaceApiKey}
            hasAccess={hasAccess}
            isApiKeyValidated={appState.isApiKeyValidated}
          />
        </div>
      )}
    </div>
  );
};
