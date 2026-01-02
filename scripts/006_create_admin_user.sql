-- Create admin user account
-- Email: admin@circle.com
-- Password: Alliance01103

-- Insert admin user into auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@circle.com',
  crypt('Alliance01103', gen_salt('bf')), -- Hash the password
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Insert corresponding profile in public.users table
INSERT INTO public.users (
  id,
  email,
  full_name,
  headline,
  location,
  about,
  is_admin,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@circle.com'),
  'admin@circle.com',
  'Circle Administrator',
  'Platform Administrator',
  'Circle Network HQ',
  'Administrator account for Circle faith community network.',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  full_name = EXCLUDED.full_name,
  headline = EXCLUDED.headline,
  location = EXCLUDED.location,
  about = EXCLUDED.about;
