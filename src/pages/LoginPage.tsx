
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Bot } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="flex justify-center items-center mb-6">
          <Bot className="h-10 w-10 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">AI 블로그 콘텐츠 생성기</h1>
            <p className="text-sm text-gray-600">로그인하여 콘텐츠 생성을 시작하세요</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            localization={{
              variables: {
                sign_in: {
                  email_label: '이메일 주소',
                  password_label: '비밀번호',
                  email_input_placeholder: '이메일 주소를 입력하세요',
                  password_input_placeholder: '비밀번호를 입력하세요',
                  button_label: '로그인',
                  social_provider_text: '{{provider}}로 계속하기',
                  link_text: '이미 계정이 있으신가요? 로그인',
                },
                sign_up: {
                  email_label: '이메일 주소',
                  password_label: '비밀번호',
                  email_input_placeholder: '이메일 주소를 입력하세요',
                  password_input_placeholder: '비밀번호를 입력하세요',
                  button_label: '회원가입',
                  social_provider_text: '{{provider}}로 계속하기',
                  link_text: '계정이 없으신가요? 회원가입',
                },
                forgotten_password: {
                    email_label: "이메일 주소",
                    password_label: "비밀번호",
                    email_input_placeholder: "이메일 주소를 입력하세요",
                    button_label: "비밀번호 재설정 링크 보내기",
                    link_text: "비밀번호를 잊으셨나요?",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
