import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const RESOURCES = [
  'DASHBOARD', 'BUJK', 'SBU', 'PROJECT', 'SUPERVISION', 
  'TRAINING', 'PARTICIPANT', 'CERTIFICATE', 'REGULATION', 
  'NEWS', 'USER', 'ROLE', 'AUDIT_LOG', 'GIS', 'REPORT'
] as const;

const ACTIONS = [
  'CREATE', 'READ', 'UPDATE', 'DELETE', 'VERIFY', 'EXPORT', 'AUDIT'
] as const;

async function main() {
  console.log('🌱 Starting database seeding for SIJAKON BOGOR (6-Tier RBAC)...');

  // 1. Seed District (Cibinong)
  const district = await prisma.district.upsert({
    where: { id: 3201010 },
    update: {},
    create: {
      id: 3201010,
      code: 'CBN',
      name: 'Kecamatan Cibinong',
    },
  });
  console.log(`✅ District verified: ${district.name}`);

  // 2. Seed BUJK Master Demo
  const bujk = await prisma.bujkMaster.upsert({
    where: { nib: '0220208192301' },
    update: {},
    create: {
      id: 'bujk_demo_001',
      name: 'PT Bangun Jaya Konstruksi',
      entityType: 'PT',
      nib: '0220208192301',
      npwp: '01.234.567.8-403.000',
      leaderName: 'H. Bambang Irawan, SE',
      pjtName: 'Budi Santoso, ST',
      pjskName: 'Hendra Gunawan, ST',
      districtId: district.id,
      address: 'Jl. Raya Tegar Beriman No. 45, Cibinong, Kab. Bogor',
      postalCode: '16914',
      phone: '021-87901234',
      email: 'admin@ptbangunjaya.co.id',
      website: 'https://ptbangunjaya.co.id',
      status: 'APPROVED',
    },
  });
  console.log(`✅ BUJK Master verified: ${bujk.name}`);

  // 3. Seed 5 System Roles
  const rolesData = [
    {
      code: 'SUPER_ADMIN',
      name: 'Super Admin',
      description: 'Akses penuh seluruh sistem. Kelola user, konfigurasi RBAC, sinkronisasi SIPJAKI.',
      isSystem: true,
    },
    {
      code: 'ADMIN_BIDANG',
      name: 'Admin Bidang',
      description: 'Operator teknis dinas — permission dikonfigurasi per bidang tugas via RBAC (Bina Konstruksi, Pelatihan, Pengawas).',
      isSystem: true,
    },
    {
      code: 'EKSEKUTIF',
      name: 'Eksekutif',
      description: 'Dashboard eksekutif dan laporan ringkasan untuk Kepala Dinas & Pimpinan Daerah (read-only).',
      isSystem: true,
    },
    {
      code: 'OPERATOR_BUJK',
      name: 'Operator BUJK',
      description: 'Portal mandiri rekanan penyedia jasa konstruksi. Tenant-isolated via bujk_id.',
      isSystem: true,
    },
    {
      code: 'PESERTA_TKK',
      name: 'Peserta TKK',
      description: 'Portal mandiri peserta pelatihan & sertifikasi tenaga kerja konstruksi.',
      isSystem: true,
    },
  ];

  const rolesMap = new Map<string, string>();

  for (const r of rolesData) {
    const roleRecord = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, description: r.description },
      create: r,
    });
    rolesMap.set(r.code, roleRecord.id);
  }
  console.log(`✅ 5 Roles verified (${Array.from(rolesMap.keys()).join(', ')})`);

  // 4. Seed Permissions Matrix (15 Resources × 7 Actions = 105 perms)
  console.log('🔐 Configuring permission matrix for all roles...');

  const superAdminId = rolesMap.get('SUPER_ADMIN')!;
  const adminBidangId = rolesMap.get('ADMIN_BIDANG')!;
  const eksekutifId = rolesMap.get('EKSEKUTIF')!;
  const operatorBujkId = rolesMap.get('OPERATOR_BUJK')!;
  const pesertaTkkId = rolesMap.get('PESERTA_TKK')!;

  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      // 4.1 SUPER_ADMIN: All 105 granted
      await prisma.rolePermission.upsert({
        where: {
          roleId_resource_action: {
            roleId: superAdminId,
            resource,
            action,
          },
        },
        update: { isGranted: true },
        create: {
          roleId: superAdminId,
          resource,
          action,
          isGranted: true,
        },
      });

      // 4.2 ADMIN_BIDANG: Operasional dinas
      const isAdminBidangGranted = 
        (resource === 'DASHBOARD' && action === 'READ') ||
        (resource === 'BUJK' && ['CREATE', 'READ', 'UPDATE', 'VERIFY', 'EXPORT'].includes(action)) ||
        (resource === 'SBU' && ['READ', 'VERIFY', 'EXPORT'].includes(action)) ||
        (resource === 'PROJECT' && ['CREATE', 'READ', 'UPDATE', 'EXPORT'].includes(action)) ||
        (resource === 'SUPERVISION' && ['CREATE', 'READ', 'UPDATE', 'VERIFY', 'EXPORT', 'AUDIT'].includes(action)) ||
        (resource === 'TRAINING' && ['CREATE', 'READ', 'UPDATE', 'VERIFY', 'EXPORT'].includes(action)) ||
        (resource === 'PARTICIPANT' && ['CREATE', 'READ', 'UPDATE', 'VERIFY', 'EXPORT'].includes(action)) ||
        (resource === 'CERTIFICATE' && ['CREATE', 'READ', 'UPDATE', 'EXPORT'].includes(action)) ||
        (resource === 'GIS' && ['READ', 'EXPORT'].includes(action)) ||
        (resource === 'REPORT' && ['READ', 'EXPORT'].includes(action)) ||
        (resource === 'REGULATION' && ['CREATE', 'READ', 'UPDATE'].includes(action)) ||
        (resource === 'NEWS' && ['CREATE', 'READ', 'UPDATE'].includes(action));

      await prisma.rolePermission.upsert({
        where: {
          roleId_resource_action: {
            roleId: adminBidangId,
            resource,
            action,
          },
        },
        update: { isGranted: isAdminBidangGranted },
        create: {
          roleId: adminBidangId,
          resource,
          action,
          isGranted: isAdminBidangGranted,
        },
      });

      // 4.3 EKSEKUTIF: Read & Export only
      const isEksekutifGranted = 
        ['READ', 'EXPORT'].includes(action) && 
        ['DASHBOARD', 'BUJK', 'SBU', 'PROJECT', 'SUPERVISION', 'TRAINING', 'GIS', 'REPORT', 'REGULATION', 'NEWS'].includes(resource);

      await prisma.rolePermission.upsert({
        where: {
          roleId_resource_action: {
            roleId: eksekutifId,
            resource,
            action,
          },
        },
        update: { isGranted: isEksekutifGranted },
        create: {
          roleId: eksekutifId,
          resource,
          action,
          isGranted: isEksekutifGranted,
        },
      });

      // 4.4 OPERATOR_BUJK: Tenant-scoped
      const isBujkGranted = 
        (resource === 'DASHBOARD' && action === 'READ') ||
        (['BUJK', 'SBU', 'PROJECT'].includes(resource) && ['READ', 'UPDATE'].includes(action)) ||
        (resource === 'SUPERVISION' && ['CREATE', 'READ', 'UPDATE'].includes(action)) || // Upload SIMAK
        (['REGULATION', 'NEWS'].includes(resource) && action === 'READ');

      await prisma.rolePermission.upsert({
        where: {
          roleId_resource_action: {
            roleId: operatorBujkId,
            resource,
            action,
          },
        },
        update: { isGranted: isBujkGranted },
        create: {
          roleId: operatorBujkId,
          resource,
          action,
          isGranted: isBujkGranted,
        },
      });

      // 4.5 PESERTA_TKK: Training & Certificate
      const isPesertaGranted = 
        (resource === 'DASHBOARD' && action === 'READ') ||
        (resource === 'TRAINING' && action === 'READ') ||
        (resource === 'PARTICIPANT' && ['READ', 'UPDATE'].includes(action)) ||
        (resource === 'CERTIFICATE' && ['READ', 'EXPORT'].includes(action)) ||
        (['REGULATION', 'NEWS'].includes(resource) && action === 'READ');

      await prisma.rolePermission.upsert({
        where: {
          roleId_resource_action: {
            roleId: pesertaTkkId,
            resource,
            action,
          },
        },
        update: { isGranted: isPesertaGranted },
        create: {
          roleId: pesertaTkkId,
          resource,
          action,
          isGranted: isPesertaGranted,
        },
      });
    }
  }
  console.log('✅ 105 Permissions matrix configured across all 5 roles.');

  // 5. Seed 6 Demo Users with Argon2id Password Hash
  console.log('👤 Seeding 6 Demo Users...');
  const defaultPassword = 'Demo2026!';
  const passwordHash = await argon2.hash(defaultPassword, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });

  const demoUsers = [
    {
      id: 'usr_superadmin',
      username: 'superadmin',
      email: 'admin@sijakon.bogor.go.id',
      fullName: 'Ir. H. Raden Ridwan, ST, M.Si',
      roleId: superAdminId,
      phoneNumber: '081298765430',
      bujkId: null,
    },
    {
      id: 'usr_op_binkon',
      username: 'op_binkon',
      email: 'binkon@sijakon.bogor.go.id',
      fullName: 'Bayu Pratama, S.Kom',
      roleId: adminBidangId,
      phoneNumber: '081298765431',
      bujkId: null,
    },
    {
      id: 'usr_op_pengawas',
      username: 'op_pengawas',
      email: 'pengawas@sijakon.bogor.go.id',
      fullName: 'Ir. Supriyatna, ST',
      roleId: adminBidangId,
      phoneNumber: '081298765432',
      bujkId: null,
    },
    {
      id: 'usr_eksekutif',
      username: 'eksekutif',
      email: 'kadis@sijakon.bogor.go.id',
      fullName: 'Drs. H. Suryanto Putra, M.Si',
      roleId: eksekutifId,
      phoneNumber: '081298765433',
      bujkId: null,
    },
    {
      id: 'usr_bujk_demo',
      username: 'bujk_demo',
      email: 'admin@ptbangunjaya.co.id',
      fullName: 'Budi Santoso, ST',
      roleId: operatorBujkId,
      phoneNumber: '081298765434',
      bujkId: bujk.id,
    },
    {
      id: 'usr_peserta_demo',
      username: 'peserta_demo',
      email: 'ahmad.fauzi@gmail.com',
      fullName: 'Ahmad Fauzi, A.Md',
      roleId: pesertaTkkId,
      phoneNumber: '081298765435',
      bujkId: null,
    },
  ];

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        email: user.email,
        fullName: user.fullName,
        roleId: user.roleId,
        bujkId: user.bujkId,
        passwordHash,
      },
      create: {
        ...user,
        passwordHash,
        isActive: true,
      },
    });
  }
  console.log('✅ 6 Demo Users seeded with Argon2id hash (Password: "Demo2026!").');
  console.log('🚀 Seeding complete! Database is ready for Phase 2 (Auth Module).');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
