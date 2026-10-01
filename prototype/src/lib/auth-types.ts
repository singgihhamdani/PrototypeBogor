export type RoleCode = 
  | 'SUPER_ADMIN' 
  | 'ADMIN_BIDANG' 
  | 'EKSEKUTIF' 
  | 'OPERATOR_BUJK' 
  | 'PESERTA_TKK';

export type AdminBidangVariant = 
  | 'BINA_KONSTRUKSI' 
  | 'PENGAWAS_ASESOR' 
  | 'PELATIHAN';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: RoleCode;
  roleLabel: string;
  variant?: AdminBidangVariant;
  variantLabel?: string;
  bujkId?: string;
  bujkName?: string;
  permissions: string[];
  avatar?: string;
  phone?: string;
  instansi?: string;
  jabatan?: string;
}

export interface RoleMeta {
  code: RoleCode;
  label: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  portalType: 'internal' | 'bujk' | 'peserta';
  defaultRoute: string;
}

export const ROLE_CONFIGS: Record<RoleCode, RoleMeta> = {
  SUPER_ADMIN: {
    code: 'SUPER_ADMIN',
    label: 'Super Admin',
    description: 'Akses penuh ke seluruh modul, konfigurasi RBAC, manajemen pengguna, dan sinkronisasi SIPJAKI',
    badgeBg: '#0F2E5C',
    badgeText: '#FFC000',
    portalType: 'internal',
    defaultRoute: '/dashboard',
  },
  ADMIN_BIDANG: {
    code: 'ADMIN_BIDANG',
    label: 'Admin Bidang / Pengawas',
    description: 'Pengelolaan operasional teknis sesuai bidang tugas (Bina Konstruksi, Pelatihan, atau Tim Pengawas / Asesor)',
    badgeBg: '#1E40AF',
    badgeText: '#DBEAFE',
    portalType: 'internal',
    defaultRoute: '/dashboard',
  },
  EKSEKUTIF: {
    code: 'EKSEKUTIF',
    label: 'Eksekutif / Pimpinan',
    description: 'Dashboard eksekutif, ringkasan capaian makro jasa konstruksi daerah, dan unduhan laporan resmi',
    badgeBg: '#065F46',
    badgeText: '#A7F3D0',
    portalType: 'internal',
    defaultRoute: '/dashboard',
  },
  OPERATOR_BUJK: {
    code: 'OPERATOR_BUJK',
    label: 'Operator BUJK',
    description: 'Portal mandiri rekanan penyedia jasa konstruksi: update profil, kelola SBU, proyek, dan pelaporan SIMAK',
    badgeBg: '#9A3412',
    badgeText: '#FED7AA',
    portalType: 'bujk',
    defaultRoute: '/portal/bujk',
  },
  PESERTA_TKK: {
    code: 'PESERTA_TKK',
    label: 'Peserta TKK',
    description: 'Portal tenaga kerja konstruksi: pendaftaran pelatihan, modul kompetensi, jadwal uji asesor, dan e-sertifikat',
    badgeBg: '#1E293B',
    badgeText: '#E2E8F0',
    portalType: 'peserta',
    defaultRoute: '/portal/peserta',
  },
};

