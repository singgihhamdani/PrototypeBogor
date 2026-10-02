export interface MasterOpdRecord {
  id: string;
  kodeOpd: string;
  namaOpd: string;
  tingkat: "Provinsi" | "Kabupaten/Kota";
  provinsi: string;
  kabupatenKota: string;
  alamat: string;
  telepon: string;
  email: string;
  kepalaDinas: string;
  jumlahTimPembina: number;
  statusSinkronisasi: "Terhubung" | "Menunggu Verifikasi" | "Belum Terhubung";
  tanggalRegistrasi: string;
}

export const mockMasterOpdList: MasterOpdRecord[] = [
  {
    id: "OPD-3201",
    kodeOpd: "1.03.01.01",
    namaOpd: "Dinas Pekerjaan Umum (DPU)",
    tingkat: "Kabupaten/Kota",
    provinsi: "Jawa Barat",
    kabupatenKota: "Kab. Bogor",
    alamat: "Jl. Bersih No. 1, Komplek Perkantoran Pemkab Bogor, Cibinong",
    telepon: "(021) 8753545",
    email: "dpu@bogorkab.go.id",
    kepalaDinas: "Iwan Setiawan, ST, MT",
    jumlahTimPembina: 18,
    statusSinkronisasi: "Terhubung",
    tanggalRegistrasi: "2024-01-15"
  },
  {
    id: "OPD-3202",
    kodeOpd: "1.03.01.02",
    namaOpd: "Dinas Perumahan, Kawasan Permukiman dan Pertanahan (DPKPP)",
    tingkat: "Kabupaten/Kota",
    provinsi: "Jawa Barat",
    kabupatenKota: "Kab. Bogor",
    alamat: "Jl. Tegar Beriman No. 12, Cibinong",
    telepon: "(021) 8754123",
    email: "dpkpp@bogorkab.go.id",
    kepalaDinas: "Ir. Hj. Suryati, M.Si",
    jumlahTimPembina: 10,
    statusSinkronisasi: "Terhubung",
    tanggalRegistrasi: "2024-03-20"
  },
  {
    id: "OPD-3271",
    kodeOpd: "1.03.02.01",
    namaOpd: "Dinas Pekerjaan Umum dan Penataan Ruang (DPUPR)",
    tingkat: "Kabupaten/Kota",
    provinsi: "Jawa Barat",
    kabupatenKota: "Kota Bogor",
    alamat: "Jl. Pemuda No. 25, Kota Bogor",
    telepon: "(0251) 8324567",
    email: "dpupr@kotabogor.go.id",
    kepalaDinas: "Rena Da Frina, SP, MM",
    jumlahTimPembina: 14,
    statusSinkronisasi: "Terhubung",
    tanggalRegistrasi: "2024-02-10"
  },
  {
    id: "OPD-3203",
    kodeOpd: "1.03.03.01",
    namaOpd: "Dinas PUPR Kabupaten Cianjur",
    tingkat: "Kabupaten/Kota",
    provinsi: "Jawa Barat",
    kabupatenKota: "Kab. Cianjur",
    alamat: "Jl. Raya Bandung No. 88, Cianjur",
    telepon: "(0263) 261456",
    email: "dpupr@cianjurkab.go.id",
    kepalaDinas: "Eri Rihandiar, ST, MT",
    jumlahTimPembina: 8,
    statusSinkronisasi: "Menunggu Verifikasi",
    tanggalRegistrasi: "2025-05-18"
  },
  {
    id: "OPD-3204",
    kodeOpd: "1.03.04.01",
    namaOpd: "Dinas Bina Marga dan Penataan Ruang (DBMPR) Provinsi Jawa Barat",
    tingkat: "Provinsi",
    provinsi: "Jawa Barat",
    kabupatenKota: "Provinsi Jawa Barat",
    alamat: "Jl. Asia Afrika No. 79, Bandung",
    telepon: "(022) 4230123",
    email: "dbmpr@jabarprov.go.id",
    kepalaDinas: "Ir. Bambang Tirtoyuliono, MM",
    jumlahTimPembina: 32,
    statusSinkronisasi: "Terhubung",
    tanggalRegistrasi: "2023-11-01"
  },
  {
    id: "OPD-3216",
    kodeOpd: "1.03.05.01",
    namaOpd: "Dinas Sumber Daya Air, Bina Marga dan Bina Konstruksi",
    tingkat: "Kabupaten/Kota",
    provinsi: "Jawa Barat",
    kabupatenKota: "Kab. Bekasi",
    alamat: "Komplek Perkantoran Pemkab Bekasi, Cikarang Pusat",
    telepon: "(021) 89970123",
    email: "dsdabmbk@bekasikab.go.id",
    kepalaDinas: "Henri Lincoln, ST, MM",
    jumlahTimPembina: 12,
    statusSinkronisasi: "Terhubung",
    tanggalRegistrasi: "2024-04-12"
  },
  {
    id: "OPD-3171",
    kodeOpd: "1.03.06.01",
    namaOpd: "Dinas Bina Marga Provinsi DKI Jakarta",
    tingkat: "Provinsi",
    provinsi: "DKI Jakarta",
    kabupatenKota: "Kota Jakarta Pusat",
    alamat: "Jl. Taman Jatibaru No. 1, Jakarta Pusat",
    telepon: "(021) 3848123",
    email: "binamarga@jakarta.go.id",
    kepalaDinas: "Dr. Heru Suwondo, MT",
    jumlahTimPembina: 28,
    statusSinkronisasi: "Terhubung",
    tanggalRegistrasi: "2023-08-15"
  },
  {
    id: "OPD-3603",
    kodeOpd: "1.03.07.01",
    namaOpd: "Dinas Bina Marga dan Sumber Daya Air",
    tingkat: "Kabupaten/Kota",
    provinsi: "Banten",
    kabupatenKota: "Kab. Tangerang",
    alamat: "Jl. Somawinata No. 1, Tigaraksa, Tangerang",
    telepon: "(021) 5990123",
    email: "dbmsda@tangerangkab.go.id",
    kepalaDinas: "Iwan Firmansyah, ST, M.Si",
    jumlahTimPembina: 11,
    statusSinkronisasi: "Menunggu Verifikasi",
    tanggalRegistrasi: "2025-01-20"
  }
];
