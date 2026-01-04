"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { toast } from 'sonner';
import { facilitiesService } from "@/services/facilitiesService";
import { TableLoader } from "@/components/ui/shimmer-loaders";
import { Plus, Edit, Trash2, MoreHorizontal, Loader2, Zap } from "lucide-react";
import type { Facility } from "@/services/types";

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [deleteFacilityId, setDeleteFacilityId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    slug: "",
    status: true,
  });

  const fetchFacilities = async () => {
    try {
      setIsLoading(true);
      const data = await facilitiesService.getAllFacilities();
      console.log("Fetched facilities:", data);
      // The API returns the array directly
      setFacilities(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error fetching facilities:", error);
      toast.error("Failed to fetch facilities");
      setFacilities([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleOpenDialog = (facility?: Facility) => {
    if (facility) {
      setEditingFacility(facility);
      setFormData({
        name: facility.name,
        icon: facility.icon || "",
        slug: facility.slug,
        status: facility.status === 1,
      });
    } else {
      setEditingFacility(null);
      setFormData({
        name: "",
        icon: "",
        slug: "",
        status: true,
      });
    }
    setIsDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (value: string) => {
    setFormData({
      ...formData,
      name: value,
      slug: generateSlug(value),
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Facility name is required");
      return;
    }

    try {
      setIsSaving(true);
      if (editingFacility) {
        await facilitiesService.updateFacility(editingFacility.id, formData);
        toast.success("Facility updated successfully");
      } else {
        await facilitiesService.createFacility(formData);
        toast.success("Facility created successfully");
      }
      setIsDialogOpen(false);
      fetchFacilities();
    } catch (error: any) {
      console.error("Error saving facility:", error);
      toast.error(
        error.response?.data?.message || "Failed to save facility"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteFacilityId) return;

    try {
      setIsDeleting(true);
      await facilitiesService.deleteFacility(deleteFacilityId);
      toast.success("Facility deleted successfully");
      setDeleteFacilityId(null);
      fetchFacilities();
    } catch (error: any) {
      console.error("Error deleting facility:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete facility"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Facilities</h1>
            <p className="text-muted-foreground">
              Manage property facilities and amenities
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Facility
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingFacility ? "Edit Facility" : "Create Facility"}
                </DialogTitle>
                <DialogDescription>
                  {editingFacility
                    ? "Update the facility details"
                    : "Add a new facility to the system"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    placeholder="e.g., WiFi, Swimming Pool, etc."
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Icon (Icon Name/Class)</label>
                  <Input
                    placeholder="e.g., wifi, swimming-pool, etc."
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Slug</label>
                  <Input
                    placeholder="Auto-generated from name"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.checked })
                    }
                    id="status"
                  />
                  <label htmlFor="status" className="text-sm font-medium cursor-pointer">
                    Active
                  </label>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              All Facilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <TableLoader rows={8} columns={5} />
            ) : facilities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No facilities found</p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Slug</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Icon</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facilities.map((facility) => (
                        <tr key={facility.id} className="border-t hover:bg-muted/50">
                          <td className="px-6 py-4 font-medium text-sm">{facility.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{facility.slug}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {facility.icon || "—"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {facility.status === 1 ? (
                              <Badge className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
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
                                  onClick={() => handleOpenDialog(facility)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteFacilityId(String(facility.id))}
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
        open={deleteFacilityId !== null}
        onOpenChange={(open) => !open && setDeleteFacilityId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the facility.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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