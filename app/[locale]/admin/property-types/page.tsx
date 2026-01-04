"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { propertyTypeService } from "@/services/propertyTypeService";
import { TableLoader } from "@/components/ui/shimmer-loaders";
import { Plus, Edit, Trash2, MoreHorizontal, Loader2, Layout } from "lucide-react";
import type { PropertyType } from "@/services/types";

export default function PropertyTypesPage() {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<PropertyType | null>(null);
  const [deleteTypeId, setDeleteTypeId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: true,
  });

  const fetchPropertyTypes = async () => {
    try {
      setIsLoading(true);
      const data = await propertyTypeService.getAllPropertyTypes();
      console.log("Property types data:", data);
      // API returns array directly
      setPropertyTypes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error fetching property types:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch property types"
      );
      setPropertyTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyTypes();
  }, []);

  const handleOpenDialog = (type?: PropertyType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        description: type.description || "",
        status: type.status === 1,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        description: "",
        status: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Property type name is required");
      return;
    }

    try {
      setIsSaving(true);
      if (editingType) {
        await propertyTypeService.updatePropertyType(editingType.id, formData);
        toast.success("Property type updated successfully");
      } else {
        await propertyTypeService.createPropertyType(formData);
        toast.success("Property type created successfully");
      }
      setIsDialogOpen(false);
      fetchPropertyTypes();
    } catch (error: any) {
      console.error("Error saving property type:", error);
      toast.error(
        error.response?.data?.message || "Failed to save property type"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTypeId) return;

    try {
      setIsDeleting(true);
      await propertyTypeService.deletePropertyType(deleteTypeId);
      toast.success("Property type deleted successfully");
      setDeleteTypeId(null);
      fetchPropertyTypes();
    } catch (error: any) {
      console.error("Error deleting property type:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete property type"
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
            <h1 className="text-3xl font-bold tracking-tight">Property Types</h1>
            <p className="text-muted-foreground">
              Manage property types for listings
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Property Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingType ? "Edit Property Type" : "Create Property Type"}
                </DialogTitle>
                <DialogDescription>
                  {editingType
                    ? "Update the property type details"
                    : "Add a new property type to the system"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    placeholder="e.g., Apartment, Villa, etc."
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
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
              <Layout className="h-5 w-5" />
              All Property Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <TableLoader rows={5} columns={5} />
            ) : propertyTypes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No property types found</p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Description</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Created</th>
                        <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertyTypes.map((type) => (
                        <tr key={type.id} className="border-t hover:bg-muted/50">
                          <td className="px-6 py-4 font-medium text-sm">{type.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {type.description || "—"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {type.status === 1 ? (
                              <Badge className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {new Date(type.created_at || "").toLocaleDateString()}
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
                                  onClick={() => handleOpenDialog(type)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteTypeId(String(type.id))}
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
        open={deleteTypeId !== null}
        onOpenChange={(open) => !open && setDeleteTypeId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property type.
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