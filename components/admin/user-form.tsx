"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import type { User, UserCreateRequest, UserUpdateRequest } from "@/services/types";
import PasswordGenerator from "./password-generator";

interface UserFormProps {
  user?: User;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  mode: "create" | "edit";
}

type FormData = {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: "male" | "female" | "other";
  user_type: "customer" | "agent" | "admin";
  email_verified_at: boolean;
};

export default function UserForm({
  user,
  onSubmit,
  isLoading = false,
  mode,
}: UserFormProps) {
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      phone: user?.phone || "",
      gender: user?.gender || "male",
      // This form only manages customer/agent/admin accounts — PAO accounts
      // are created/edited via the dedicated Manage PAOs screens.
      user_type: (user?.user_type === "agent" || user?.user_type === "admin"
        ? user.user_type
        : "customer"),
      email_verified_at: !!user?.email_verified_at || false,
    },
  });

  const selectedGender = watch("gender");
  const selectedUserType = watch("user_type");
  const emailVerified = watch("email_verified_at");

  const handleFormSubmit = async (data: FormData) => {
    try {
      setError("");
      
      // For edit mode, only include password if it's not empty
      if (mode === "edit" && !data.password) {
        const { password, ...dataWithoutPassword } = data;
        await onSubmit(dataWithoutPassword);
      } else {
        await onSubmit(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  const handlePasswordGenerated = (password: string) => {
    setGeneratedPassword(password);
    setValue("password", password);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Basic information about the user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Name is required",
                  maxLength: {
                    value: 255,
                    message: "Name must not exceed 255 characters",
                  },
                })}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                  maxLength: {
                    value: 255,
                    message: "Email must not exceed 255 characters",
                  },
                })}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                {...register("phone", {
                  required: "Phone is required",
                  maxLength: {
                    value: 20,
                    message: "Phone must not exceed 20 characters",
                  },
                })}
                placeholder="+1234567890"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">
                Gender <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedGender}
                onValueChange={(value) =>
                  setValue("gender", value as "male" | "female" | "other")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_type">
                User Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedUserType}
                onValueChange={(value) =>
                  setValue(
                    "user_type",
                    value as "customer" | "agent" | "admin"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.user_type && (
                <p className="text-sm text-red-500">
                  {errors.user_type.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="email_verified_at"
                checked={emailVerified}
                onCheckedChange={(checked) =>
                  setValue("email_verified_at", checked as boolean)
                }
              />
              <label
                htmlFor="email_verified_at"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Email Verified
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Password Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                {mode === "create"
                  ? "Set a password for the user"
                  : "Leave blank to keep current password"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password{" "}
                  {mode === "create" && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required:
                        mode === "create" ? "Password is required" : false,
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    placeholder={
                      mode === "create"
                        ? "Enter password or generate one"
                        : "Leave blank to keep current password"
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <PasswordGenerator
            onPasswordGenerated={handlePasswordGenerated}
            initialPassword={generatedPassword}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : (
            <>{mode === "create" ? "Create User" : "Update User"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
