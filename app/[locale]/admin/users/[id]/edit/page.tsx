"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { userManagementService } from "@/services/userManagementService";
import type { User, UserUpdateRequest } from "@/services/types";
import UserForm from "@/components/admin/user-form";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsFetching(true);
        const response = await userManagementService.getUser(params.id as string);
        setUser(response.data);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to fetch user data"
        );
        router.push("/admin/users");
      } finally {
        setIsFetching(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const handleSubmit = async (data: UserUpdateRequest) => {
    try {
      setIsLoading(true);
      await userManagementService.updateUser(params.id as string, data);
      toast.success("User updated successfully");
      router.push("/admin/users");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update user"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
            <p className="text-muted-foreground">Update user information</p>
          </div>
        </div>

        <UserForm
          mode="edit"
          user={user}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
