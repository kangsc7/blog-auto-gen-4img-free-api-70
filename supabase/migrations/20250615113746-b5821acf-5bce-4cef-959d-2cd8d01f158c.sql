
-- 'role' 컬럼을 사용하던 낡은 보안 규칙을 먼저 삭제합니다.
DROP POLICY IF EXISTS "Admins can view and manage all profiles." ON public.profiles;

-- 이제 안전하게 profiles 테이블에서 더 이상 사용되지 않는 role 컬럼을 삭제합니다.
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS role;
