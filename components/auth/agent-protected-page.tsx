"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, getAgentStatus } from "@/lib/agentHelpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

interface AgentProtectedPageProps {
  children: React.ReactNode;
}

export function AgentProtectedPage({ children }: AgentProtectedPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAgentAccess = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const user = await getCurrentUser();

        // If not an agent, deny access
        if (!user || user.user_type !== "agent") {
          setError("Only agents can access this section");
          router.push("/");
          return;
        }

        // Get agent status
        const status = await getAgentStatus();

        if (!status) {
          setError("Unable to verify agent status");
          return;
        }

        setAgentStatus(status);

        // Only allow access if approved
        if (status === "approved") {
          setIsAuthorized(true);
        } else if (status === "pending") {
          setError("Your account is pending admin approval. You'll be notified once it's approved.");
        } else if (status === "rejected") {
          setError("Your agent account has been rejected. Please contact support for more information.");
        }
      } catch (error) {
        console.error("Error checking agent access:", error);
        setError("Unable to verify your access");
      } finally {
        setIsLoading(false);
      }
    };

    checkAgentAccess();
  }, [router]);

  if (isLoading) {
    return (
      <DashboardLayout userType="agent">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthorized || error) {
    return (
      <DashboardLayout userType="agent">
        <div className="max-w-2xl mx-auto">
          {agentStatus === "pending" ? (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-900">
                  <Clock className="h-5 w-5" />
                  Account Pending Approval
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-yellow-300 bg-white">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    {error || "Your agent account is awaiting admin approval."}
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h3 className="font-semibold text-yellow-900">What happens next?</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-yellow-900">
                    <li>Our admin team will review your submitted documents</li>
                    <li>Verification typically takes 24-48 hours</li>
                    <li>You'll receive an email notification once approved</li>
                    <li>Once approved, you can access the agent dashboard and list properties</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => router.push("/")}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    Return to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900">Access Denied</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-red-300 bg-white">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error || "You do not have permission to access this section."}
                  </AlertDescription>
                </Alert>

                <div className="pt-4">
                  <Button
                    onClick={() => router.push("/")}
                    variant="outline"
                    className="w-full"
                  >
                    Return to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return children;
}
