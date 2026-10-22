-- RPC function to get user email (admin only)
CREATE OR REPLACE FUNCTION public.get_user_email(target_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_is_admin boolean;
  user_email text;
BEGIN
  SELECT is_admin INTO caller_is_admin FROM public.profiles WHERE id = auth.uid();
  IF NOT COALESCE(caller_is_admin, false) THEN
    RAISE EXCEPTION 'Yetkisiz erişim';
  END IF;

  SELECT email INTO user_email FROM auth.users WHERE id = target_user_id;
  RETURN user_email;
END;
$$;