// 6 Akun Demo Lengkap
export const DEMO_USERS: Record<string, User> = {
  superadmin: {
    id: 'USR-01',
    username: 'superadmin',
    name: 'Ir. H. Raden Ridwan, ST, M.Si',
    email: 'admin@sijakon.bogor.go.id',
    role: 'SUPER_ADMIN',
    roleLabel: 'Super Admin DPU',
    instansi: 'Dinas PU Kabupaten Bogor',
    jabatan: 'Kepala Bidang Bina Konstruksi',
    permissions: [
      '*:*', // Full access
    ],
  },
  op_binkon: {
    id: 'USR-02',
    username: 'op_binkon',
    name: 'Bayu Pratama, S.Kom',
    email: 'binkon@sijakon.bogor.go.id',
    role: 'ADMIN_BIDANG',
    roleLabel: 'Admin Bidang (Bina Konstruksi)',
    variant: 'BINA_KONSTRUKSI',
    variantLabel: 'Seksi Bina Konstruksi',
    instansi: 'Dinas PU Kabupaten Bogor',
    jabatan: 'Staf Teknis Pembinaan Jakon',
    permissions: [
      'bujk:read', 'bujk:create', 'bujk:update', 'bujk:verify', 'bujk:export',
      'project:read', 'project:create', 'project:update', 'project:export',
      'webgis:read', 'webgis:export',
      'reporting:read', 'reporting:export',
      'cms:read', 'cms:create', 'cms:update',
    ],
  },
  op_pengawas: {
    id: 'USR-03',
    username: 'op_pengawas',
    name: 'Ir. Supriyatna, ST',
    email: 'pengawas@sijakon.bogor.go.id',
    role: 'ADMIN_BIDANG',
    roleLabel: 'Admin Bidang (Tim Pengawas / Asesor)',
    variant: 'PENGAWAS_ASESOR',
    variantLabel: 'Tim Pengawas & Asesor Lapangan',
    instansi: 'Dinas PU Kabupaten Bogor',
    jabatan: 'Pejabat Fungsional Pembina Jasa Konstruksi',
    permissions: [
      'bujk:read',
      'project:read',
      'supervision:read', 'supervision:create', 'supervision:update', 'supervision:audit', 'supervision:export',
      'k3:read', 'k3:create', 'k3:update',
      'webgis:read',
      'reporting:read', 'reporting:export',
    ],
  },
  eksekutif: {
    id: 'USR-04',
    username: 'eksekutif',
    name: 'Drs. H. Suryanto Putra, M.Si',
    email: 'kadis@sijakon.bogor.go.id',
    role: 'EKSEKUTIF',
    roleLabel: 'Pimpinan Eksekutif DPU',
    instansi: 'Dinas PU Kabupaten Bogor',
    jabatan: 'Kepala Dinas PU',
    permissions: [
      'dashboard:read',
      'bujk:read', 'bujk:export',
      'project:read', 'project:export',
      'supervision:read', 'supervision:export',
      'training:read', 'training:export',
      'reporting:read', 'reporting:export',
      'webgis:read',
    ],
  },
  bujk_demo: {
    id: 'USR-05',
    username: 'bujk_demo',
    name: 'Budi Santoso, ST',
    email: 'admin@ptbangunjaya.co.id',
    role: 'OPERATOR_BUJK',
    roleLabel: 'Operator BUJK Rekanan',
    bujkId: 'BUJK-001',
    bujkName: 'PT Bangun Jaya Konstruksi',
    instansi: 'PT Bangun Jaya Konstruksi',
    jabatan: 'Penanggung Jawab Teknis Badan Usaha (PJTBU)',
    permissions: [
      'tenant:bujk:read', 'tenant:bujk:update',
      'tenant:sbu:read', 'tenant:sbu:update',
      'tenant:project:read', 'tenant:project:update',
      'tenant:simak:upload', 'tenant:simak:read',
    ],
  },
  peserta_demo: {
    id: 'USR-06',
    username: 'peserta_demo',
    name: 'Ahmad Fauzi, A.Md',
    email: 'ahmad.fauzi@gmail.com',
    role: 'PESERTA_TKK',
    roleLabel: 'Peserta Pelatihan TKK',
    instansi: 'Mandiri / Asosiasi Tenaga Kerja',
    jabatan: 'Pelaksana Lapangan Pekerjaan Gedung',
    permissions: [
      'participant:profile:read', 'participant:profile:update',
      'participant:training:read', 'participant:training:enroll',
      'participant:certificate:read', 'participant:certificate:download',
    ],
  },
};

export function hasPermission(user: User | null, resource: string, action: string): boolean {
  if (!user) return false;
  if (user.permissions.includes('*:*')) return true;
  if (user.permissions.includes(`${resource}:*`)) return true;
  return user.permissions.includes(`${resource}:${action}`);
}

export function hasRole(user: User | null, allowedRoles: RoleCode[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
