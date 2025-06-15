import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export const useAuth = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // 1. 인증 상태 변경 리스너를 먼저 설정합니다.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. 초기 세션 정보를 확인합니다.
    supabase.auth.getSession().then(({ data: { session } }) => {
      // 세션이 없으면 onAuthStateChange가 호출되지 않으므로 로딩 상태를 직접 변경합니다.
      if (!session) {
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogin = async (loginData: { email: string; password: string }) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        toast({ title: "로그인 실패", description: error.message, variant: "destructive" });
        return false;
      }
      toast({ title: "로그인 성공", description: "환영합니다!" });
      return true;
    } catch (error: any) {
      console.error('로그인 오류:', error);
      toast({ title: "로그인 오류", description: "로그인 처리 중 오류가 발생했습니다.", variant: "destructive" });
      return false;
    }
  };

  const handleSignUp = async (signUpData: { email: string; password: string }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({ title: "회원가입 실패", description: error.message, variant: "destructive" });
        return false;
      }
      toast({ title: "회원가입 성공", description: "인증 메일을 확인해주세요." });
      return true;
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      toast({ title: "회원가입 오류", description: "회원가입 처리 중 오류가 발생했습니다.", variant: "destructive" });
      return false;
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "로그아웃 실패", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "로그아웃", description: "성공적으로 로그아웃되었습니다." });
    }
  };

  return { session, user, loading, handleLogin, handleSignUp, handleLogout };
};
