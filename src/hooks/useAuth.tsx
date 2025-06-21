
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { Profile } from '@/types';

export const useAuth = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthChange = async (currentSession: Session | null) => {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        setProfile(null);
        setIsAdmin(false);

        if (currentUser) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();
            
            if (error && error.code !== 'PGRST116') { // Ignore 'No rows found' error
                console.error("Error fetching profile:", error);
            } else if (data) {
                setProfile(data);
            }

            // Fetch user role and check if admin
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', currentUser.id)
              .eq('role', 'admin')
              .maybeSingle();

            if (roleError) {
              console.error("Error fetching user role:", roleError);
            } else if (roleData) {
              setIsAdmin(true);
            }
        }
        setLoading(false);
    };

    setLoading(true);
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        handleAuthChange(initialSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        handleAuthChange(session);
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
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        toast({ title: "회원가입 실패", description: error.message, variant: "destructive" });
        return false;
      }

      // 테스트 기간 중 자동 승인: 회원가입 성공 시 즉시 승인된 상태로 프로필 생성
      if (data.user) {
        const now = new Date();
        const accessExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30일 후 만료

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            status: 'approved', // 테스트 기간 중 자동 승인
            approved_at: now.toISOString(),
            access_expires_at: accessExpiresAt.toISOString(),
            remaining_access_days: 30,
          });

        if (profileError) {
          console.error('프로필 생성 오류:', profileError);
        }

        // 회원가입 성공 후 자동 로그인 시도
        const loginResult = await handleLogin({
          email: signUpData.email,
          password: signUpData.password
        });

        if (loginResult) {
          toast({ 
            title: "🎉 회원가입 및 자동 승인 완료!", 
            description: "테스트 기간 중 자동으로 승인되어 30일간 이용하실 수 있습니다.",
            duration: 5000
          });
          return true;
        }
      }

      toast({ title: "회원가입 성공", description: "이메일 인증을 완료하고 로그인해주세요." });
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

  return { session, user, profile, loading, isAdmin, handleLogin, handleSignUp, handleLogout };
};
