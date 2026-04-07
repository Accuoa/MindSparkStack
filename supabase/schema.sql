-- MindSparkAI Course Platform Schema
-- Complete database schema with RLS, triggers, and constraints

-- ============================================================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  tier TEXT NOT NULL DEFAULT 'free'
    CHECK (tier IN ('free', 'masterclass', 'vip', 'core', 'hive', 'vanguard')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by email
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- ============================================================================
-- 2. PROGRESS TABLE (tracks lesson completion)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_slug TEXT NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_slug)
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS progress_user_id_idx ON public.progress(user_id);

-- ============================================================================
-- 3. SUBSCRIPTIONS TABLE (recurring billing status)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_end TIMESTAMPTZ
);

-- Index for faster lookups by stripe_subscription_id
CREATE INDEX IF NOT EXISTS subscriptions_stripe_id_idx ON public.subscriptions(stripe_subscription_id);

-- Index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);

-- ============================================================================
-- 4. CERTIFICATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  certificate_number TEXT UNIQUE NOT NULL,
  recipient_name TEXT NOT NULL DEFAULT '',
  recipient_email TEXT NOT NULL DEFAULT ''
);

-- Index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS certificates_user_id_idx ON public.certificates(user_id);

-- Index for faster lookups by certificate_number
CREATE INDEX IF NOT EXISTS certificates_number_idx ON public.certificates(certificate_number);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
CREATE POLICY "Service role can insert profiles" ON public.profiles
  FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update profiles" ON public.profiles;
CREATE POLICY "Service role can update profiles" ON public.profiles
  FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can read all profiles" ON public.profiles;
CREATE POLICY "Service role can read all profiles" ON public.profiles
  FOR SELECT TO service_role
  USING (true);

-- ============================================================================
-- PROGRESS RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own progress" ON public.progress;
CREATE POLICY "Users can read own progress" ON public.progress
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.progress;
CREATE POLICY "Users can insert own progress" ON public.progress
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.progress;
CREATE POLICY "Users can update own progress" ON public.progress
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage progress" ON public.progress;
CREATE POLICY "Service role can manage progress" ON public.progress
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================================
-- SUBSCRIPTIONS RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can insert subscriptions" ON public.subscriptions
  FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can update subscriptions" ON public.subscriptions
  FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can read all subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can read all subscriptions" ON public.subscriptions
  FOR SELECT TO service_role
  USING (true);

-- ============================================================================
-- CERTIFICATES RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own certificates" ON public.certificates;
CREATE POLICY "Users can read own certificates" ON public.certificates
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own certificates" ON public.certificates;
CREATE POLICY "Users can insert own certificates" ON public.certificates
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert certificates" ON public.certificates;
CREATE POLICY "Service role can insert certificates" ON public.certificates
  FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read certificates" ON public.certificates;
DROP POLICY IF EXISTS "Anyone can verify certificates" ON public.certificates;
CREATE POLICY "Anyone can verify certificates" ON public.certificates
  FOR SELECT TO anon, authenticated, service_role
  USING (true);

-- ============================================================================
-- 6. TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on auth.users INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
