
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared-themes'
import { supabase } from '@/lib/supabaseClient'
import { Bot } from 'lucide-react'
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

const AuthPage = () => {
  const { session } = useAuthContext();

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Bot className="h-12 w-12 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">AI 블로그 콘텐츠 생성기</h1>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          localization={{
            variables: {
              sign_in: { email_label: '이메일 주소', password_label: '비밀번호', button_label: "로그인", link_text: "이미 계정이 있으신가요? 로그인"},
              sign_up: { email_label: '이메일 주소', password_label: '비밀번호', button_label: "회원가입", link_text: "계정이 없으신가요? 회원가입"},
              forgotten_password: { email_label: '이메일 주소', button_label: "비밀번호 재설정 링크 보내기", link_text: "비밀번호를 잊으셨나요?"},
              update_password: { password_label: "새 비밀번호", button_label: "비밀번호 업데이트"}
            }
          }}
        />
      </div>
    </div>
  )
}
export default AuthPage
