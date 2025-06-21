
-- 로그인한 사용자가 keywords 테이블에 새로운 데이터를 추가할 수 있도록 INSERT 정책을 추가합니다.
CREATE POLICY "Authenticated users can insert new keywords"
ON public.keywords FOR INSERT
TO authenticated
WITH CHECK (true);
