export type TertibType = 'tertib-usaha' | 'tertib-penyelenggaraan' | 'tertib-pemanfaatan';

export interface TertibConfig {
  slug: TertibType;
  title: string;
  shortTitle: string;
  pilar: string;
  badgeColor: string;
  badgeBg: string;
  accentColor: string;
  description: string;
  legalBasis: string;
  simakVariants: { code: string; label: string; desc: string }[];
  basePath: string;
}

export const TERTIB_CONFIGS: Record<TertibType, TertibConfig> = {
  'tertib-usaha': {
    slug: 'tertib-usaha',
    title: 'Tertib Usaha Jasa Konstruksi',
    shortTitle: 'Tertib Usaha',
    pilar: 'Pilar 1: Tertib Usaha',
    badgeColor: '#1E40AF',
    badgeBg: '#DBEAFE',
    accentColor: '#2563EB',
    description: 'Pengawasan kesesuaian legalitas, izin berusaha (NIB/OSS-RBA), SBU, SKK Tenaga Kerja, serta komitmen SMKK BUJK di Kabupaten Bogor.',
    legalBasis: 'Pasal 5-8 Permen PUPR No. 1/2023 jo. PP No. 14/2021',
    simakVariants: [
      { code: '1.a.1', label: 'Produsen Material', desc: 'Produsen Rantai Pasok Material Konstruksi' },
      { code: '1.a.2', label: 'Distributor Material', desc: 'Distributor Rantai Pasok Material Konstruksi' },
      { code: '1.a.3', label: 'Pemilik Peralatan BUJK', desc: 'Pemilik Rantai Pasok Peralatan Konstruksi - BUJK' },
      { code: '1.a.4', label: 'Penyewaan Peralatan', desc: 'Pemilik Usaha Penyewaan Peralatan Konstruksi' },
      { code: '1.a.5', label: 'Agen Tunggal Peralatan', desc: 'Distributor / Agen Tunggal Peralatan Konstruksi' },
      { code: '1.a.6', label: 'Rantai Pasok Teknologi', desc: 'Badan Usaha Rantai Pasok Teknologi' },
      { code: '1.b.1', label: 'Kesesuaian Usaha (Klasifikasi)', desc: 'Kesesuaian Jenis, Sifat, Klasifikasi, dan Layanan Usaha' },
      { code: '1.b.2', label: 'Kesesuaian Usaha (Bentuk)', desc: 'Kesesuaian Bentuk dan Kualifikasi Usaha' },
      { code: '1.c', label: 'Persyaratan Usaha Lapangan', desc: 'Pemenuhan Persyaratan Usaha (Kepatuhan Administratif & Lapangan)' },
      { code: '1.d', label: 'Penyediaan Tenaga Kerja', desc: 'Pemenuhan Persyaratan Usaha dalam Penyediaan Tenaga Kerja' },
      { code: '1.e', label: 'Sertifikat Standar & LSBU', desc: 'Pengawasan terhadap Sertifikat Standar & Kepemilikan Sertifikat' },
      { code: '1.f', label: 'Pengembangan Berkelanjutan', desc: 'Pengawasan Pengembangan Usaha Berkelanjutan' },
    ],
    basePath: '/pengawasan/tertib-usaha'
  },
  'tertib-penyelenggaraan': {
    slug: 'tertib-penyelenggaraan',
    title: 'Tertib Penyelenggaraan Jasa Konstruksi',
    shortTitle: 'Tertib Penyelenggaraan',
    pilar: 'Pilar 2: Tertib Penyelenggaraan',
    badgeColor: '#92400E',
    badgeBg: '#FEF3C7',
    accentColor: '#D97706',
    description: 'Pengawasan proses pemilihan penyedia, pelaksanaan kontrak kerja, manajemen mutu (RMPK/Kurva-S), dan keselamatan konstruksi proyek APBD/DAK.',
    legalBasis: 'Permen PUPR No. 10/2021 (SMKK) & Spesifikasi Teknis Umum Bina Marga/Cipta Karya',
    simakVariants: [
      { code: '2.a', label: 'Pemenuhan Standar K4', desc: 'Pengawasan Tertib Penyelenggaraan Konstruksi Terhadap Pemenuhan Standar K4' },
      { code: '2.b', label: 'Insidental Dana APBD', desc: 'Pengawasan Tertib Penyelenggaraan Konstruksi Secara Insidental dengan Sumber Dana dari APBD' },
      { code: '2.c', label: 'Insidental Selain APBD', desc: 'Pengawasan Tertib Penyelenggaraan Konstruksi Secara Insidental dengan Sumber Dana Selain APBD' },
      { code: '2.d', label: 'Insidental Non-APBD', desc: 'Pengawasan Tertib Penyelenggaraan Konstruksi Secara Insidental dengan Dana Selain dari APBD' },
    ],
    basePath: '/pengawasan/tertib-penyelenggaraan'
  },
  'tertib-pemanfaatan': {
    slug: 'tertib-pemanfaatan',
    title: 'Tertib Pemanfaatan Jasa Konstruksi',
    shortTitle: 'Tertib Pemanfaatan',
    pilar: 'Pilar 3: Tertib Pemanfaatan',
    badgeColor: '#065F46',
    badgeBg: '#D1FAE5',
    accentColor: '#059669',
    description: 'Pengawasan purna konstruksi, kesesuaian fungsi bangunan gedung/infrastruktur, operasional pemeliharaan (O&P), dan pemenuhan laik fungsi (SLF).',
    legalBasis: 'UU Bangunan Gedung, PP No. 16/2021 & Pasal 24 Permen PUPR No. 1/2023',
    simakVariants: [
      { code: 'Daftar Simak 3', label: 'Daftar Simak 3', desc: 'Pengawasan Tertib Pemanfaatan Produk Konstruksi Terhadap Bangunan Konstruksi' },
    ],
    basePath: '/pengawasan/tertib-pemanfaatan'
  }
};

export const PERENCANAAN_SUBTABS = [
  { slug: 'sdm', label: 'Sumber Daya Manusia', cat: 'Personalia', icon: 'Users', path: 'sdm' },
  { slug: 'timeline', label: 'Timeline Pelaksanaan', cat: 'Penjadwalan', icon: 'Calendar', path: 'timeline' },
  { slug: 'anggaran', label: 'Anggaran Pengawasan', cat: 'Finansial', icon: 'Wallet', path: 'anggaran' },
  { slug: 'pemetaan', label: 'Pemetaan Objek', cat: 'Objek Wilayah', icon: 'MapPin', path: 'pemetaan' },
  { slug: 'target', label: 'Target Pengawasan', cat: 'Sasaran Kinerja', icon: 'Target', path: 'target' },
];
