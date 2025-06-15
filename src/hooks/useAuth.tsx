
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, AppState } from '@/types';

interface LoginData {
  id: string;
  password: string;
}

const initializeUsers = () => {
  try {
    const defaultUsers: User[] = [{ id: '1234', password: '1234' }];
    localStorage.setItem('blog_users', JSON.stringify(defaultUsers));
  } catch (error) {
    console.error('사용자 초기화 오류:', error);
  }
};

export const useAuth = (saveAppState: (newState: Partial<AppState>) => void) => {
  const { toast } = useToast();
  const [loginData, setLoginData] = useState<LoginData>({ id: '', password: '' });

  useEffect(() => {
    initializeUsers();
  }, []);

  const handleLogin = () => {
    try {
      const users = JSON.parse(localStorage.getItem('blog_users') || '[]');
      
      if (!loginData.id || !loginData.password) {
        toast({ title: "로그인 실패", description: "아이디와 비밀번호를 모두 입력해주세요.", variant: "destructive" });
        return;
      }
      
      const user = users.find((u: User) => u.id === loginData.id && u.password === loginData.password);
      
      if (user) {
        saveAppState({ isLoggedIn: true, currentUser: user.id });
        toast({ title: "로그인 성공", description: "환영합니다!" });
      } else {
        toast({ title: "로그인 실패", description: "아이디 또는 비밀번호가 올바르지 않습니다.", variant: "destructive" });
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      toast({ title: "로그인 오류", description: "로그인 처리 중 오류가 발생했습니다.", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    saveAppState({ isLoggedIn: false, currentUser: '', apiKey: '', isApiKeyValidated: false });
    setLoginData({ id: '', password: '' });
    toast({ title: "로그아웃", description: "성공적으로 로그아웃되었습니다." });
  };

  return { loginData, setLoginData, handleLogin, handleLogout };
};
