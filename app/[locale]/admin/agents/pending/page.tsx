"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Clock, CheckCircle2, ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";
import { agentService } from "@/services/agentService";
import type { Agent } from "@/services/types";

interface DetailModalData {
  agent: Agent | null;
  isOpen: boolean;
}

export default function PendingAgentsPage() {
  const router = useRouter();
  const [pendingAgents, setPendingAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailModal, setDetailModal] = useState<DetailModalData>({
    agent: null,
    isOpen: false,
  });
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const fetchPendingAgents = async () => {
    try {
      setIsLoading(true);
      const response = await agentService.getPendingAgents();
      setPendingAgents(response.data || []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch pending agents"
      );
      console.error("Error fetching pending agents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAgents();
  }, []);

  const handleApprove = async (agentId: string | number) => {
    try {
      setApprovingId(String(agentId));
      await agentService.updateAgentStatus(agentId, "approved");
      toast.success("Agent approved successfully");
      setDetailModal({ agent: null, isOpen: false });
      await fetchPendingAgents();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to approve agent"
      );
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (agentId: string | number) => {
    try {
      setRejectingId(String(agentId));
      await agentService.updateAgentStatus(agentId, "rejected");
      toast.success("Agent rejected");
      setDetailModal({ agent: null, isOpen: false });
      await fetchPendingAgents();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to reject agent"
      );
    } finally {
      setRejectingId(null);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pending Agent Approvals</h1>
            <p className="text-muted-foreground">Review and approve new agent registrations</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pendingAgents.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">No Pending Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  All agent registration applications have been reviewed!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{pendingAgents.length}</div>
                  <p className="text-xs text-muted-foreground">Awaiting your action</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">View all agents</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    size="sm"
                    onClick={() => router.push("/admin/agents")}
                    variant="outline"
                  >
                    View All Agents
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Pending Agents List */}
            <div className="grid gap-4">
              {pendingAgents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">
                            {agent.user?.name}
                          </CardTitle>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">
                          {agent.user?.email}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailModal({ agent, isOpen: true })}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">ID Card</p>
                        <p className="font-mono">{agent.id_card_num}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p>{agent.city}, {agent.region}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p>{agent.user?.phone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Applied</p>
                        <p>{new Date(agent.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
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
                <DialogTitle>{detailModal.agent.user?.name}</DialogTitle>
                <DialogDescription>
                  Agent Registration Details
                </DialogDescription>
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
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Front of ID</p>
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/../storage/${detailModal.agent.id_image_front}`}
                        alt="ID Front"
                        className="max-h-48 rounded border"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Back of ID</p>
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/../storage/${detailModal.agent.id_image_back}`}
                        alt="ID Back"
                        className="max-h-48 rounded border"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Photo */}
                {detailModal.agent.profile_photo && (
                  <div>
                    <h3 className="font-semibold mb-3">Profile Photo</h3>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/../storage/${detailModal.agent.profile_photo}`}
                      alt="Profile"
                      className="max-h-48 rounded border"
                    />
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-xs text-muted-foreground">
                  <p>Applied: {new Date(detailModal.agent.created_at).toLocaleString()}</p>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    handleReject(detailModal.agent!.id)
                  }
                  disabled={rejectingId === String(detailModal.agent.id)}
                  className="text-red-600"
                >
                  {rejectingId === String(detailModal.agent.id) ? "Rejecting..." : "Reject"}
                </Button>
                <Button
                  onClick={() =>
                    handleApprove(detailModal.agent!.id)
                  }
                  disabled={approvingId === String(detailModal.agent.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {approvingId === String(detailModal.agent.id) ? "Approving..." : "Approve"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
