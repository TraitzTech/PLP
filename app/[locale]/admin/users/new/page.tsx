"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from 'sonner';
import { userManagementService } from "@/services/userManagementService";
import type { UserCreateRequest } from "@/services/types";
import UserForm from "@/components/admin/user-form";

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: UserCreateRequest) => {
    try {
      setIsLoading(true);
      await userManagementService.createUser(data);
      toast.success("User created successfully");
      router.push("/admin/users");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create user"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
            <p className="text-muted-foreground">Add a new user to the system</p>
          </div>
        </div>

        <UserForm
          mode="create"
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
