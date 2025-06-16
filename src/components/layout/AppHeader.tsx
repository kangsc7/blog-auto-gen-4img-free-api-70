
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, LogOut, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AppHeaderProps {
  currentUser: string;
  handleLogout: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ currentUser, handleLogout }) => {
  const scrollToPreview = () => {
    const previewElement = document.getElementById('article-preview');
    if (previewElement) {
      // 헤더 높이를 고려하여 더 정확한 위치로 스크롤
      const headerOffset = 100; // 헤더와 여백을 고려한 오프셋
      const elementPosition = previewElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto mb-6">
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Bot className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI 블로그 콘텐츠 생성기</h1>
            <p className="text-sm text-gray-600">GenSpark 기반 자동화 콘텐츠 시스템 도구</p>
          </div>
        </Link>
        
        <div className="flex-1 flex justify-center">
          <Button 
            onClick={scrollToPreview}
            variant="outline" 
            size="sm" 
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <ArrowDown className="h-4 w-4 mr-1" />
            블로그 글 미리보기로 이동
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">사용자: {currentUser}</span>
          <Button onClick={handleLogout} variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-1" />
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
};
