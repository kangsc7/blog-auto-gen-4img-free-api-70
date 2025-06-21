
-- 'profiles' 테이블에 사용자가 승인된 시간을 기록할 'approved_at' 컬럼을 추가합니다.
ALTER TABLE public.profiles
ADD COLUMN approved_at TIMESTAMPTZ NULL;

-- 승인 후 30일이 지난 사용자의 상태를 'rejected'로 자동 변경하는 함수를 생성합니다.
CREATE OR REPLACE FUNCTION public.expire_approved_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET status = 'rejected', updated_at = now(), approved_at = NULL
  WHERE status = 'approved' AND approved_at IS NOT NULL AND (approved_at + interval '30 days') < now();
END;
$$;
