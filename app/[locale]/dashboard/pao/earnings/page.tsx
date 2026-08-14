"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Home, BadgeCheck, Gift, CircleDollarSign, Clock } from "lucide-react";
import { paoService } from "@/services/paoService";
import type { PaoEarning, PaoEarningType, PaoEarningsSummary } from "@/services/types";
import { PaoEmptyState, PaoErrorState, formatDate, formatXAF } from "@/components/dashboard/pao/pao-ui";

const EARNING_TYPE_META: Record<PaoEarningType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  property_bonus: { label: "Property bonus", icon: Home },
  verification_bonus: { label: "Verification bonus", icon: BadgeCheck },
  other_bonus: { label: "Other bonus", icon: Gift },
};

export default function PaoEarningsPage() {
  const [earnings, setEarnings] = useState<PaoEarning[]>([]);
  const [summary, setSummary] = useState<PaoEarningsSummary | null>(null);
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const fetchEarnings = useCallback(async (selectedMonth: string) => {
    setLoading(true);
    setFailed(false);
    try {
      const data = await paoService.getEarnings(selectedMonth ? { month: selectedMonth } : undefined);
      const list = Array.isArray(data?.earnings) ? [...data.earnings] : [];
      // Newest first.
      list.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setEarnings(list);
      setSummary(data?.summary ?? null);
    } catch (error: any) {
      console.error("Error fetching PAO earnings:", error);
      toast.error(error?.message || "Failed to load your earnings");
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings(month);
  }, [fetchEarnings, month]);

  const byType = summary?.by_type;

  return (
    <DashboardLayout userType="pao">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Earnings</h1>
          <p className="text-gray-600 mt-1">Bonuses you've earned from acquisitions.</p>
        </div>

        {/* Month filter */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="space-y-2 flex-1 sm:max-w-xs">
            <Label htmlFor="month">Filter by month</Label>
            <Input
              id="month"
              type="month"
              className="h-11"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
          {month ? (
            <Button variant="outline" className="h-11" onClick={() => setMonth("")}>
              Show all time
            </Button>
          ) : null}
        </div>

        {failed && !loading ? (
          <PaoErrorState message="We couldn't load your earnings." onRetry={() => fetchEarnings(month)} />
        ) : null}

        {/* Total */}
        <Card className="bg-plp-purple text-white border-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-white/80">{month ? "Selected month" : "Total earned"}</p>
                {loading ? (
                  <Skeleton className="h-9 w-40 mt-2 bg-white/20" />
                ) : (
                  <p className="text-2xl md:text-4xl font-bold mt-1 truncate">
                    {formatXAF(summary?.total ?? 0)}
                  </p>
                )}
              </div>
              <Wallet className="w-10 h-10 text-white/80 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Paid / pending */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-4 md:p-6 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600">Paid</p>
                {loading ? (
                  <Skeleton className="h-7 w-28 mt-1" />
                ) : (
                  <p className="text-xl md:text-2xl font-bold text-green-700 truncate">
                    {formatXAF(summary?.paid ?? 0)}
                  </p>
                )}
              </div>
              <CircleDollarSign className="w-8 h-8 text-green-600 flex-shrink-0" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                {loading ? (
                  <Skeleton className="h-7 w-28 mt-1" />
                ) : (
                  <p className="text-xl md:text-2xl font-bold text-amber-700 truncate">
                    {formatXAF(summary?.pending ?? 0)}
                  </p>
                )}
              </div>
              <Clock className="w-8 h-8 text-amber-500 flex-shrink-0" />
            </CardContent>
          </Card>
        </div>

        {/* Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              (Object.keys(EARNING_TYPE_META) as PaoEarningType[]).map((type) => {
                const meta = EARNING_TYPE_META[type];
                const Icon = meta.icon;
                return (
                  <div key={type} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm text-gray-700">
                      <Icon className="w-4 h-4 text-plp-purple" />
                      {meta.label}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatXAF(byType?.[type] ?? 0)}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Individual earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : earnings.length === 0 ? (
              <PaoEmptyState
                icon={Wallet}
                title="No earnings yet"
                description={
                  month
                    ? "Nothing recorded for the selected month."
                    : "Acquire and verify properties to start earning bonuses."
                }
              />
            ) : (
              <div className="space-y-3">
                {earnings.map((earning) => {
                  const meta = EARNING_TYPE_META[earning.type] ?? EARNING_TYPE_META.other_bonus;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={earning.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg border"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-plp-purple/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-plp-purple" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">{meta.label}</p>
                          {earning.listing?.title ? (
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {earning.listing.title}
                            </p>
                          ) : null}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(earning.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-gray-900 whitespace-nowrap">
                          {formatXAF(earning.amount)}
                        </p>
                        <Badge
                          variant="secondary"
                          className={
                            earning.status === "paid"
                              ? "border-transparent bg-green-100 text-green-800 mt-1"
                              : "border-transparent bg-amber-100 text-amber-800 mt-1"
                          }
                        >
                          {earning.status === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
