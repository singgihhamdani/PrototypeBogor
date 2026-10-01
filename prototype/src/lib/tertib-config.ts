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
      { code: 'SIMAK 1a1', label: 'BUJK Nasional (Kecil)', desc: 'Pengawasan perizinan berusaha kualifikasi kecil' },
      { code: 'SIMAK 1a2', label: 'BUJK Nasional (Menengah)', desc: 'Pengawasan BUJK kualifikasi menengah' },
      { code: 'SIMAK 1a3', label: 'BUJK Nasional (Besar)', desc: 'Pengawasan BUJK kualifikasi besar & spesialis' },
      { code: 'SIMAK 1b1', label: 'BUJK PMA / Asing', desc: 'Pengawasan kantor perwakilan badan usaha asing' },
      { code: 'SIMAK 1c', label: 'Usaha Rantai Pasok', desc: 'Pengawasan produsen, distributor, & material konstruksi' },
      { code: 'SIMAK 1d', label: 'Pengawasan TKK Terampil', desc: 'Pemeriksaan kepemilikan sertifikat SKK/SKTK kerja' },
      { code: 'SIMAK 1e', label: 'Kesesuaian SBU vs Lapangan', desc: 'Audit lapangan kesesuaian subklasifikasi SBU' },
      { code: 'SIMAK 1f', label: 'Penyelenggaraan SMKK Usaha', desc: 'Audit dokumen RKK & personel K3 konstruksi' },
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
      { code: 'SIMAK 2a', label: 'Proses Pemilihan Penyedia', desc: 'Audit kepatuhan pengadaan barang/jasa konstruksi' },
      { code: 'SIMAK 2b', label: 'Kontrak Kerja Konstruksi', desc: 'Pemeriksaan standar kontrak, SSUK, & SSKK' },
      { code: 'SIMAK 2c', label: 'Penerapan SMKK & K3 Proyek', desc: 'Audit keselamatan kerja, APD, & rambu kerja proyek' },
      { code: 'SIMAK 2d', label: 'Pengendalian Mutu & Progres', desc: 'Audit pengujian mutu beton/aspal & Kurva-S deviasi' },
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
      { code: 'SIMAK 3', label: 'Pengawasan Pemanfaatan Produk', desc: 'Pemeriksaan status BAST/PHO, masa pemeliharaan, kesesuaian fungsi, SOP O&P, dan status SLF' },
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
