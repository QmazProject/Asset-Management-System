-- ============================================================================
-- COMPLETE DATABASE SETUP - RUN THIS ONCE IN SUPABASE SQL EDITOR
-- ============================================================================
--
-- INSTRUCTIONS:
-- 1. Go to: https://tpvidhjwzheswatnxwxi.supabase.co
-- 2. Click "SQL Editor" → "New Query"
-- 3. Copy and paste this ENTIRE file
-- 4. Click "Run" (or Ctrl+Enter)
-- 5. Done! ✅
--
-- This will:
-- ✓ Delete old user_profiles table (if exists)
-- ✓ Create new user_profiles table
-- ✓ Set up all security policies
-- ✓ Create indexes for fast lookups
-- ✓ Add auto-update trigger
-- ✓ Grant all necessary permissions
--
-- ============================================================================

-- STEP 1: Clean up (delete old table if it exists)
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- STEP 2: Create the table
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  branch TEXT NOT NULL CHECK (branch IN ('QM Builders', 'Adamant Dev Corp.', 'QG Dev Corp.')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Create indexes (makes searching fast)
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);

-- STEP 4: Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create security policies

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Allow profile creation during registration
-- This is permissive to handle the signup flow
CREATE POLICY "Allow profile creation"
  ON public.user_profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- STEP 6: Create auto-update function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 7: Attach the trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- STEP 8: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated, service_role;

-- ============================================================================
-- SETUP COMPLETE! ✅
-- ============================================================================
--
-- NEXT STEPS:
-- 1. Go to Authentication → Providers → Email
-- 2. DISABLE "Confirm email" (for now, to make testing easier)
-- 3. Test registration at: http://localhost:5173/register
--
-- After testing works, you can re-enable email confirmation and
-- we'll add a database trigger to auto-create profiles.
--
-- ============================================================================

-- Verify the table was created
SELECT 
  'Setup successful! Table created with ' || count(*) || ' columns' as result
FROM information_schema.columns 
WHERE table_name = 'user_profiles';
