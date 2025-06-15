
-- 사용자 승인 상태를 나타내는 새로운 ENUM 타입을 생성합니다.
CREATE TYPE public.user_status AS ENUM ('pending', 'approved', 'rejected');

-- 사용자 역할을 'admin' 또는 'user'로 정의하는 새로운 ENUM 타입을 생성합니다.
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 공개 사용자 프로필 정보를 저장할 테이블을 생성합니다.
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  status user_status NOT NULL DEFAULT 'pending',
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 테이블과 컬럼에 대한 설명을 추가하여 이해를 돕습니다.
COMMENT ON TABLE public.profiles IS '사용자별 공개 프로필 정보, 승인 상태 및 역할을 저장합니다.';
COMMENT ON COLUMN public.profiles.id IS 'auth.users 테이블의 사용자를 참조합니다.';
COMMENT ON COLUMN public.profiles.email IS '사용자의 이메일 주소입니다.';
COMMENT ON COLUMN public.profiles.status IS '사용자의 승인 상태 (pending, approved, rejected)를 나타냅니다.';
COMMENT ON COLUMN public.profiles.role IS '사용자의 역할 (admin 또는 user)을 정의합니다.';

-- Row Level Security (RLS)를 활성화하여 데이터 접근을 제어합니다.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 프로필 정보만 조회할 수 있도록 정책을 생성합니다.
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 사용자가 자신의 프로필 정보를 수정할 수 있는 정책을 추가합니다.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 'admin' 역할을 가진 사용자가 모든 프로필을 보고 수정할 수 있도록 허용합니다.
CREATE POLICY "Admins can view and manage all profiles."
ON public.profiles FOR ALL
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 새 사용자가 가입할 때 자동으로 프로필을 생성하는 함수를 만듭니다.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- auth.users 테이블에 새 사용자가 추가될 때마다 위 함수를 실행하는 트리거를 생성합니다.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
