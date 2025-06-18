
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut, LogIn, UserPlus } from 'lucide-react';

interface HeaderProps {
  session: any;
  loading: boolean;
  handleLogin: () => void;
  handleSignUp: () => void;
  handleLogout: () => void;
  profile: any;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  loading,
  handleLogin,
  handleSignUp,
  handleLogout,
  profile
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">블로그 생성기</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {loading ? (
              <div className="animate-pulse">로딩 중...</div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm text-gray-600">
                    {profile?.email || session.user?.email}
                  </span>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-1" />
                  로그아웃
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button onClick={handleLogin} variant="outline" size="sm">
                  <LogIn className="h-4 w-4 mr-1" />
                  로그인
                </Button>
                <Button onClick={handleSignUp} size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  회원가입
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
