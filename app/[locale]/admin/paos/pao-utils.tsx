import { getBackendOrigin } from "@/lib/listingMedia";
import { CheckCircle2, Clock, AlertTriangle, XCircle, type LucideIcon } from "lucide-react";
import type { PaoEarningType, PaoEarningStatus, VerificationStatus } from "@/services/types";

/** Currency formatter used across every PAO admin screen. */
const xafFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "XAF",
  minimumFractionDigits: 0,
});

export function formatXAF(value: number | string | null | undefined): string {
  const numeric = typeof value === "string" ? parseFloat(value) : value;
  if (numeric === null || numeric === undefined || Number.isNaN(numeric)) {
    return xafFormatter.format(0);
  }
  return xafFormatter.format(numeric);
}

export function getUserInitials(name?: string | null): string {
  if (!name || !name.trim()) return "NA";
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Resolve a PAO profile photo path coming back from the API to a usable src. */
export function getPaoPhotoUrl(imagePath?: string | null): string {
  if (!imagePath || !imagePath.trim()) return "";
  const path = imagePath.trim();
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  const origin = getBackendOrigin();
  if (path.startsWith("/")) return origin ? `${origin}${path}` : path;

  const cleanPath = path.replace(/^profile_photos\//, "");
  return origin
    ? `${origin}/storage/profile_photos/${cleanPath}`
    : `/storage/profile_photos/${cleanPath}`;
}

/**
 * Pull a human readable message out of an axios error, including Laravel 422
 * validation payloads (`{ message, errors: { field: [msg] } }`).
 */
export function getApiErrorMessage(error: any, fallback: string): string {
  const data = error?.response?.data;
  const validationErrors = data?.errors;

  if (validationErrors && typeof validationErrors === "object") {
    const firstEntry = Object.values(validationErrors)[0];
    if (Array.isArray(firstEntry) && typeof firstEntry[0] === "string") {
      return firstEntry[0];
    }
    if (typeof firstEntry === "string") return firstEntry;
  }

  return data?.message || error?.message || fallback;
}

export const VERIFICATION_STATUS_META: Record<
  VerificationStatus,
  { label: string; className: string; icon: LucideIcon }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
    icon: Clock,
  },
  verified: {
    label: "Verified",
    className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
    icon: CheckCircle2,
  },
  needs_correction: {
    label: "Needs Correction",
    className: "bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-100",
    icon: AlertTriangle,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
    icon: XCircle,
  },
};

export const EARNING_TYPE_LABELS: Record<PaoEarningType, string> = {
  property_bonus: "Property Bonus",
  verification_bonus: "Verification Bonus",
  other_bonus: "Other Bonus",
};

export const EARNING_STATUS_META: Record<PaoEarningStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
  },
  paid: {
    label: "Paid",
    className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
  },
};

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

/** Percentage of a target reached, clamped to 0-100 for progress bars. */
export function targetPercent(current?: number | null, target?: number | null): number {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round(((current || 0) / target) * 100));
}
