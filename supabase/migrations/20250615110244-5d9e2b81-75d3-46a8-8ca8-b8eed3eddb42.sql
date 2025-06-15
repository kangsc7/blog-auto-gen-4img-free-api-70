
-- Helper function to check if the current user has a specific role
CREATE OR REPLACE FUNCTION public.check_user_role(_role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid() AND role = _role
    );
END;
$$;

-- 1. Enable Row Level Security on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Grant permissions to roles
-- Admins can see all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (check_user_role('admin'));

-- Users can only see their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can update any profile (e.g., change status)
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (check_user_role('admin'));

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. Enable Realtime on the profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
-- The `supabase_realtime` publication should already exist, so we just add the table to it.
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
