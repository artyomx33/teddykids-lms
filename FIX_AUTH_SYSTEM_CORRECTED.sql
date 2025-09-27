-- ============================================
-- 🧸🔧 FIX AUTHENTICATION SYSTEM (CORRECTED)
-- ============================================
-- Fix login issues and bypass email confirmation
-- ============================================

-- 1. First, delete any existing user with this ID to avoid conflicts
DELETE FROM auth.identities WHERE user_id = 'ee6427c2-39eb-4129-a090-1a3cca81af4e'::UUID;
DELETE FROM auth.users WHERE id = 'ee6427c2-39eb-4129-a090-1a3cca81af4e'::UUID;

-- 2. Add your admin user directly to auth.users (bypass email confirmation)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'ee6427c2-39eb-4129-a090-1a3cca81af4e'::UUID,
  'authenticated',
  'authenticated',
  'artem@teddykids.nl',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  '',
  now(),
  '',
  null,
  '',
  '',
  null,
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  now(),
  now(),
  null,
  null,
  '',
  '',
  null,
  '',
  0,
  null,
  '',
  null,
  false,
  null
);

-- 3. Add identity record for email auth
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'ee6427c2-39eb-4129-a090-1a3cca81af4e'::UUID,
  'ee6427c2-39eb-4129-a090-1a3cca81af4e'::UUID,
  '{"sub": "ee6427c2-39eb-4129-a090-1a3cca81af4e", "email": "artem@teddykids.nl"}',
  'email',
  now(),
  now(),
  now()
);

-- 4. Ensure admin role exists (handle potential duplicate)
INSERT INTO public.user_roles (user_id, role, granted_by)
VALUES (
  'ee6427c2-39eb-4129-a090-1a3cca81af4e'::UUID,
  'admin',
  'ee6427c2-39eb-4129-a090-1a3cca81af4e'::UUID
)
ON CONFLICT (user_id, role) DO UPDATE SET
  granted_at = now();

-- 5. Verify setup
SELECT
  'AUTH USER VERIFICATION' as test_name,
  id,
  email,
  email_confirmed_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ EMAIL CONFIRMED'
    ELSE '❌ Email not confirmed'
  END as confirmation_status
FROM auth.users
WHERE id = 'ee6427c2-39eb-4129-a090-1a3cca81af4e'::UUID;

SELECT
  'ADMIN ROLE VERIFICATION' as test_name,
  user_id,
  role,
  granted_at,
  CASE
    WHEN role = 'admin' THEN '✅ ADMIN ROLE CONFIRMED!'
    ELSE '❌ Something went wrong'
  END as status
FROM public.user_roles
WHERE user_id = 'ee6427c2-39eb-4129-a090-1a3cca81af4e'::UUID;

-- Success message
DO $$ BEGIN
  RAISE NOTICE '🧸 AUTHENTICATION SYSTEM FIXED!';
  RAISE NOTICE '✅ Admin user: artem@teddykids.nl';
  RAISE NOTICE '✅ Password: password123';
  RAISE NOTICE '✅ Email confirmation bypassed';
  RAISE NOTICE '✅ Admin role assigned';
  RAISE NOTICE '🚀 Ready to login!';
END $$;