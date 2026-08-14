"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle, Phone, MapPin, ShieldCheck, RefreshCw, CircleDashed } from "lucide-react";
import type { PaoTaskType, VerificationStatus } from "@/services/types";

/**
 * Currency formatting used across every PAO screen. Values coming from the API
 * are sometimes decimal strings, so both shapes are accepted.
 */
export const formatXAF = (amount: number | string | null | undefined): string => {
  const parsed = typeof amount === "string" ? parseFloat(amount) : amount ?? 0;
  const safe = Number.isFinite(parsed as number) ? (parsed as number) : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(safe);
};

export const formatDate = (value?: string | null): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

/** Today's date as YYYY-MM-DD, for date input defaults. */
export const todayISO = (): string => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
};

const VERIFICATION_META: Record<
  VerificationStatus,
  { label: string; className: string }
> = {
  verified: {
    label: "Verified ✓",
    className: "bg-green-100 text-green-800 hover:bg-green-100 border-transparent",
  },
  pending: {
    label: "Pending verification ⏳",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-transparent",
  },
  needs_correction: {
    label: "Needs correction ⚠️",
    className: "bg-red-100 text-red-800 hover:bg-red-100 border-transparent",
  },
  rejected: {
    label: "Rejected",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-100 border-transparent",
  },
};

export function VerificationBadge({
  status,
  className,
}: {
  status?: VerificationStatus | null;
  className?: string;
}) {
  const meta = VERIFICATION_META[(status ?? "pending") as VerificationStatus] ?? VERIFICATION_META.pending;
  return (
    <Badge variant="secondary" className={cn("font-medium whitespace-nowrap", meta.className, className)}>
      {meta.label}
    </Badge>
  );
}

export const TASK_TYPE_META: Record<PaoTaskType, { label: string; emoji: string; className: string }> = {
  call: { label: "Call", emoji: "📞", className: "bg-blue-100 text-blue-800" },
  visit: { label: "Visit", emoji: "📍", className: "bg-purple-100 text-purple-800" },
  verify: { label: "Verify", emoji: "✅", className: "bg-green-100 text-green-800" },
  follow_up: { label: "Follow up", emoji: "🔁", className: "bg-amber-100 text-amber-800" },
  other: { label: "Other", emoji: "🗒️", className: "bg-gray-100 text-gray-700" },
};

export function TaskTypeBadge({ type }: { type: PaoTaskType }) {
  const meta = TASK_TYPE_META[type] ?? TASK_TYPE_META.other;
  return (
    <Badge variant="secondary" className={cn("border-transparent font-medium whitespace-nowrap", meta.className)}>
      <span className="mr-1">{meta.emoji}</span>
      {meta.label}
    </Badge>
  );
}

export function ContactVerifiedBadge({ verified }: { verified?: boolean }) {
  if (!verified) return null;
  return (
    <Badge variant="secondary" className="border-transparent bg-green-100 text-green-800 font-medium whitespace-nowrap">
      <ShieldCheck className="w-3 h-3 mr-1" />
      Contact verified
    </Badge>
  );
}

/**
 * Shared retry state so a failed API call never leaves a blank screen.
 */
export function PaoErrorState({
  message = "We couldn't load this data.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-6 flex flex-col items-center text-center gap-3">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-sm text-red-800">{message}</p>
        <Button variant="outline" className="h-10" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

export function PaoEmptyState({
  icon: Icon = CircleDashed,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12 px-4">
      <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p className="font-medium text-gray-900">{title}</p>
      {description ? <p className="text-sm text-gray-500 mt-1">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

/** Small inline meta row used on list cards (phone / location). */
export function MetaRow({ phone, location }: { phone?: string | null; location?: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
      {phone ? (
        <span className="flex items-center gap-1">
          <Phone className="w-3.5 h-3.5" />
          {phone}
        </span>
      ) : null}
      {location ? (
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {location}
        </span>
      ) : null}
    </div>
  );
}
