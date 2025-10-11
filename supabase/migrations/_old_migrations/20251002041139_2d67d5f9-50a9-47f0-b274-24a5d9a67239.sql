-- Make artem@teddykids.nl a super admin
-- This will bypass all RLS policies for testing

-- First, get the user_id for artem@teddykids.nl
-- Then insert admin role if not exists
INSERT INTO public.user_roles (user_id, role, granted_by)
SELECT 
  id as user_id,
  'admin'::text as role,
  id as granted_by
FROM auth.users
WHERE email = 'artem@teddykids.nl'
ON CONFLICT (user_id, role) DO NOTHING;

-- Log the action
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'artem@teddykids.nl';
  
  IF v_user_id IS NOT NULL THEN
    RAISE NOTICE 'Admin role granted to artem@teddykids.nl (user_id: %)', v_user_id;
  ELSE
    RAISE NOTICE 'User artem@teddykids.nl not found';
  END IF;
END $$;