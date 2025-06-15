import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Lock, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type View = 'login' | 'signup' | 'reset_password' | 'update_password';

const LoginPage = () => {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !window.location.hash.includes('type=recovery')) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('update_password');
      } else if (event === 'SIGNED_IN' && session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuthAction = async () => {
    if (!email || !password) {
      toast({
        title: '입력 오류',
        description: '이메일과 비밀번호를 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    if (view === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        toast({
          title: '회원가입 오류',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '회원가입 성공',
          description: '계정 활성화를 위해 이메일을 확인해주세요.',
        });
        setView('login');
      }
    } else { // login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast({
          title: '로그인 오류',
          description: error.message,
          variant: 'destructive',
        });
      } else if (data.session) {
        toast({
          title: '로그인 성공',
          description: '환영합니다!',
        });
        navigate('/');
      }
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: '입력 오류',
        description: '이메일을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) {
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '성공',
        description: '비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.',
      });
      setView('login');
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: '오류', description: '비밀번호가 일치하지 않습니다.', variant: 'destructive' });
      return;
    }
    if (!newPassword) {
      toast({ title: '입력 오류', description: '새 비밀번호를 입력해주세요.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast({ title: '오류', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '성공', description: '비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.' });
      setView('login');
      setNewPassword('');
      setConfirmPassword('');
      setEmail('');
      setPassword('');
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const cardDescriptions: Record<View, string> = {
    login: '로그인하여 콘텐츠 생성을 시작하세요',
    signup: '회원가입하여 콘텐츠 생성을 시작하세요',
    reset_password: '비밀번호 재설정을 위해 이메일을 입력하세요.',
    update_password: '새로운 비밀번호를 설정하세요.',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Bot className="h-12 w-12 text-blue-600 mr-2" />
            <CardTitle className="text-2xl font-bold text-gray-800">AI 블로그 콘텐츠 생성기</CardTitle>
          </div>
          <CardDescription>
            {cardDescriptions[view]}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {view === 'update_password' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">새 비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="새 비밀번호를 입력하세요"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">새 비밀번호 확인</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="새 비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordUpdate()}
                  />
                </div>
              </div>
              <Button onClick={handlePasswordUpdate} className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? '처리 중...' : '비밀번호 변경'}
              </Button>
            </>
          ) : view === 'reset_password' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">이메일 (아이디)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordReset()}
                  />
                </div>
              </div>
              <Button onClick={handlePasswordReset} className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? '처리 중...' : '비밀번호 재설정 링크 보내기'}
              </Button>
              <div className="text-center mt-2">
                <Button variant="link" onClick={() => setView('login')} className="text-sm">
                  로그인으로 돌아가기
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">이메일 (아이디)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleAuthAction()}
                  />
                </div>
              </div>
              <Button onClick={handleAuthAction} className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? '처리 중...' : (view === 'signup' ? '회원가입' : '로그인')}
              </Button>
              <div className="text-center mt-2">
                <Button variant="link" onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-sm">
                  {view === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                </Button>
              </div>
              {view === 'login' && (
                <div className="text-center -mt-2">
                  <Button variant="link" onClick={() => setView('reset_password')} className="text-sm text-gray-600">
                    비밀번호를 잊으셨나요?
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
