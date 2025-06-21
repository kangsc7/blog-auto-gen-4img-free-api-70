
-- 사용자 역할을 정의하는 enum 타입을 생성합니다. (이미 존재하면 오류 없이 넘어갑니다)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'user');
    END IF;
END$$;

-- 사용자 역할을 관리하기 위한 'user_roles' 테이블을 생성합니다.
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 테이블에 대한 Row Level Security (RLS)를 활성화합니다.
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 자신의 역할을 볼 수 있도록 허용하는 정책입니다.
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- 관리자는 모든 역할을 보고 관리할 수 있습니다.
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (check_user_role('admin'))
WITH CHECK (check_user_role('admin'));

-- 'profiles' 테이블 대신 'user_roles' 테이블을 참조하도록 기존 함수를 업데이트합니다.
CREATE OR REPLACE FUNCTION public.check_user_role(_role app_role)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid() AND role = _role
    );
END;
$function$
