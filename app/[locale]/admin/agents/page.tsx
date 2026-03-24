"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, ArrowLeft, Eye, Trash2, CheckCircle2, Clock, XCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import { agentService } from "@/services/agentService";
import { TableLoader } from "@/components/ui/shimmer-loaders";
import type { Agent, AgentStatus } from "@/services/types";

interface DetailModalData {
  agent: Agent | null;
  isOpen: boolean;
}

// Helper function to construct image URLs
function getIdImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  // Remove 'id_cards/' prefix if present since it's already in the path
  const cleanPath = imagePath.replace('id_cards/', '');
  return `${process.env.NEXT_PUBLIC_API_URL}/../storage/id_cards/${cleanPath}`;
}

function getProfilePhotoUrl(imagePath: string): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  // Remove 'profile_photos/' prefix if present
  const cleanPath = imagePath.replace('profile_photos/', '');
  return `${process.env.NEXT_PUBLIC_API_URL}/../storage/profile_photos/${cleanPath}`;
}

export default function AdminAgentsPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale === "fr" ? "fr" : "en";
  const withLocale = (path: string) => `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AgentStatus>("all");
  const [detailModal, setDetailModal] = useState<DetailModalData>({
    agent: null,
    isOpen: false,
  });
  const [deleteAgentId, setDeleteAgentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusChangeData, setStatusChangeData] = useState<{
    agentId: string | null;
    newStatus: AgentStatus;
  }>({
    agentId: null,
    newStatus: "pending",
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusReason, setStatusReason] = useState("");

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const response = await agentService.getAllAgents();
      console.log("Fetched agents response:", response);
      
      setAgents(Array.isArray(response) ? response : []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch agents"
      );
      console.error("Error fetching agents:", error);
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleDeleteAgent = async () => {
    if (!deleteAgentId) return;

    try {
      setIsDeleting(true);
      await agentService.deleteAgent(deleteAgentId);
      toast.success("Agent deleted successfully");
      setDeleteAgentId(null);
      await fetchAgents();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete agent"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusChangeData.agentId) return;
    if (statusChangeData.newStatus === "rejected" && !statusReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      await agentService.updateAgentStatus(
        statusChangeData.agentId,
        statusChangeData.newStatus,
        statusReason.trim() || undefined
      );
      toast.success("Agent status updated successfully");
      setStatusDialogOpen(false);
      setStatusReason("");
      setDetailModal({ agent: null, isOpen: false });
      await fetchAgents();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update agent status"
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: AgentStatus) => {
    const variants: Record<AgentStatus, "destructive" | "default" | "secondary"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };

    const labels: Record<AgentStatus, string> = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    };

    const icons: Record<AgentStatus, typeof Clock> = {
      pending: Clock,
      approved: CheckCircle2,
      rejected: XCircle,
    };

    const Icon = icons[status];

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {labels[status]}
      </Badge>
    );
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      !searchQuery ||
      agent.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.id_card_num.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || agent.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = agents.filter((a) => a.status === "pending").length;
  const approvedCount = agents.filter((a) => a.status === "approved").length;

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
              <p className="text-muted-foreground">Manage all property agents</p>
            </div>
          </div>
          <Button onClick={() => router.push(withLocale("/admin/agents/new"))}>
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.length}</div>
              <p className="text-xs text-muted-foreground">All registered agents</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">Active agents</p>
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
              placeholder="Search by name, email, or ID number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as "all" | AgentStatus)
              }
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Agents Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Agents</CardTitle>
            <CardDescription>
              {filteredAgents.length} {filteredAgents.length === 1 ? 'agent' : 'agents'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableLoader rows={10} columns={8} />
            ) : filteredAgents.length === 0 ? (
              <Alert>
                <AlertDescription>
                  {agents.length === 0 
                    ? "No agents found. Start by adding your first agent." 
                    : "No agents match your search criteria."}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>ID Card</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage 
                                src={agent.profile_photo ? getProfilePhotoUrl(agent.profile_photo) : undefined} 
                                alt={agent.user?.name} 
                              />
                              <AvatarFallback>
                                {getUserInitials(agent.user?.name || "NA")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{agent.user?.name || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {agent.user?.email || "N/A"}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {agent.id_card_num}
                        </TableCell>
                        <TableCell className="text-sm">
                          {agent.city}, {agent.region}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(agent.status)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(agent.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setDetailModal({
                                  agent,
                                  isOpen: true,
                                })
                              }
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(withLocale(`/admin/agents/${agent.id}/edit`))}
                              title="Edit agent"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteAgentId(String(agent.id))}
                              title="Delete"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
        onOpenChange={(isOpen) =>
          setDetailModal({ ...detailModal, isOpen })
        }
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailModal.agent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={detailModal.agent.profile_photo ? getProfilePhotoUrl(detailModal.agent.profile_photo) : undefined} 
                      alt={detailModal.agent.user?.name} 
                    />
                    <AvatarFallback className="text-lg">
                      {getUserInitials(detailModal.agent.user?.name || "NA")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{detailModal.agent.user?.name}</DialogTitle>
                    <DialogDescription>
                      Agent Profile Details
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* User Information */}
                <div>
                  <h3 className="font-semibold mb-3">User Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{detailModal.agent.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{detailModal.agent.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{detailModal.agent.user?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium capitalize">{detailModal.agent.user?.gender}</p>
                    </div>
                  </div>
                </div>

                {/* Agent Profile */}
                <div>
                  <h3 className="font-semibold mb-3">Agent Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="mt-1">
                        {getStatusBadge(detailModal.agent.status)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ID Card Number</p>
                      <p className="font-mono text-sm">{detailModal.agent.id_card_num}</p>
                    </div>
                    {detailModal.agent.bio && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Bio</p>
                        <p className="text-sm">{detailModal.agent.bio}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="font-semibold mb-3">Location</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Country</p>
                      <p className="font-medium">{detailModal.agent.country}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Region</p>
                      <p className="font-medium">{detailModal.agent.region}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">City</p>
                      <p className="font-medium">{detailModal.agent.city}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{detailModal.agent.address}</p>
                    </div>
                  </div>
                </div>

                {/* ID Documents */}
                <div>
                  <h3 className="font-semibold mb-3">ID Documents</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Front of ID</p>
                      <img
                        src={getIdImageUrl(detailModal.agent.id_image_front)}
                        alt="ID Front"
                        className="w-full h-48 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23ddd" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" font-size="14" text-anchor="middle" dy=".3em" fill="%23999"%3EImage not available%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Back of ID</p>
                      <img
                        src={getIdImageUrl(detailModal.agent.id_image_back)}
                        alt="ID Back"
                        className="w-full h-48 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23ddd" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" font-size="14" text-anchor="middle" dy=".3em" fill="%23999"%3EImage not available%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="text-xs text-muted-foreground">
                  <p>Created: {new Date(detailModal.agent.created_at).toLocaleString()}</p>
                  <p>Updated: {new Date(detailModal.agent.updated_at).toLocaleString()}</p>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const id = detailModal.agent!.id;
                    setDetailModal({ agent: null, isOpen: false });
                    router.push(withLocale(`/admin/agents/${id}/edit`));
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Agent
                </Button>
                {detailModal.agent.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStatusChangeData({
                          agentId: String(detailModal.agent!.id),
                          newStatus: "rejected",
                        });
                        setStatusReason("");
                        setStatusDialogOpen(true);
                      }}
                      className="text-red-600"
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        setStatusChangeData({
                          agentId: String(detailModal.agent!.id),
                          newStatus: "approved",
                        });
                        setStatusReason("");
                        setStatusDialogOpen(true);
                      }}
                    >
                      Approve
                    </Button>
                  </>
                )}
                {detailModal.agent.status !== "pending" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusChangeData({
                        agentId: String(detailModal.agent!.id),
                        newStatus: "pending",
                      });
                      setStatusReason("");
                      setStatusDialogOpen(true);
                    }}
                  >
                    Reset to Pending
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteAgentId}
        onOpenChange={(isOpen) => !isOpen && setDeleteAgentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this agent? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Agent Status</DialogTitle>
            <DialogDescription>
              Change the approval status for this agent
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">New Status</p>
              <Select
                value={statusChangeData.newStatus}
                onValueChange={(value) =>
                  setStatusChangeData({
                    ...statusChangeData,
                    newStatus: value as AgentStatus,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {statusChangeData.newStatus === "rejected" && (
              <div className="space-y-2">
                <Label htmlFor="status-reason">Rejection Reason</Label>
                <Textarea
                  id="status-reason"
                  value={statusReason}
                  onChange={(event) => setStatusReason(event.target.value)}
                  placeholder="Enter rejection reason..."
                  rows={4}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
