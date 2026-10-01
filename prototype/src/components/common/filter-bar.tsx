"use client";
import React from "react";
import { Search, Filter, RotateCcw, X } from "lucide-react";

export interface ProvinceCityData {
  province: string;
  cities: string[];
}

export const INDONESIA_PROVINCES: ProvinceCityData[] = [
  {
    province: "Jawa Barat",
    cities: [
      "Kabupaten Bogor",
      "Kota Bogor",
      "Kota Depok",
      "Kabupaten Bekasi",
      "Kota Bekasi",
      "Kabupaten Sukabumi",
      "Kota Sukabumi",
      "Kabupaten Cianjur",
      "Kabupaten Karawang",
      "Kota Bandung",
      "Kabupaten Bandung"
    ]
  },
  {
    province: "DKI Jakarta",
    cities: [
      "Kota Jakarta Selatan",
      "Kota Jakarta Timur",
      "Kota Jakarta Pusat",
      "Kota Jakarta Barat",
      "Kota Jakarta Utara",
      "Kabupaten Kepulauan Seribu"
    ]
  },
  {
    province: "Banten",
    cities: [
      "Kota Tangerang Selatan",
      "Kota Tangerang",
      "Kabupaten Tangerang",
      "Kota Serang",
      "Kabupaten Serang",
      "Kota Cilegon",
      "Kabupaten Lebak",
      "Kabupaten Pandeglang"
    ]
  },
  {
    province: "Jawa Tengah",
    cities: [
      "Kota Semarang",
      "Kota Surakarta",
      "Kabupaten Banyumas",
      "Kabupaten Cilacap",
      "Kota Magelang"
    ]
  },
  {
    province: "Jawa Timur",
    cities: [
      "Kota Surabaya",
      "Kota Malang",
      "Kabupaten Sidoarjo",
      "Kabupaten Gresik",
      "Kabupaten Banyuwangi"
    ]
  }
];

export interface FilterBarValues {
  search: string;
  province: string;
  city: string;
  year: string;
  status: string;
}

export interface FilterBarProps {
  values: FilterBarValues;
  onChange: (values: FilterBarValues) => void;
  onReset?: () => void;
  showLocationFilter?: boolean;
  showYearFilter?: boolean;
  showStatusFilter?: boolean;
  searchPlaceholder?: string;
  years?: string[];
  statuses?: string[];
}

export default function FilterBar({
  values,
  onChange,
  onReset,
  showLocationFilter = true,
  showYearFilter = true,
  showStatusFilter = true,
  searchPlaceholder = "Cari data...",
  years = ["2026", "2025", "2024", "2023"],
  statuses = ["Semua", "Terverifikasi", "Menunggu Verifikasi", "Ditolak"]
}: FilterBarProps) {
  // Cascading cities based on current selected province
  const currentProvinceData = INDONESIA_PROVINCES.find((p) => p.province === values.province);
  const availableCities = currentProvinceData ? currentProvinceData.cities : [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...values, search: e.target.value });
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProv = e.target.value;
    onChange({
      ...values,
      province: newProv,
      city: "" // Reset city when province changes
    });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...values, city: e.target.value });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...values, year: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...values, status: e.target.value });
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onChange({
        search: "",
        province: "",
        city: "",
        year: "",
        status: ""
      });
    }
  };

  const hasActiveFilters = !!(
    values.search ||
    values.province ||
    values.city ||
    (values.year && values.year !== "Semua") ||
    (values.status && values.status !== "Semua")
  );

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        padding: "16px",
        border: "1px solid #E2E8F0",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          alignItems: "flex-end"
        }}
      >
        {/* Search Input */}
        <div style={{ minWidth: "220px" }}>
          <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", marginBottom: "4px" }}>
            Pencarian
          </label>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "#94A3B8" }} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={values.search}
              onChange={handleSearchChange}
              style={{
                width: "100%",
                height: "38px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                paddingLeft: "32px",
                paddingRight: values.search ? "30px" : "12px",
                fontSize: "12px",
                color: "#1E293B",
                outline: "none"
              }}
            />
            {values.search && (
              <button
                type="button"
                onClick={() => onChange({ ...values, search: "" })}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <X style={{ width: "14px", height: "14px" }} />
              </button>
            )}
          </div>
        </div>

        {/* Cascading Province Selector */}
        {showLocationFilter && (
          <div>
            <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", marginBottom: "4px" }}>
              Provinsi
            </label>
            <select
              value={values.province}
              onChange={handleProvinceChange}
              style={{
                width: "100%",
                height: "38px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#1E293B",
                outline: "none",
                backgroundColor: "#FFFFFF"
              }}
            >
              <option value="">Semua Provinsi</option>
              {INDONESIA_PROVINCES.map((p) => (
                <option key={p.province} value={p.province}>
                  {p.province}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Cascading City Selector */}
        {showLocationFilter && (
          <div>
            <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", marginBottom: "4px" }}>
              Kabupaten / Kota
            </label>
            <select
              value={values.city}
              onChange={handleCityChange}
              disabled={!values.province}
              style={{
                width: "100%",
                height: "38px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 600,
                color: values.province ? "#1E293B" : "#94A3B8",
                backgroundColor: values.province ? "#FFFFFF" : "#F8FAFC",
                outline: "none",
                cursor: values.province ? "pointer" : "not-allowed"
              }}
            >
              <option value="">
                {values.province ? "Semua Kab / Kota" : "Pilih Provinsi Dulu"}
              </option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Year Selector */}
        {showYearFilter && (
          <div>
            <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", marginBottom: "4px" }}>
              Tahun Anggaran
            </label>
            <select
              value={values.year}
              onChange={handleYearChange}
              style={{
                width: "100%",
                height: "38px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#1E293B",
                outline: "none",
                backgroundColor: "#FFFFFF"
              }}
            >
              <option value="">Semua Tahun</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Selector */}
        {showStatusFilter && (
          <div>
            <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", marginBottom: "4px" }}>
              Status Verifikasi
            </label>
            <select
              value={values.status}
              onChange={handleStatusChange}
              style={{
                width: "100%",
                height: "38px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#1E293B",
                outline: "none",
                backgroundColor: "#FFFFFF"
              }}
            >
              {statuses.map((st) => (
                <option key={st} value={st === "Semua" ? "" : st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reset Filter Button */}
        <div>
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            style={{
              height: "38px",
              width: "100%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              backgroundColor: hasActiveFilters ? "#F1F5F9" : "#F8FAFC",
              color: hasActiveFilters ? "#0F2E5C" : "#94A3B8",
              fontSize: "11px",
              fontWeight: 800,
              cursor: hasActiveFilters ? "pointer" : "default",
              transition: "all 0.15s ease"
            }}
          >
            <RotateCcw style={{ width: "13px", height: "13px" }} />
            <span>Reset Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
