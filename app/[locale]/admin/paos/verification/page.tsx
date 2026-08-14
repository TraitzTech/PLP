"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Loader2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ImageIcon,
  MapPin,
  BedDouble,
  Bath,
} from "lucide-react";
import { toast } from "sonner";
import { adminPaoService } from "@/services/adminPaoService";
import { TableLoader } from "@/components/ui/shimmer-loaders";
import {
  resolveListingImageObjectSrc,
  resolveListingImageSrc,
} from "@/lib/listingMedia";
import type { PaoProperty, VerificationStatus } from "@/services/types";
import {
  VERIFICATION_STATUS_META,
  formatDate,
  formatXAF,
  getApiErrorMessage,
} from "../pao-utils";

type TabValue = "all" | VerificationStatus;

const TABS: { value: TabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "needs_correction", label: "Needs Correction" },
  { value: "rejected", label: "Rejected" },
];

const IMAGE_FALLBACK =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="16" text-anchor="middle" dy=".3em" fill="%23999"%3EImage not available%3C/text%3E%3C/svg%3E';

function VerificationBadge({ status }: { status: VerificationStatus }) {
  const meta = VERIFICATION_STATUS_META[status] || VERIFICATION_STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={`flex items-center gap-1 w-fit ${meta.className}`}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}

