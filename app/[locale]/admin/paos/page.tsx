"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  ArrowLeft,
  Eye,
  Trash2,
  Edit,
  MoreHorizontal,
  Ban,
  CheckCircle2,
  XCircle,
  Wallet,
  Building2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { adminPaoService } from "@/services/adminPaoService";
import { TableLoader } from "@/components/ui/shimmer-loaders";
import type { Pao, PaoStatus } from "@/services/types";
import {
  formatDate,
  formatXAF,
  getApiErrorMessage,
  getPaoPhotoUrl,
  getUserInitials,
  targetPercent,
} from "./pao-utils";

interface DetailModalData {
  pao: Pao | null;
  isOpen: boolean;
}

export default function AdminPaosPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale === "fr" ? "fr" : "en";
  const withLocale = (path: string) => `/${locale}${path.startsWith("/") ? path : `/${path}`}`;

  const [paos, setPaos] = useState<Pao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PaoStatus>("all");
  const [detailModal, setDetailModal] = useState<DetailModalData>({ pao: null, isOpen: false });
  const [deletePaoId, setDeletePaoId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const fetchPaos = async () => {
    try {
      setIsLoading(true);
      const response = await adminPaoService.getAllPaos();
      setPaos(Array.isArray(response) ? response : []);
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "Failed to fetch PAOs"));
      console.error("Error fetching PAOs:", error);
      setPaos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaos();
  }, []);

  const handleDeletePao = async () => {
    if (!deletePaoId) return;

    try {
      setIsDeleting(true);
      await adminPaoService.deletePao(deletePaoId);
      toast.success("PAO deleted successfully");
      setDeletePaoId(null);
      setDetailModal({ pao: null, isOpen: false });
      await fetchPaos();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "Failed to delete PAO"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (pao: Pao) => {
    const nextStatus: PaoStatus = pao.status === "active" ? "suspended" : "active";

    try {
      setUpdatingStatusId(String(pao.id));
      await adminPaoService.updatePaoStatus(pao.id, nextStatus);
      toast.success(nextStatus === "active" ? "PAO activated" : "PAO suspended");
      setDetailModal({ pao: null, isOpen: false });
      await fetchPaos();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "Failed to update PAO status"));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getStatusBadge = (status: PaoStatus) => {
    const Icon = status === "active" ? CheckCircle2 : XCircle;
    return (
      <Badge
        variant="outline"
        className={
          status === "active"
            ? "flex items-center gap-1 w-fit bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
            : "flex items-center gap-1 w-fit bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
        }
      >
        <Icon className="h-3 w-3" />
        {status === "active" ? "Active" : "Suspended"}
      </Badge>
    );
  };

  const renderTargetCell = (current: number | undefined, target: number | undefined) => {
    const currentValue = current || 0;
    const targetValue = target || 0;
    return (
      <div className="min-w-[92px] space-y-1">
        <div className="text-sm font-medium">
          {currentValue}
          <span className="text-muted-foreground font-normal"> / {targetValue || "—"}</span>
        </div>
        <Progress value={targetPercent(currentValue, targetValue)} className="h-1.5" />
      </div>
    );
  };

  const filteredPaos = paos.filter((pao) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      pao.user?.name?.toLowerCase().includes(query) ||
      pao.user?.email?.toLowerCase().includes(query) ||
      pao.staff_code?.toLowerCase().includes(query) ||
      (pao.territory || "").toLowerCase().includes(query);

    const matchesStatus = statusFilter === "all" || pao.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = paos.filter((pao) => pao.status === "active").length;
  const totalProperties = paos.reduce((sum, pao) => sum + (pao.properties_count || 0), 0);
  const totalVerified = paos.reduce((sum, pao) => sum + (pao.verified_count || 0), 0);
  const totalPendingPayout = paos.reduce((sum, pao) => sum + Number(pao.pending_earnings || 0), 0);

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
              <h1 className="text-3xl font-bold tracking-tight">Property Acquisition Officers</h1>
              <p className="text-muted-foreground">
                Manage PAO accounts, targets and field performance
              </p>
            </div>
          </div>
          <Button onClick={() => router.push(withLocale("/admin/paos/new"))}>
            <Plus className="h-4 w-4 mr-2" />
            Add PAO
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total PAOs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paos.length}</div>
              <p className="text-xs text-muted-foreground">All PAO accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
              <p className="text-xs text-muted-foreground">
                {paos.length - activeCount} suspended
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Properties Acquired
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProperties}</div>
              <p className="text-xs text-muted-foreground">{totalVerified} verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                Pending Payouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-plp-purple">
                {formatXAF(totalPendingPayout)}
              </div>
              <p className="text-xs text-muted-foreground">Unpaid commissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter & Search</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by name, staff code, email or territory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as "all" | PaoStatus)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* PAOs Table */}
        <Card>
          <CardHeader>
            <CardTitle>All PAOs</CardTitle>
            <CardDescription>
              {filteredPaos.length} {filteredPaos.length === 1 ? "PAO" : "PAOs"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableLoader rows={10} columns={9} />
            ) : filteredPaos.length === 0 ? (
              <Alert>
                <AlertDescription>
                  {paos.length === 0
                    ? "No PAOs found. Start by adding your first Property Acquisition Officer."
                    : "No PAOs match your search criteria."}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Territory</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead>Landlords</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Total Earnings</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Pending Payout</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPaos.map((pao) => (
                      <TableRow key={pao.id}>
                        <TableCell className="font-mono text-sm whitespace-nowrap">{pao.staff_code}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={getPaoPhotoUrl(pao.profile_photo) || undefined}
                                alt={pao.user?.name}
                              />
                              <AvatarFallback>{getUserInitials(pao.user?.name)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{pao.user?.name || "N/A"}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {pao.user?.email || "—"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{pao.territory || "—"}</TableCell>
                        <TableCell>{getStatusBadge(pao.status)}</TableCell>
                        <TableCell>
                          {renderTargetCell(pao.properties_count, pao.target_properties)}
                        </TableCell>
                        <TableCell>
                          {renderTargetCell(pao.landlords_count, pao.target_landlords)}
                        </TableCell>
                        <TableCell>
                          {renderTargetCell(pao.verified_count, pao.target_verified_properties)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium whitespace-nowrap">
                          {formatXAF(pao.total_earnings)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-plp-purple whitespace-nowrap">
                          {formatXAF(pao.pending_earnings)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                disabled={updatingStatusId === String(pao.id)}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDetailModal({ pao, isOpen: true })}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(withLocale(`/admin/paos/${pao.id}/edit`))
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(pao)}>
                                {pao.status === "active" ? (
                                  <>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Suspend
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeletePaoId(String(pao.id))}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog
        open={detailModal.isOpen}
        onOpenChange={(isOpen) => setDetailModal({ ...detailModal, isOpen })}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailModal.pao && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={getPaoPhotoUrl(detailModal.pao.profile_photo) || undefined}
                      alt={detailModal.pao.user?.name}
                    />
                    <AvatarFallback className="text-lg">
                      {getUserInitials(detailModal.pao.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{detailModal.pao.user?.name || "N/A"}</DialogTitle>
                    <DialogDescription>
                      {detailModal.pao.staff_code} · Property Acquisition Officer
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Account</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{detailModal.pao.user?.email || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{detailModal.pao.user?.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium capitalize">
                        {detailModal.pao.user?.gender || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="mt-1">{getStatusBadge(detailModal.pao.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Territory</p>
                      <p className="font-medium">{detailModal.pao.territory || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Joined</p>
                      <p className="font-medium">{formatDate(detailModal.pao.created_at)}</p>
                    </div>
                    {detailModal.pao.bio && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Bio</p>
                        <p className="text-sm">{detailModal.pao.bio}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Performance vs Targets</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Properties</p>
                      {renderTargetCell(
                        detailModal.pao.properties_count,
                        detailModal.pao.target_properties
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Landlords</p>
                      {renderTargetCell(
                        detailModal.pao.landlords_count,
                        detailModal.pao.target_landlords
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Verified</p>
                      {renderTargetCell(
                        detailModal.pao.verified_count,
                        detailModal.pao.target_verified_properties
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Earnings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earned</p>
                      <p className="font-medium">{formatXAF(detailModal.pao.total_earnings)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Payout</p>
                      <p className="font-medium text-plp-purple">
                        {formatXAF(detailModal.pao.pending_earnings)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleToggleStatus(detailModal.pao!)}
                  disabled={updatingStatusId === String(detailModal.pao.id)}
                >
                  {detailModal.pao.status === "active" ? "Suspend" : "Activate"}
                </Button>
                <Button
                  onClick={() => {
                    const id = detailModal.pao!.id;
                    setDetailModal({ pao: null, isOpen: false });
                    router.push(withLocale(`/admin/paos/${id}/edit`));
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit PAO
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletePaoId}
        onOpenChange={(isOpen) => !isOpen && setDeletePaoId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete PAO</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this PAO? Their account will be removed and this
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePao}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
