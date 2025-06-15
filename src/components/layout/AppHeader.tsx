
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, RefreshCw, LogOut } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface AppHeaderProps {
  user: User | null;
  resetApp: () => void;
  handleLogout: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ user, resetApp, handleLogout }) => {
  return (
    <div className="max-w-7xl mx-auto mb-6">
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Bot className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI 블로그 콘텐츠 생성기</h1>
            <p className="text-sm text-gray-600">GenSpark 기반 자동화 콘텐츠 시스템 도구</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {user && <span className="text-sm text-gray-600">사용자: {user.email}</span>}
          <span className="text-sm text-gray-500">로그인 시간: {new Date().toLocaleString('ko-KR')}</span>
          <Button onClick={resetApp} variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
            <RefreshCw className="h-4 w-4 mr-1" />
            초기화
          </Button>
          <Button onClick={handleLogout} variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-1" />
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
};