export default function PaoVerificationQueuePage() {
  const router = useRouter();

  const [properties, setProperties] = useState<PaoProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Review dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PaoProperty | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [pendingAction, setPendingAction] = useState<"needs_correction" | "rejected" | null>(null);
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState<VerificationStatus | null>(null);

  const fetchQueue = async () => {
    try {
      setIsLoading(true);
      const response = await adminPaoService.getVerificationQueue();
      setProperties(Array.isArray(response) ? response : []);
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "Failed to fetch verification queue"));
      console.error("Error fetching verification queue:", error);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const counts = useMemo(() => {
    const base: Record<TabValue, number> = {
      all: properties.length,
      pending: 0,
      verified: 0,
      needs_correction: 0,
      rejected: 0,
    };
    properties.forEach((property) => {
      if (property.verification_status && base[property.verification_status] !== undefined) {
        base[property.verification_status] += 1;
      }
    });
    return base;
  }, [properties]);

  const filteredProperties = properties.filter((property) => {
    const matchesTab = activeTab === "all" || property.verification_status === activeTab;

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      property.title?.toLowerCase().includes(query) ||
      property.city?.toLowerCase().includes(query) ||
      property.location?.toLowerCase().includes(query) ||
      property.pao?.staff_code?.toLowerCase().includes(query) ||
      property.pao?.user?.name?.toLowerCase().includes(query) ||
      property.landlord?.name?.toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  const openReview = async (property: PaoProperty) => {
    setSelectedProperty(property);
    setIsDialogOpen(true);
    setPendingAction(null);
    setNotes("");
    setNotesError("");

    // Pull the full record (images, landlord, PAO relations) for the review panel.
    try {
      setIsLoadingDetail(true);
      const detail = await adminPaoService.getVerificationDetail(property.id);
      if (detail) {
        setSelectedProperty(detail);
      }
    } catch (error: any) {
      console.error("Error fetching verification detail:", error);
      toast.error(getApiErrorMessage(error, "Failed to load full property details"));
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedProperty(null);
    setPendingAction(null);
    setNotes("");
    setNotesError("");
  };

  const submitDecision = async (status: VerificationStatus) => {
    if (!selectedProperty) return;

    const requiresNotes = status === "needs_correction" || status === "rejected";
    const trimmedNotes = notes.trim();

    if (requiresNotes && !trimmedNotes) {
      setNotesError(
        status === "rejected"
          ? "A rejection reason is required"
          : "Explain what the PAO needs to correct"
      );
      toast.error("Please provide notes for this decision");
      return;
    }

    try {
      setSubmittingStatus(status);
      await adminPaoService.updateVerificationStatus(
        selectedProperty.id,
        status,
        requiresNotes ? trimmedNotes : undefined
      );

      toast.success(
        status === "verified"
          ? "Property verified and published"
          : status === "needs_correction"
          ? "Sent back to the PAO for correction"
          : "Property rejected"
      );
      closeDialog();
      await fetchQueue();
    } catch (error: any) {
      console.error("Error updating verification status:", error);
      // Surfaces the backend 422 (e.g. "notes required") when client validation is bypassed.
      const message = getApiErrorMessage(error, "Failed to update verification status");
      if (error?.response?.status === 422) {
        setNotesError(message);
      }
      toast.error(message);
    } finally {
      setSubmittingStatus(null);
    }
  };

  const isSubmitting = submittingStatus !== null;
  const detailImages = selectedProperty?.images || [];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Property Verification Queue</h1>
            <p className="text-muted-foreground">
              Review PAO-submitted properties before they go live on the public site
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting your action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{counts.verified}</div>
              <p className="text-xs text-muted-foreground">Live on the platform</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Needs Correction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{counts.needs_correction}</div>
              <p className="text-xs text-muted-foreground">Returned to PAOs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
              <p className="text-xs text-muted-foreground">Declined submissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs + Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter & Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
              <TabsList className="flex flex-wrap h-auto">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({counts[tab.value]})
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Input
              placeholder="Search by property, city, landlord or PAO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Queue table */}
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>
              {filteredProperties.length}{" "}
              {filteredProperties.length === 1 ? "property" : "properties"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableLoader rows={8} columns={7} />
            ) : filteredProperties.length === 0 ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  {properties.length === 0
                    ? "No PAO property submissions yet."
                    : "No properties match the current filter."}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Photo</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Landlord</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => {
                      const thumbnail = resolveListingImageSrc(property);
                      return (
                        <TableRow
                          key={property.id}
                          className="cursor-pointer"
                          onClick={() => openReview(property)}
                        >
                          <TableCell>
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={property.title}
                                className="h-12 w-16 object-cover rounded border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = IMAGE_FALLBACK;
                                }}
                              />
                            ) : (
                              <div className="h-12 w-16 rounded border flex items-center justify-center bg-muted">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{property.title || "Untitled property"}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {[property.location, property.city, property.region]
                                .filter(Boolean)
                                .join(", ") || "No location"}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm">
                            <p className="font-medium">{property.pao?.user?.name || "—"}</p>
                            <p className="text-xs font-mono text-muted-foreground">
                              {property.pao?.staff_code || "—"}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm">
                            <p>{property.landlord?.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">
                              {property.landlord?.phone || ""}
                            </p>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {formatXAF(property.price)}
                          </TableCell>
                          <TableCell>
                            <VerificationBadge status={property.verification_status} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(property.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openReview(property);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
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

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : closeDialog())}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProperty && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedProperty.title || "Untitled property"}
                  <VerificationBadge status={selectedProperty.verification_status} />
                </DialogTitle>
                <DialogDescription>
                  Submitted {formatDate(selectedProperty.created_at)} by{" "}
                  {selectedProperty.pao?.user?.name || "unknown PAO"}
                  {selectedProperty.pao?.staff_code
                    ? ` (${selectedProperty.pao.staff_code})`
                    : ""}
                </DialogDescription>
              </DialogHeader>

              {isLoadingDetail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading full details...
                </div>
              )}

              <div className="space-y-6">
                {/* Images */}
                {detailImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {detailImages.map((image) => (
                      <img
                        key={image.id}
                        src={resolveListingImageObjectSrc(image) || IMAGE_FALLBACK}
                        alt={image.alt_text || selectedProperty.title}
                        className="w-full h-32 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = IMAGE_FALLBACK;
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <ImageIcon className="h-4 w-4" />
                    <AlertDescription>
                      No photos were submitted with this property.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Property details */}
                <div>
                  <h3 className="font-semibold mb-3">Property Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p className="font-medium">{formatXAF(selectedProperty.price)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Region</p>
                      <p className="font-medium">{selectedProperty.region || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">City</p>
                      <p className="font-medium">{selectedProperty.city || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedProperty.location || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bedrooms</p>
                      <p className="font-medium flex items-center gap-1">
                        <BedDouble className="h-3 w-3 text-muted-foreground" />
                        {selectedProperty.bedrooms ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bathrooms</p>
                      <p className="font-medium flex items-center gap-1">
                        <Bath className="h-3 w-3 text-muted-foreground" />
                        {selectedProperty.bathrooms ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Purpose</p>
                      <p className="font-medium">
                        {[
                          selectedProperty.for_rent ? "For rent" : null,
                          selectedProperty.for_purchase ? "For sale" : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Property Type</p>
                      <p className="font-medium">
                        {selectedProperty.property_type?.name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Address</p>
                      <p className="font-medium">{selectedProperty.address || "—"}</p>
                    </div>
                    {selectedProperty.description && (
                      <div className="col-span-2 md:col-span-3">
                        <p className="text-muted-foreground">Description</p>
                        <p>{selectedProperty.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Landlord */}
                <div>
                  <h3 className="font-semibold mb-3">Landlord</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedProperty.landlord?.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedProperty.landlord?.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedProperty.landlord?.email || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Contact Verified</p>
                      <p className="font-medium">
                        {selectedProperty.landlord?.contact_verified ? "Yes" : "No"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Landlord Location</p>
                      <p className="font-medium">
                        {[
                          selectedProperty.landlord?.location,
                          selectedProperty.landlord?.city,
                          selectedProperty.landlord?.region,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Previous review notes */}
                {selectedProperty.verification_notes && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <span className="font-medium">Previous review notes: </span>
                      {selectedProperty.verification_notes}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Review action panel */}
                <div className="rounded-lg border p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold">Review Decision</h3>
                    <p className="text-sm text-muted-foreground">
                      Verifying publishes this property to the public site and awards the PAO's
                      verification bonus.
                    </p>
                  </div>

                  {pendingAction && (
                    <div className="space-y-2">
                      <Label htmlFor="verification-notes">
                        {pendingAction === "rejected"
                          ? "Rejection Reason"
                          : "Correction Instructions"}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="verification-notes"
                        value={notes}
                        onChange={(e) => {
                          setNotes(e.target.value);
                          if (notesError) setNotesError("");
                        }}
                        placeholder={
                          pendingAction === "rejected"
                            ? "Explain why this submission is being rejected..."
                            : "Tell the PAO exactly what to fix and resubmit..."
                        }
                        rows={4}
                      />
                      {notesError && <p className="text-sm text-red-500">{notesError}</p>}
                      <p className="text-xs text-muted-foreground">
                        These notes are sent to the PAO.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-end gap-2">
                    {pendingAction ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setPendingAction(null);
                            setNotes("");
                            setNotesError("");
                          }}
                          disabled={isSubmitting}
                        >
                          Back
                        </Button>
                        <Button
                          onClick={() => submitDecision(pendingAction)}
                          disabled={isSubmitting}
                          className={
                            pendingAction === "rejected"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-amber-500 hover:bg-amber-600 text-white"
                          }
                        >
                          {submittingStatus === pendingAction ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : pendingAction === "rejected" ? (
                            "Confirm Rejection"
                          ) : (
                            "Send for Correction"
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setPendingAction("rejected");
                            setNotes("");
                            setNotesError("");
                          }}
                          disabled={isSubmitting}
                          className="text-red-600"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setPendingAction("needs_correction");
                            setNotes("");
                            setNotesError("");
                          }}
                          disabled={isSubmitting}
                          className="text-amber-600 border-amber-300"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Needs Correction
                        </Button>
                        <Button
                          onClick={() => submitDecision("verified")}
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {submittingStatus === "verified" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Verify
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
