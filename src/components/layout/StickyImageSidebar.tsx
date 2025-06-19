
import React, { useState, useEffect } from 'react';
import { ImageCreation } from '@/components/control/ImageCreation';
import { HuggingFaceImageGenerator } from '@/components/display/HuggingFaceImageGenerator';
import { AppState } from '@/types';
import { ChevronUp, ChevronDown, Image } from 'lucide-react';

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
      const threshold = 400;
      setIsSticky(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // sticky 모드에서도 원래 크기 유지 - 더 넓은 너비 설정
  const stickyClasses = isSticky 
    ? 'fixed top-4 right-4 z-50 w-96 max-h-[calc(100vh-2rem)] overflow-y-auto shadow-2xl bg-white rounded-lg border' 
    : 'relative w-full';

  return (
    <div className={`transition-all duration-300 ${stickyClasses}`}>
      {isSticky && (
        <div className="mb-2 flex justify-between items-center p-3 bg-blue-50 rounded-t-lg border-b">
          <div className="flex items-center text-blue-700 font-semibold">
            <Image className="h-4 w-4 mr-2" />
            <span>이미지 도구</span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1 transition-colors"
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>펼치기</span>
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>접기</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {(!isSticky || !isCollapsed) && (
        <div className={`space-y-4 ${isSticky ? 'p-3' : ''}`}>
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
