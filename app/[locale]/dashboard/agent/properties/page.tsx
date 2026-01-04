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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from 'sonner';
import { listingService } from "@/services/listingService";
import { TableLoader } from "@/components/ui/shimmer-loaders";
import type { Listing } from "@/services/types";

export default function AgentPropertiesPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteListingId, setDeleteListingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await listingService.getAllListings({
        per_page: 15,
        page: currentPage,
      });
      console.log("Raw response:", response);
      
      // Handle both possible response structures
      const listingsData = response?.data || response;
      setListings(Array.isArray(listingsData) ? listingsData : []);
    } catch (error: any) {
      console.error("Error fetching listings:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch listings"
      );
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchListings();
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDeleteListing = async () => {
    if (!deleteListingId) return;

    try {
      setIsDeleting(true);
      await listingService.deleteListing(deleteListingId);
      toast.success("Listing deleted successfully");
      setDeleteListingId(null);
      fetchListings();
    } catch (error: any) {
      console.error("Error deleting listing:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete listing"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredListings = listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string | number | boolean) => {
    const statusStr = String(status).toLowerCase();
    const isAvailable = statusStr === "1" || statusStr === "available" || statusStr === "true";

    return (
      <Badge variant={isAvailable ? "default" : "destructive"}>
        {isAvailable ? "Available" : "Unavailable"}
      </Badge>
    );
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(price));
  };

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
            <p className="text-muted-foreground">
              Manage your property listings
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard/agent/properties/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Listing
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              All Listings ({filteredListings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings..."
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
            </div>

            {isLoading ? (
              <TableLoader rows={10} columns={7} />
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No listings found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Create your first listing to get started"}
                </p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Location</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Type</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Price</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Featured</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Approved</th>
                        <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredListings.map((listing) => (
                        <tr key={listing.id} className="border-t hover:bg-muted/50">
                          <td className="px-6 py-4 font-medium text-sm">{listing.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {listing.city}, {listing.region}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {listing.property_type?.name || "—"}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold">
                            {formatPrice(listing.price)} XAF
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {getStatusBadge(listing.status)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {listing.is_featured ? (
                              <Badge className="bg-yellow-500">Featured</Badge>
                            ) : (
                              <Badge variant="secondary">Regular</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {listing.is_approved ? (
                              <Badge className="bg-green-500">Approved</Badge>
                            ) : (
                              <Badge variant="destructive">Pending</Badge>
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
                                    router.push(
                                      `/dashboard/agent/properties/${listing.id}`
                                    )
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/agent/properties/${listing.id}/edit`
                                    )
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteListingId(String(listing.id))}
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteListingId !== null}
        onOpenChange={(open) => !open && setDeleteListingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the listing
              and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteListing}
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
    </DashboardLayout>
  );
}