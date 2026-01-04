"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2,
  Check,
  X,
  Star,
} from "lucide-react";
import { toast } from 'sonner';
import { propertyManagementService } from "@/services/propertyManagementService";
import { TableLoader } from "@/components/ui/shimmer-loaders";
import type { AdminProperty } from "@/services/types";

export default function AdminPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actioningPropertyId, setActioningPropertyId] = useState<string | null>(null);
  
  // Approval dialog state
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalPropertyId, setApprovalPropertyId] = useState<string | null>(null);
  const [approvalReason, setApprovalReason] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [approvalType, setApprovalType] = useState<"approve" | "reject">("approve");

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        per_page: 15,
        page: currentPage,
      };

      if (approvalFilter !== "all") {
        params.is_approved = approvalFilter === "approved";
      }

      const response = await propertyManagementService.getAllProperties(params);
      setProperties(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (error: any) {
      console.error("Error fetching properties:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch properties"
      );
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [currentPage, approvalFilter]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDeleteProperty = async () => {
    if (!deletePropertyId) return;

    try {
      setIsDeleting(true);
      await propertyManagementService.deleteProperty(deletePropertyId);
      toast.success("Property deleted successfully");
      setDeletePropertyId(null);
      fetchProperties();
    } catch (error: any) {
      console.error("Error deleting property:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete property"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFeatured = async (propertyId: string | number) => {
    try {
      setActioningPropertyId(String(propertyId));
      await propertyManagementService.toggleFeaturedStatus(propertyId);
      toast.success("Featured status updated");
      fetchProperties();
    } catch (error: any) {
      console.error("Error toggling featured status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update featured status"
      );
    } finally {
      setActioningPropertyId(null);
    }
  };

  const handleApproval = (propertyId: string | number, type: "approve" | "reject") => {
    setApprovalPropertyId(String(propertyId));
    setApprovalType(type);
    setApprovalReason("");
    setApprovalDialogOpen(true);
  };

  const handleConfirmApproval = async () => {
    if (!approvalPropertyId) return;

    // For rejection, reason is required
    if (approvalType === "reject" && !approvalReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setIsApproving(true);
      console.log("Sending approval request:", {
        id: approvalPropertyId,
        is_approved: approvalType === "approve",
        reason: approvalReason || (approvalType === "approve" ? "Approved by admin" : "Rejected by admin"),
      });

      await propertyManagementService.updateApprovalStatus(approvalPropertyId, {
        is_approved: approvalType === "approve",
        reason: approvalReason || (approvalType === "approve" ? "Approved by admin" : "Rejected by admin"),
      });

      toast.success(
        approvalType === "approve"
          ? "Property approved successfully"
          : "Property rejected successfully"
      );

      setApprovalDialogOpen(false);
      setApprovalPropertyId(null);
      setApprovalReason("");
      fetchProperties();
    } catch (error: any) {
      console.error("Error updating approval status:", error);
      console.error("Error response:", error.response);
      toast.error(
        error.response?.data?.message || 
        `Failed to ${approvalType} property. Error: ${error.message}`
      );
    } finally {
      setIsApproving(false);
    }
  };

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "destructive" | "default" | "secondary"> = {
      available: "default",
      unavailable: "destructive",
      pending: "secondary",
      sold: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Property Management</h1>
            <p className="text-muted-foreground">
              Manage all properties in the system
            </p>
          </div>
          <Button onClick={() => router.push("/admin/properties/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              All Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-8"
                />
              </div>
              <Button onClick={handleSearch} variant="secondary">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Approval Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <TableLoader rows={10} columns={9} />
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No properties found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <>
                <div className="border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Agent</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Location</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Price</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Approval</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Featured</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Available</th>
                          <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProperties.map((property) => (
                          <tr key={property.id} className="border-t hover:bg-muted/50">
                            <td className="px-6 py-4 font-medium text-sm">{property.title}</td>
                            <td className="px-6 py-4 text-sm">
                              {property.agent?.user.name || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm">{property.location}</td>
                            <td className="px-6 py-4 text-sm font-semibold">{property.price} XAF</td>
                            <td className="px-6 py-4 text-sm">
                              {getStatusBadge(property.status === "1" || property.status === "available" ? "Available" : "Unavailable")}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {property.is_approved ? (
                                <Badge className="bg-green-500">Approved</Badge>
                              ) : (
                                <Badge variant="destructive">Pending</Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {property.is_featured ? (
                                <Badge className="bg-yellow-500">Featured</Badge>
                              ) : (
                                <Badge variant="secondary">Regular</Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {property.is_available ? (
                                <Badge className="bg-blue-500">Available</Badge>
                              ) : (
                                <Badge variant="secondary">Unavailable</Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/admin/properties/${property.id}`)
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                  {!property.is_approved && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handleApproval(property.id, "approve")}
                                        disabled={actioningPropertyId === String(property.id)}
                                      >
                                        <Check className="mr-2 h-4 w-4" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleApproval(property.id, "reject")}
                                        disabled={actioningPropertyId === String(property.id)}
                                      >
                                        <X className="mr-2 h-4 w-4" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleToggleFeatured(property.id)}
                                    disabled={actioningPropertyId === String(property.id)}
                                  >
                                    <Star className="mr-2 h-4 w-4" />
                                    {property.is_featured ? "Unfeature" : "Feature"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setDeletePropertyId(String(property.id))}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || isLoading}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages || isLoading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletePropertyId !== null}
        onOpenChange={(open) => !open && setDeletePropertyId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property
              and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProperty}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approvalType === "approve" ? "Approve Property" : "Reject Property"}
            </DialogTitle>
            <DialogDescription>
              {approvalType === "approve"
                ? "This property will be approved and become visible to customers."
                : "Please provide a reason for rejecting this property."}
            </DialogDescription>
          </DialogHeader>

          {approvalType === "reject" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason for Rejection *</Label>
                <Textarea
                  id="reason"
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  placeholder="Enter the reason for rejection (this may be sent to the agent)..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmApproval}
              disabled={isApproving}
              className={approvalType === "reject" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {approvalType === "approve" ? "Approving..." : "Rejecting..."}
                </>
              ) : approvalType === "approve" ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Approve Property
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Reject Property
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
