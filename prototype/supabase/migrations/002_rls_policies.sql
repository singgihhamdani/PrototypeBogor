-- =============================================================================
-- MIGRATION 002: Row Level Security (RLS) Policies SIJAKON Kabupaten Bogor
-- =============================================================================

-- =============================================================================
-- 1. AKTIFKAN RLS PADA SELURUH TABEL INTI
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opd ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 2. KEBIJAKAN KEAMANAN: TABEL PROFILES
-- =============================================================================

-- User dapat membaca profilnya sendiri
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Super Admin dapat melihat semua profil pengguna
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;
CREATE POLICY "Super admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- Admin Bidang dapat melihat profil pengguna dalam OPD yang sama
DROP POLICY IF EXISTS "Admin bidang can view profiles in same OPD" ON public.profiles;
CREATE POLICY "Admin bidang can view profiles in same OPD"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('SUPER_ADMIN', 'ADMIN_BIDANG')
        AND (p.opd_id = public.profiles.opd_id OR p.role = 'SUPER_ADMIN')
    )
  );

-- Super Admin dapat mengubah seluruh data profil pengguna
DROP POLICY IF EXISTS "Super admin can update all profiles" ON public.profiles;
CREATE POLICY "Super admin can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- Pengguna dapat memperbarui profilnya sendiri (tanpa dapat menaikkan hak akses sendiri)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- =============================================================================
-- 3. KEBIJAKAN KEAMANAN: TABEL OPD
-- =============================================================================

-- Seluruh pengguna terotentikasi dapat membaca data master OPD
DROP POLICY IF EXISTS "Authenticated users can view opd" ON public.opd;
CREATE POLICY "Authenticated users can view opd"
  ON public.opd FOR SELECT
  USING (auth.role() = 'authenticated');

-- Hanya Super Admin yang berhak melakukan INSERT, UPDATE, DELETE pada tabel OPD
DROP POLICY IF EXISTS "Super admin can manage opd" ON public.opd;
CREATE POLICY "Super admin can manage opd"
  ON public.opd FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- =============================================================================
-- 4. KEBIJAKAN KEAMANAN: TABEL USER_INVITATIONS
-- =============================================================================

-- Super Admin dan Admin Bidang dapat melihat dan membuat undangan pengguna baru
DROP POLICY IF EXISTS "Admins can manage user invitations" ON public.user_invitations;
CREATE POLICY "Admins can manage user invitations"
  ON public.user_invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN_BIDANG')
    )
  );
