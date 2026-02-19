"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { AgentSignupForm } from "@/components/auth/agent-signup-form";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { RegisterRequest } from "@/services/types";

interface CustomerSignupData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  user_type: "customer";
}

interface ValidationErrors {
  [key: string]: string;
}

export function SignUpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = (searchParams?.get("type") || "customer") as "customer" | "agent";

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState<CustomerSignupData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    user_type: "customer",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.length > 20) {
      newErrors.phone = "Phone number must be 20 characters or less";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload: RegisterRequest = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone: formData.phone,
        user_type: "customer",
      };

      await authService.register(payload);
      toast.success("Account created successfully! Redirecting to dashboard...");
      
      // Redirect to customer dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Registration failed";
      toast.error(errorMessage);
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // If user type is agent, show the multi-step agent form
  if (userType === "agent") {
    return (
      <AuthGuard redirectAuthenticated>
      <div className="min-h-screen bg-gradient-to-br from-plp-purple via-plp-pink to-plp-yellow py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="absolute top-4 left-4"
          >
            ← Back
          </Button>
        </div>

        <div className="container mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Become a Property Agent
            </h1>
            <p className="text-white/80">
              Join our platform and start listing properties
            </p>
          </div>

          <AgentSignupForm />
        </div>
      </div>
      </AuthGuard>
    );
  }

  // Customer signup form
  return (
    <AuthGuard redirectAuthenticated>
    <div className="min-h-screen bg-gradient-to-br from-plp-purple via-plp-pink to-plp-yellow flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Sign up to start booking properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? "border-red-500" : ""}
                maxLength={20}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password_confirmation">Confirm Password</Label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                placeholder="Confirm your password"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                className={errors.password_confirmation ? "border-red-500" : ""}
              />
              {errors.password_confirmation && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password_confirmation}
                </p>
              )}
            </div>

            <Button className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-plp-purple hover:underline">
                Sign in here
              </Link>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/auth/signup?type=agent")}
            >
              Register as an Agent
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </AuthGuard>
  );
}
