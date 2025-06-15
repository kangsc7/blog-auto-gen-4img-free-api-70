
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Lock, Bot } from 'lucide-react';

interface LoginFormProps {
  loginData: { id: string; password: string };
  setLoginData: React.Dispatch<React.SetStateAction<{ id: string; password: string }>>;
  handleLogin: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ loginData, setLoginData, handleLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Bot className="h-12 w-12 text-blue-600 mr-2" />
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">AI 블로그 콘텐츠 생성기</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">아이디</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="아이디를 입력하세요"
                value={loginData.id}
                onChange={(e) => setLoginData(prev => ({ ...prev, id: e.target.value }))}
                className="pl-10"
                style={{ color: '#000' }}
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
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                className="pl-10"
                style={{ color: '#000' }}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>
          <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700">
            로그인
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
