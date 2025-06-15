
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Lock, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
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
    if (isSignUp) {
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
        setIsSignUp(false);
      }
    } else {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Bot className="h-12 w-12 text-blue-600 mr-2" />
            <CardTitle className="text-2xl font-bold text-gray-800">AI 블로그 콘텐츠 생성기</CardTitle>
          </div>
          <CardDescription>
            {isSignUp ? '회원가입하여 콘텐츠 생성을 시작하세요' : '로그인하여 콘텐츠 생성을 시작하세요'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            {loading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
          </Button>
          <div className="text-center mt-2">
            <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="text-sm">
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
