"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStatsLoader } from "@/components/ui/shimmer-loaders";
import {
  Building2,
  BadgeCheck,
  Users,
  Wallet,
  Target,
  ListChecks,
  Plus,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { paoService } from "@/services/paoService";
import { getCurrentUser } from "@/lib/agentHelpers";
import type { PaoDashboardStats, PaoTaskType } from "@/services/types";
import { formatXAF, PaoErrorState } from "@/components/dashboard/pao/pao-ui";

const TASK_SUMMARY_LABELS: Record<PaoTaskType, (count: number) => string> = {
  call: (n) => `Contact ${n} landlord${n === 1 ? "" : "s"}`,
  visit: (n) => `Visit ${n} propert${n === 1 ? "y" : "ies"}`,
  verify: (n) => `Verify ${n} propert${n === 1 ? "y" : "ies"}`,
  follow_up: (n) => `Follow up with ${n} lead${n === 1 ? "" : "s"}`,
  other: (n) => `${n} other task${n === 1 ? "" : "s"}`,
};

const TASK_ORDER: PaoTaskType[] = ["call", "visit", "verify", "follow_up", "other"];

const QUICK_ACTIONS = [
  { href: "/dashboard/pao/properties/new", emoji: "🏠", label: "Add Property" },
  { href: "/dashboard/pao/landlords/new", emoji: "👤", label: "Add Landlord" },
  { href: "/dashboard/pao/tasks?action=record-visit", emoji: "📍", label: "Record Visit" },
  { href: "/dashboard/pao/earnings", emoji: "💰", label: "My Earnings" },
];

function TargetBar({
  label,
  current,
  target,
}: {
  label: string;
  current: number;
  target: number;
}) {
  const safeTarget = target > 0 ? target : 0;
  const percent = safeTarget > 0 ? Math.min(100, Math.round((current / safeTarget) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-900">{label}</span>
        <span className="text-gray-600">
          {current} / {safeTarget || "—"}
          {safeTarget > 0 ? <span className="ml-2 text-gray-400">{percent}%</span> : null}
        </span>
      </div>
      <Progress value={percent} className="h-2.5" />
    </div>
  );
}

export default function PaoDashboardPage() {
  const [stats, setStats] = useState<PaoDashboardStats | null>(null);
  const [firstName, setFirstName] = useState("there");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const data = await paoService.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      console.error("Error fetching PAO dashboard stats:", error);
      toast.error(error?.message || "Failed to load your dashboard");
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const user = await getCurrentUser();
        if (active && user?.name) {
          setFirstName(user.name.trim().split(" ")[0] || "there");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    })();

    fetchStats();

    return () => {
      active = false;
    };
  }, [fetchStats]);

  const kpis = stats?.kpis;
  const targets = stats?.targets;
  const summary = stats?.today_tasks?.summary;

  const summaryRows = summary
    ? TASK_ORDER.filter((type) => (summary[type] ?? 0) > 0).map((type) => ({
        type,
        label: TASK_SUMMARY_LABELS[type](summary[type] ?? 0),
      }))
    : [];

  return (
    <DashboardLayout userType="pao">
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          {loading ? (
            <>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome back, {firstName}!
              </h1>
              <p className="text-gray-600 mt-1">Here's how your acquisition work is going.</p>
            </>
          )}
        </div>

        {failed && !loading ? (
          <PaoErrorState message="We couldn't load your dashboard." onRetry={fetchStats} />
        ) : null}

        {/* KPIs */}
        {loading ? (
          <DashboardStatsLoader />
        ) : kpis ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-600">Properties Acquired</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {kpis.properties_acquired}
                    </p>
                  </div>
                  <Building2 className="w-7 h-7 md:w-8 md:h-8 text-plp-purple flex-shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-600">Verified</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{kpis.verified}</p>
                  </div>
                  <BadgeCheck className="w-7 h-7 md:w-8 md:h-8 text-green-600 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-600">Landlords</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{kpis.landlords}</p>
                  </div>
                  <Users className="w-7 h-7 md:w-8 md:h-8 text-plp-pink flex-shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                      {formatXAF(kpis.earnings_this_month)}
                    </p>
                  </div>
                  <Wallet className="w-7 h-7 md:w-8 md:h-8 text-plp-yellow flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Targets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-plp-purple" />
                My Target
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {loading ? (
                <div className="space-y-5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-2.5 w-full" />
                    </div>
                  ))}
                </div>
              ) : targets ? (
                <>
                  <TargetBar
                    label="Properties"
                    current={targets.properties.current}
                    target={targets.properties.target}
                  />
                  <TargetBar
                    label="Landlords"
                    current={targets.landlords.current}
                    target={targets.landlords.target}
                  />
                  <TargetBar
                    label="Verified Properties"
                    current={targets.verified_properties.current}
                    target={targets.verified_properties.target}
                  />
                </>
              ) : (
                <p className="text-sm text-gray-500">No targets set yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Today's tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListChecks className="w-5 h-5 text-plp-purple" />
                Today's Tasks
              </CardTitle>
              <Link href="/dashboard/pao/tasks">
                <Button variant="outline" size="sm" className="h-9">
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-5 w-3/4" />
                  ))}
                </div>
              ) : summaryRows.length > 0 ? (
                <ul className="space-y-3">
                  {summaryRows.map((row) => (
                    <li key={row.type} className="flex items-center gap-3 text-sm text-gray-800">
                      <span className="w-2 h-2 rounded-full bg-plp-pink flex-shrink-0" />
                      {row.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 py-4">
                  Nothing scheduled for today. Nice work! 🎉
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="hover:shadow-md hover:border-plp-purple/40 transition cursor-pointer h-full">
                  <CardContent className="p-4 flex items-center gap-3 min-h-[64px]">
                    <span className="text-xl" aria-hidden>
                      {action.emoji}
                    </span>
                    <span className="text-sm font-medium text-gray-900 flex-1">{action.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Convenience: jump straight to adding work */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard/pao/properties/new" className="flex-1">
            <Button className="w-full h-11 bg-plp-purple hover:bg-plp-purple/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </Link>
          <Link href="/dashboard/pao/tasks?action=record-visit" className="flex-1">
            <Button variant="outline" className="w-full h-11">
              <MapPin className="w-4 h-4 mr-2" />
              Record Visit
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
