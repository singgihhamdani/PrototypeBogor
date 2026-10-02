"use client";
import React, { useState, useMemo } from "react";
import { 
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, 
  ChevronRight, Download, FileSpreadsheet, FileText, 
  Printer, Database, Search, Filter, Landmark
} from "lucide-react";
import { exportToSpreadsheet, exportToCSV, ExportColumn } from "@/lib/export-utils";
import { SipjakiTemplate } from "@/lib/sipjaki-templates";

export interface ColumnDef<T> {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableViewProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  subtitle?: string;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  exportFileName?: string;
  onRowClick?: (row: T) => void;
  actionsHeader?: string;
  actionsRender?: (row: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  exportColumns?: ExportColumn[];
  sipjakiTemplate?: SipjakiTemplate;
  hideExport?: boolean;
}

export default function DataTableView<T extends object>({
  data,
  columns,
  title,
  subtitle,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  exportFileName = "data-sijakon",
  onRowClick,
  actionsHeader,
  actionsRender,
  emptyMessage = "Tidak ada data yang sesuai dengan kriteria filter.",
  exportColumns,
  sipjakiTemplate,
  hideExport = false
}: DataTableViewProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = (a as Record<string, unknown>)[sortKey];
      const valB = (b as Record<string, unknown>)[sortKey];

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortOrder === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [data, sortKey, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const getMappedExportColumns = (): ExportColumn[] => {
    if (exportColumns && exportColumns.length > 0) return exportColumns;
    return columns.map((c) => ({
      key: c.key,
      label: c.label
    }));
  };

  const handleExport = (format: "xlsx" | "csv" | "pdf") => {
    if (format === "pdf") {
      window.print();
      return;
    }
    const cols = getMappedExportColumns();
    const cleanData = sortedData as Record<string, any>[];

    if (format === "csv") {
      exportToCSV({
        fileName: exportFileName,
        columns: cols,
        data: cleanData
      });
    } else {
      exportToSpreadsheet({
        fileName: exportFileName,
        sheetName: title ? title.substring(0, 30) : "DATA",
        columns: cols,
        data: cleanData
      });
    }
  };

  const handleExportSipjaki = () => {
    if (!sipjakiTemplate) return;
    exportToSpreadsheet({
      fileName: sipjakiTemplate.exportFileName,
      sheetName: sipjakiTemplate.sheetName,
      columns: sipjakiTemplate.columns,
      data: sortedData as Record<string, any>[],
      sipjakiMode: true,
      includeDataDictionary: true,
      dictionaryItems: sipjakiTemplate.dictionaryItems
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "20px",
        padding: "20px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 16px rgba(15, 46, 92, 0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}
    >
      {/* Table Toolbar Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          borderBottom: "1px solid #F1F5F9",
          paddingBottom: "14px"
        }}
      >
        <div>
          {title && (
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F2E5C", margin: 0 }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Export & Actions Toolbar */}
        {!hideExport && (
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", marginRight: "4px" }}>
              Ekspor:
            </span>

            {/* Tombol SIPJAKI Khusus jika ada template */}
            {sipjakiTemplate && (
              <button
                type="button"
                onClick={handleExportSipjaki}
                title="Ekspor berkas format SIPJAKI Kementerian PUPR (.xlsx + Kamus Data)"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  backgroundColor: "#0F2E5C",
                  color: "#FFFFFF",
                  border: "none",
                  borderBottom: "2px solid #FFC000",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(15, 46, 92, 0.2)"
                }}
              >
                <Landmark style={{ width: "13px", height: "13px", color: "#FFC000" }} />
                <span>Format SIPJAKI</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleExport("xlsx")}
              title="Ekspor tabel aktif ke Microsoft Excel (.xlsx)"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "8px",
                backgroundColor: "#DCFCE7",
                color: "#166534",
                border: "1px solid #BBF7D0",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              <FileSpreadsheet style={{ width: "13px", height: "13px" }} />
              <span>Excel</span>
            </button>

            <button
              type="button"
              onClick={() => handleExport("csv")}
              title="Ekspor ke berkas CSV (UTF-8)"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                borderRadius: "8px",
                backgroundColor: "#F1F5F9",
                color: "#334155",
                border: "1px solid #CBD5E1",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              <Download style={{ width: "13px", height: "13px" }} />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={() => handleExport("pdf")}
              title="Cetak atau Simpan PDF Laporan"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "8px",
                backgroundColor: "#FEE2E2",
                color: "#991B1B",
                border: "1px solid #FECACA",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              <FileText style={{ width: "13px", height: "13px" }} />
              <span>PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="Cetak Tabel"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                borderRadius: "8px",
                backgroundColor: "#F8FAFC",
                color: "#475569",
                border: "1px solid #E2E8F0",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              <Printer style={{ width: "13px", height: "13px" }} />
              <span>Cetak</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
          <thead>
            <tr style={{ backgroundColor: "#F8FAFC" }}>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    style={{
                      padding: "12px 14px",
                      textAlign: col.align || "left",
                      width: col.width,
                      fontSize: "11px",
                      fontWeight: 800,
                      color: isSorted ? "#0F2E5C" : "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      cursor: col.sortable !== false ? "pointer" : "default",
                      userSelect: "none",
                      borderTop: "1px solid #F1F5F9",
                      borderBottom: "1px solid #F1F5F9"
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        justifyContent: col.align === "center" ? "center" : col.align === "right" ? "flex-end" : "flex-start"
                      }}
                    >
                      <span>{col.label}</span>
                      {col.sortable !== false && (
                        <span style={{ color: isSorted ? "#0F2E5C" : "#CBD5E1" }}>
                          {isSorted ? (
                            sortOrder === "asc" ? (
                              <ChevronUp style={{ width: "13px", height: "13px" }} />
                            ) : (
                              <ChevronDown style={{ width: "13px", height: "13px" }} />
                            )
                          ) : (
                            <ChevronsUpDown style={{ width: "13px", height: "13px" }} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}

              {actionsRender && (
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    borderTop: "1px solid #F1F5F9",
                    borderBottom: "1px solid #F1F5F9"
                  }}
                >
                  {actionsHeader || "AKSI"}
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actionsRender ? 1 : 0)}
                  style={{
                    padding: "48px 16px",
                    textAlign: "center",
                    color: "#94A3B8",
                    backgroundColor: "#FFFFFF"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <Database style={{ width: "36px", height: "36px", color: "#CBD5E1" }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748B" }}>
                      {emptyMessage}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => {
                const globalIdx = startIndex + rowIdx;
                return (
                  <tr
                    key={rowIdx}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                      cursor: onRowClick ? "pointer" : "default",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F8FAFC";
                      e.currentTarget.style.transform = "scale(1.002)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#FFFFFF";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    {columns.map((col) => {
                      const cellValue = (row as Record<string, unknown>)[col.key];
                      return (
                        <td
                          key={col.key}
                          style={{
                            padding: "12px 14px",
                            textAlign: col.align || "left",
                            fontSize: "12px",
                            color: "#334155",
                            verticalAlign: "middle",
                            borderTop: "1px solid #F1F5F9",
                            borderBottom: "1px solid #F1F5F9"
                          }}
                        >
                          {col.render ? col.render(row, globalIdx) : String(cellValue ?? "")}
                        </td>
                      );
                    })}

                    {actionsRender && (
                      <td
                        style={{
                          padding: "12px 14px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          borderTop: "1px solid #F1F5F9",
                          borderBottom: "1px solid #F1F5F9"
                        }}
                      >
                        {actionsRender(row, globalIdx)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          paddingTop: "12px",
          borderTop: "1px solid #F1F5F9"
        }}
      >
        {/* Left: Row per page selector & Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "11px", color: "#64748B" }}>Tampilkan:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              height: "32px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              padding: "0 8px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#0F2E5C",
              backgroundColor: "#FFFFFF",
              outline: "none"
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} Baris
              </option>
            ))}
          </select>

          <span style={{ fontSize: "11px", color: "#64748B" }}>
            Menampilkan <b>{sortedData.length > 0 ? startIndex + 1 : 0}</b> -{" "}
            <b>{Math.min(startIndex + pageSize, sortedData.length)}</b> dari <b>{sortedData.length}</b> data
          </span>
        </div>

        {/* Right: Page Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              height: "32px",
              padding: "0 10px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              backgroundColor: currentPage === 1 ? "#F8FAFC" : "#FFFFFF",
              color: currentPage === 1 ? "#CBD5E1" : "#0F2E5C",
              fontSize: "11px",
              fontWeight: 800,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <ChevronLeft style={{ width: "13px", height: "13px" }} />
            <span>Sebelumnya</span>
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((page, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev && page - prev > 1;

              return (
                <React.Fragment key={page}>
                  {showEllipsis && <span style={{ padding: "0 4px", color: "#94A3B8" }}>...</span>}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    style={{
                      height: "32px",
                      minWidth: "32px",
                      padding: "0 8px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: currentPage === page ? "#0F2E5C" : "#F1F5F9",
                      color: currentPage === page ? "#FFFFFF" : "#475569",
                      fontSize: "11px",
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}

          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || sortedData.length === 0}
            style={{
              height: "32px",
              padding: "0 10px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              backgroundColor: currentPage === totalPages || sortedData.length === 0 ? "#F8FAFC" : "#FFFFFF",
              color: currentPage === totalPages || sortedData.length === 0 ? "#CBD5E1" : "#0F2E5C",
              fontSize: "11px",
              fontWeight: 800,
              cursor: currentPage === totalPages || sortedData.length === 0 ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <span>Berikutnya</span>
            <ChevronRight style={{ width: "13px", height: "13px" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
