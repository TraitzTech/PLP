"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2, Plus, BadgeCheck, Wallet, Clock } from "lucide-react";
import { toast } from "sonner";
import { adminPaoService } from "@/services/adminPaoService";
import { TableLoader } from "@/components/ui/shimmer-loaders";
import type {
  Pao,
  PaoEarning,
  PaoEarningStatus,
  PaoEarningType,
  PaoEarningsSummary,
} from "@/services/types";
import {
  EARNING_STATUS_META,
  EARNING_TYPE_LABELS,
  formatDate,
  formatXAF,
  getApiErrorMessage,
} from "../pao-utils";

const EMPTY_SUMMARY: PaoEarningsSummary = {
  total: 0,
  paid: 0,
  pending: 0,
  currency: "XAF",
};

export default function PaoEarningsPage() {
  const router = useRouter();

  const [earnings, setEarnings] = useState<PaoEarning[]>([]);
  const [summary, setSummary] = useState<PaoEarningsSummary>(EMPTY_SUMMARY);
  const [paos, setPaos] = useState<Pao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [paoFilter, setPaoFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  // Award bonus dialog
  const [isBonusDialogOpen, setIsBonusDialogOpen] = useState(false);
  const [bonusPaoId, setBonusPaoId] = useState<string>("");
  const [bonusAmount, setBonusAmount] = useState<string>("");
  const [bonusNote, setBonusNote] = useState<string>("");
  const [bonusErrors, setBonusErrors] = useState<Record<string, string>>({});
  const [isAwarding, setIsAwarding] = useState(false);

  const fetchEarnings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminPaoService.getAllEarnings({
        pao_id: paoFilter === "all" ? undefined : paoFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        type: typeFilter === "all" ? undefined : typeFilter,
      });

      setEarnings(Array.isArray(response?.earnings) ? response.earnings : []);
      setSummary(response?.summary || EMPTY_SUMMARY);
      setSelectedIds([]);
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "Failed to fetch PAO earnings"));
      console.error("Error fetching PAO earnings:", error);
      setEarnings([]);
      setSummary(EMPTY_SUMMARY);
    } finally {
      setIsLoading(false);
    }
  }, [paoFilter, statusFilter, typeFilter]);

  const fetchPaos = async () => {
    try {
      const response = await adminPaoService.getAllPaos();
      setPaos(Array.isArray(response) ? response : []);
    } catch (error: any) {
      // Non-fatal: the table still works without the PAO filter options.
      console.error("Error fetching PAOs:", error);
      toast.error(getApiErrorMessage(error, "Failed to load PAO list"));
    }
  };

  useEffect(() => {
    fetchPaos();
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  // Only unpaid earnings can be settled.
  const selectableIds = useMemo(
    () => earnings.filter((earning) => earning.status === "pending").map((e) => e.id),
    [earnings]
  );

  const allSelectableSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));

  const toggleRow = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? selectableIds : []);
  };

  const handleMarkPaid = async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsMarkingPaid(true);
      await adminPaoService.markEarningsPaid(selectedIds);
      toast.success(
        `${selectedIds.length} ${selectedIds.length === 1 ? "earning" : "earnings"} marked as paid`
      );
      await fetchEarnings();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "Failed to mark earnings as paid"));
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const openBonusDialog = () => {
    setBonusPaoId("");
    setBonusAmount("");
    setBonusNote("");
    setBonusErrors({});
    setIsBonusDialogOpen(true);
  };

  const handleAwardBonus = async () => {
    const newErrors: Record<string, string> = {};
    const amount = Number(bonusAmount);

    if (!bonusPaoId) newErrors.pao_id = "Select a PAO";
    if (!bonusAmount.trim()) newErrors.amount = "Amount is required";
    else if (!Number.isFinite(amount) || amount <= 0)
      newErrors.amount = "Enter an amount greater than zero";
    if (!bonusNote.trim()) newErrors.note = "A note explaining this bonus is required";

    setBonusErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsAwarding(true);
      await adminPaoService.awardOtherBonus(Number(bonusPaoId), amount, bonusNote.trim());
      toast.success("Bonus awarded successfully");
      setIsBonusDialogOpen(false);
      await fetchEarnings();
    } catch (error: any) {
      console.error("Error awarding bonus:", error);
      if (error.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          fieldErrors[field] = Array.isArray(messages) ? String(messages[0]) : String(messages);
        });
        setBonusErrors(fieldErrors);
      }
      toast.error(getApiErrorMessage(error, "Failed to award bonus"));
    } finally {
      setIsAwarding(false);
    }
  };

  const selectedTotal = earnings
    .filter((earning) => selectedIds.includes(earning.id))
    .reduce((sum, earning) => sum + Number(earning.amount || 0), 0);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">PAO Earnings</h1>
              <p className="text-muted-foreground">
                Track commissions and manage PAO payouts
              </p>
            </div>
          </div>
          <Button onClick={openBonusDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Award Bonus
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatXAF(summary.total)}</div>
              <p className="text-xs text-muted-foreground">All commissions in view</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatXAF(summary.paid)}</div>
              <p className="text-xs text-muted-foreground">Already settled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-plp-purple">
                {formatXAF(summary.pending)}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting payout</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Select value={paoFilter} onValueChange={setPaoFilter}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="All PAOs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All PAOs</SelectItem>
                {paos.map((pao) => (
                  <SelectItem key={pao.id} value={String(pao.id)}>
                    {pao.user?.name || "Unnamed"} ({pao.staff_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="property_bonus">Property Bonus</SelectItem>
                <SelectItem value="verification_bonus">Verification Bonus</SelectItem>
                <SelectItem value="other_bonus">Other Bonus</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Earnings Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Earnings</CardTitle>
                <CardDescription>
                  {earnings.length} {earnings.length === 1 ? "record" : "records"}
                  {selectedIds.length > 0
                    ? ` · ${selectedIds.length} selected (${formatXAF(selectedTotal)})`
                    : ""}
                </CardDescription>
              </div>
              <Button
                onClick={handleMarkPaid}
                disabled={selectedIds.length === 0 || isMarkingPaid}
              >
                {isMarkingPaid ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Marking...
                  </>
                ) : (
                  <>
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Mark Selected as Paid
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableLoader rows={10} columns={7} />
            ) : earnings.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No earnings match the current filters.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={allSelectableSelected}
                          onCheckedChange={(checked) => toggleAll(checked === true)}
                          disabled={selectableIds.length === 0}
                          aria-label="Select all pending earnings"
                        />
                      </TableHead>
                      <TableHead>PAO</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Related Property</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earnings.map((earning) => {
                      const statusMeta =
                        EARNING_STATUS_META[earning.status as PaoEarningStatus] ||
                        EARNING_STATUS_META.pending;
                      return (
                        <TableRow key={earning.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.includes(earning.id)}
                              onCheckedChange={(checked) =>
                                toggleRow(earning.id, checked === true)
                              }
                              disabled={earning.status !== "pending"}
                              aria-label={`Select earning ${earning.id}`}
                            />
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{earning.pao?.user?.name || "—"}</p>
                            <p className="text-xs font-mono text-muted-foreground">
                              {earning.pao?.staff_code || "—"}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm">
                            {EARNING_TYPE_LABELS[earning.type as PaoEarningType] || earning.type}
                            {earning.note && (
                              <p className="text-xs text-muted-foreground max-w-[220px] truncate">
                                {earning.note}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {formatXAF(earning.amount)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {earning.listing?.title || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`w-fit ${statusMeta.className}`}
                            >
                              {statusMeta.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(earning.paid_at || earning.created_at)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Award Bonus Dialog */}
      <Dialog open={isBonusDialogOpen} onOpenChange={setIsBonusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award Bonus</DialogTitle>
            <DialogDescription>
              Award a manual "other" bonus to a PAO. It is created as a pending earning until you
              mark it paid.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bonus-pao">
                PAO <span className="text-red-500">*</span>
              </Label>
              <Select
                value={bonusPaoId}
                onValueChange={(value) => {
                  setBonusPaoId(value);
                  setBonusErrors((prev) => ({ ...prev, pao_id: "" }));
                }}
              >
                <SelectTrigger id="bonus-pao">
                  <SelectValue placeholder="Select a PAO" />
                </SelectTrigger>
                <SelectContent>
                  {paos.map((pao) => (
                    <SelectItem key={pao.id} value={String(pao.id)}>
                      {pao.user?.name || "Unnamed"} ({pao.staff_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {bonusErrors.pao_id && (
                <p className="text-sm text-red-500">{bonusErrors.pao_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus-amount">
                Amount (XAF) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bonus-amount"
                type="number"
                min={0}
                value={bonusAmount}
                onChange={(e) => {
                  setBonusAmount(e.target.value);
                  setBonusErrors((prev) => ({ ...prev, amount: "" }));
                }}
                placeholder="e.g., 15000"
              />
              {bonusErrors.amount && (
                <p className="text-sm text-red-500">{bonusErrors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus-note">
                Note <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="bonus-note"
                value={bonusNote}
                onChange={(e) => {
                  setBonusNote(e.target.value);
                  setBonusErrors((prev) => ({ ...prev, note: "" }));
                }}
                placeholder="Reason for this bonus..."
                rows={3}
              />
              {bonusErrors.note && <p className="text-sm text-red-500">{bonusErrors.note}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBonusDialogOpen(false)}
              disabled={isAwarding}
            >
              Cancel
            </Button>
            <Button onClick={handleAwardBonus} disabled={isAwarding}>
              {isAwarding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Awarding...
                </>
              ) : (
                "Award Bonus"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
