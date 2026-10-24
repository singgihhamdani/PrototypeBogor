-- =============================================================================
-- MIGRATION 001: Skema Database Awal SIJAKON Kabupaten Bogor (Multi-User & OPD)
-- =============================================================================

-- Aktifkan ekstensi pgcrypto / uuid jika belum ada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. TABEL: opd (Organisasi Perangkat Daerah Kabupaten Bogor)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.opd (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode        VARCHAR(20) UNIQUE NOT NULL,        -- Contoh: "DPU", "BAPPEDA", "DISDIK"
  nama        VARCHAR(200) NOT NULL,               -- Contoh: "Dinas Pekerjaan Umum"
  nama_pendek VARCHAR(50),                         -- Contoh: "DPU"
  kepala_opd  VARCHAR(200),
  alamat      TEXT,
  telepon     VARCHAR(30),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data 5 OPD awal Kabupaten Bogor
INSERT INTO public.opd (kode, nama, nama_pendek) 
VALUES
  ('DPU',     'Dinas Pekerjaan Umum',                         'DPU'),
  ('BAPPEDA', 'Badan Perencanaan Pembangunan Daerah',         'Bappeda'),
  ('BPKAD',   'Badan Pengelolaan Keuangan dan Aset Daerah',  'BPKAD'),
  ('DISDIK',  'Dinas Pendidikan',                             'Disdik'),
  ('DINKES',  'Dinas Kesehatan',                              'Dinkes')
ON CONFLICT (kode) DO NOTHING;

-- =============================================================================
-- 2. TABEL: profiles (Profil Pengguna Terhubung ke Supabase Auth auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         VARCHAR(255) NOT NULL,
  nama_lengkap  VARCHAR(200) NOT NULL,
  nip           VARCHAR(30),
  jabatan       VARCHAR(200),
  role          VARCHAR(30) NOT NULL DEFAULT 'EKSEKUTIF'
                CHECK (role IN (
                  'SUPER_ADMIN', 'ADMIN_BIDANG', 'EKSEKUTIF',
                  'OPERATOR_BUJK', 'PESERTA_TKK'
                )),
  variant       VARCHAR(30)
                CHECK (variant IS NULL OR variant IN (
                  'BINA_KONSTRUKSI', 'PENGAWAS_ASESOR', 'PELATIHAN'
                )),
  opd_id        UUID REFERENCES public.opd(id) ON DELETE SET NULL,
  bujk_id       VARCHAR(50),               -- Khusus OPERATOR_BUJK (e.g. BUJK-001)
  bujk_name     VARCHAR(200),              -- Nama Perusahaan Jasa Konstruksi
  phone         VARCHAR(30),
  avatar_url    TEXT,
  status        VARCHAR(20) DEFAULT 'active'
                CHECK (status IN ('active', 'pending', 'suspended')),
  invited_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  permissions   JSONB DEFAULT '[]'::jsonb,  -- Hak akses tambahan/custom
  first_login   BOOLEAN DEFAULT TRUE,       -- Flag penggantian password pertama kali
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks pencarian cepat
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_opd ON public.profiles(opd_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- =============================================================================
-- 3. TABEL: user_invitations (Tracking Undangan Pengguna oleh Admin)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL,
  nama_lengkap  VARCHAR(200) NOT NULL,
  nip           VARCHAR(30),
  role          VARCHAR(30) NOT NULL,
  variant       VARCHAR(30),
  opd_id        UUID REFERENCES public.opd(id) ON DELETE SET NULL,
  invited_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status        VARCHAR(20) DEFAULT 'pending'
                CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  token         VARCHAR(100) UNIQUE,
  expires_at    TIMESTAMPTZ NOT NULL,
  accepted_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. FUNCTION & TRIGGER: Auto-create Profile saat User Baru Sign Up di Auth
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_opd_id UUID;
BEGIN
  -- Dapatkan opd_id dari metadata jika ada
  IF NEW.raw_user_meta_data->>'opd_id' IS NOT NULL THEN
    v_opd_id := (NEW.raw_user_meta_data->>'opd_id')::UUID;
  ELSE
    -- Default ke DPU untuk Super Admin/Admin Bidang
    SELECT id INTO v_opd_id FROM public.opd WHERE kode = 'DPU' LIMIT 1;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    nama_lengkap,
    nip,
    jabatan,
    role,
    variant,
    opd_id,
    bujk_id,
    bujk_name,
    phone,
    status,
    first_login
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'nip',
    NEW.raw_user_meta_data->>'jabatan',
    COALESCE(NEW.raw_user_meta_data->>'role', 'EKSEKUTIF'),
    NEW.raw_user_meta_data->>'variant',
    v_opd_id,
    NEW.raw_user_meta_data->>'bujk_id',
    NEW.raw_user_meta_data->>'bujk_name',
    NEW.raw_user_meta_data->>'phone',
    'active',
    COALESCE((NEW.raw_user_meta_data->>'first_login')::BOOLEAN, TRUE)
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    nama_lengkap = EXCLUDED.nama_lengkap,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger ke auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
