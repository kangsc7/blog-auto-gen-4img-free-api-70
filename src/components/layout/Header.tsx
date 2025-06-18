
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  session: any;
  loading: boolean;
  handleLogin: (credentials: { email: string; password: string }) => void;
  handleSignUp: (credentials: { email: string; password: string }) => void;
  handleLogout: () => void;
  profile: any;
  onResetApp?: () => void;
  preventDuplicates?: boolean;
  onPreventDuplicatesToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  loading,
  handleLogout,
  profile,
  onResetApp,
  preventDuplicates,
  onPreventDuplicatesToggle,
}) => {
  const isAdmin = profile?.email === '5321497@naver.com';

  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="animate-pulse">로딩 중...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">
              블로그 글 생성기
            </h1>
            {session && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {profile?.email || '사용자'}
                </span>
                {isAdmin && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    관리자
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {session && (
              <>
                {/* 중복 방지/허용 토글 버튼 */}
                {onPreventDuplicatesToggle && (
                  <Button
                    onClick={onPreventDuplicatesToggle}
                    variant={preventDuplicates ? "default" : "outline"}
                    size="sm"
                    className={preventDuplicates ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {preventDuplicates ? "중복금지" : "중복허용"}
                  </Button>
                )}

                {/* 초기화 버튼 */}
                {onResetApp && (
                  <Button
                    onClick={onResetApp}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>초기화</span>
                  </Button>
                )}

                {/* 사용자 관리 버튼 */}
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/users" className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>사용자 관리</span>
                  </Link>
                </Button>

                {/* 로그아웃 버튼 */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
