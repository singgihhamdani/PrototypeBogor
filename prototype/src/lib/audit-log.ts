export interface DataActivityLog {
  id: string;
  timestamp: string;
  formattedDate: string;
  action: "export" | "import";
  module: string;
  format: "xlsx" | "csv";
  recordCount: number;
  user: string;
  status: "success" | "warning" | "failed";
  fileName: string;
  details?: string;
}

const STORAGE_KEY = "sijakon_data_activity_logs";

const SEED_LOGS: DataActivityLog[] = [
  {
    id: "LOG-2026-001",
    timestamp: "2026-10-02T08:30:00.000Z",
    formattedDate: "02 Okt 2026, 15:30 WIB",
    action: "export",
    module: "Paket Pekerjaan Konstruksi",
    format: "xlsx",
    recordCount: 8,
    user: "Admin Dinas PUPR (Ir. Hendra)",
    status: "success",
    fileName: "Data_Paket_Pekerjaan_SIPJAKI_Kab_Bogor.xlsx",
    details: "Ekspor seluruh portofolio paket proyek APBD/DAK dengan kamus data SIPJAKI"
  },
  {
    id: "LOG-2026-002",
    timestamp: "2026-10-01T04:15:00.000Z",
    formattedDate: "01 Okt 2026, 11:15 WIB",
    action: "import",
    module: "Badan Usaha Jasa Konstruksi (BUJK)",
    format: "xlsx",
    recordCount: 10,
    user: "Operator Jakon (Siti N)",
    status: "success",
    fileName: "Master_BUJK_Kab_Bogor_Update.xlsx",
    details: "Sinkronisasi 10 data BUJK baru dari OSS RBA"
  },
  {
    id: "LOG-2026-003",
    timestamp: "2026-09-28T09:45:00.000Z",
    formattedDate: "28 Sep 2026, 16:45 WIB",
    action: "export",
    module: "Pelaporan Kecelakaan K3",
    format: "xlsx",
    recordCount: 3,
    user: "Pengawas SMKK (Rahmat H)",
    status: "success",
    fileName: "Data_Kecelakaan_K3_SIPJAKI_Kab_Bogor.xlsx",
    details: "Pelaporan insiden K3 triwulan III ke SIPJAKI Kementerian PUPR"
  },
  {
    id: "LOG-2026-004",
    timestamp: "2026-09-25T07:20:00.000Z",
    formattedDate: "25 Sep 2026, 14:20 WIB",
    action: "import",
    module: "Paket Pekerjaan Konstruksi",
    format: "csv",
    recordCount: 6,
    user: "Admin Bidang Jakon",
    status: "warning",
    fileName: "paket_lelang_tahap2.csv",
    details: "Impor data parsial: 5 baris valid, 1 baris diabaikan karena format NIB tidak lengkap"
  }
];

export function getActivityLogs(): DataActivityLog[] {
  if (typeof window === "undefined") return SEED_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_LOGS));
      return SEED_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_LOGS;
  }
}

export function logDataActivity(
  entry: Omit<DataActivityLog, "id" | "timestamp" | "formattedDate">
): DataActivityLog {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  };
  const formattedDate = `${now.toLocaleDateString("id-ID", options)} WIB`;

  const newLog: DataActivityLog = {
    ...entry,
    id: `LOG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: now.toISOString(),
    formattedDate
  };

  if (typeof window !== "undefined") {
    try {
      const current = getActivityLogs();
      const updated = [newLog, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 100))); // Simpan max 100 log
    } catch {
      // Ignore storage errors
    }
  }

  return newLog;
}

export function clearActivityLogs(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}
