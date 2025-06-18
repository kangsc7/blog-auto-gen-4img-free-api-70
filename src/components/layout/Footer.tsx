
import React from 'react';

interface FooterProps {
  isMobile: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isMobile }) => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-sm text-gray-300">
            © 2024 블로그 생성기. 모든 권리 보유.
          </p>
          {!isMobile && (
            <p className="text-xs text-gray-400 mt-2">
              AI 기반 블로그 콘텐츠 생성 도구
            </p>
          )}
        </div>
      </div>
    </footer>
  );
};
