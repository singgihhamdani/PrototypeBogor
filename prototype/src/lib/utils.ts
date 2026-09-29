import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)} Jt`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}
