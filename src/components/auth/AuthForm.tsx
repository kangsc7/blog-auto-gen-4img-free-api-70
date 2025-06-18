import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Lock, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthFormProps {
  handleLogin: (data: { email: string; password: string }) => Promise<boolean>;
  handleSignUp: (data: { email: string; password: string }) => Promise<boolean>;
}

export const AuthForm: React.FC<AuthFormProps> = ({ handleLogin, handleSignUp }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "입력 오류", description: "이메일과 비밀번호를 모두 입력해주세요.", variant: "destructive" });
      return;
    }

    setLoading(true);
    if (isSignUp) {
      const success = await handleSignUp({ email, password });
      if (success) {
        // 회원가입 성공 시 자동으로 로그인 창으로 전환
        setIsSignUp(false);
        setEmail('');
        setPassword('');
      }
    } else {
      await handleLogin({ email, password });
    }
    setLoading(false);
  };

  const backgroundClass = isSignUp
    ? "bg-gradient-to-br from-purple-50 to-pink-100"
    : "bg-gradient-to-br from-blue-50 to-indigo-100";
  
  const iconColorClass = isSignUp ? "text-purple-600" : "text-blue-600";
  const buttonClass = isSignUp 
    ? "bg-purple-600 hover:bg-purple-700" 
    : "bg-blue-600 hover:bg-blue-700";
  const linkButtonClass = isSignUp 
    ? "font-medium text-purple-600 hover:text-purple-700"
    : "font-medium text-blue-600 hover:text-blue-700";

  return (
    <div className={`min-h-screen ${backgroundClass} flex items-center justify-center p-4 transition-colors duration-500`}>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Bot className={`h-12 w-12 ${iconColorClass} mr-2 transition-colors duration-500`} />
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">AI 블로그 콘텐츠 생성기</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  style={{ color: '#000' }}
                  required
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
                  style={{ color: '#000' }}
                  required
                />
              </div>
            </div>
            <Button type="submit" className={`w-full ${buttonClass} transition-colors duration-500`} disabled={loading}>
              {loading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isSignUp ? '계정이 이미 있으신가요?' : '계정이 없으신가요?'}
            <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className={`${linkButtonClass} transition-colors duration-500`}>
              {isSignUp ? '로그인' : '회원가입'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
