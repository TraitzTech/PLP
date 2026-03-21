"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { agentBookingService, Booking } from "@/services/bookingService";
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AgentReservationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const bookingId = useMemo(() => Number(params?.id), [params?.id]);

  const loadBooking = async () => {
    if (!bookingId || Number.isNaN(bookingId)) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await agentBookingService.getBooking(bookingId);
      setBooking(response.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load reservation details");
      setBooking(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const resolveImageUrl = (img: any): string | null => {
    const src = img?.image_url || img?.image_path || img?.url;
    if (!src) return null;
    if (src.startsWith("http")) return src;
    return `${process.env.NEXT_PUBLIC_API_URL}/../storage/listing_images/${src}`;
  };

  const getPropertyImage = (item: Booking) => {
    if (item.listing?.images && item.listing.images.length > 0) {
      const featured = item.listing.images.find((img) => img.is_featured);
      return resolveImageUrl(featured) || resolveImageUrl(item.listing.images[0]);
    }
    return "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg";
  };

  const formatCurrency = (amount: number, currency = "XAF") => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGuestInfo = (item: Booking) => {
    if (item.user) {
      return {
        name: item.user.name,
        email: item.user.email,
        phone: item.user.phone || "N/A",
      };
    }

    return {
      name: item.guest_name || "Guest",
      email: item.guest_email || "N/A",
      phone: item.guest_phone || "N/A",
    };
  };

  const handleConfirm = async () => {
    if (!booking) return;

    try {
      setIsProcessing(true);
      await agentBookingService.confirmBooking(booking.id);
      toast.success("Reservation confirmed");
      await loadBooking();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to confirm reservation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!booking) return;

    try {
      setIsProcessing(true);
      await agentBookingService.cancelBooking(booking.id, cancelReason.trim() || "Rejected by agent");
      toast.success("Reservation rejected");
      setCancelReason("");
      await loadBooking();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to reject reservation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!booking) return;

    try {
      setIsProcessing(true);
      await agentBookingService.completeBooking(booking.id);
      toast.success("Reservation marked as completed");
      await loadBooking();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to complete reservation");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="agent">
        <div className="space-y-4">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return (
      <DashboardLayout userType="agent">
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard/agent/reservations")}> 
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to reservations
          </Button>
          <Card>
            <CardContent className="py-10 text-center text-gray-600">
              Reservation not found.
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const guest = getGuestInfo(booking);

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => router.push("/dashboard/agent/reservations")}> 
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to reservations
          </Button>
          <div className="flex flex-wrap gap-2">
            {booking.status === "pending" && (
              <>
                <Button onClick={handleConfirm} disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Confirm
                </Button>
                <Button variant="outline" className="text-red-600" onClick={handleReject} disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                  Reject
                </Button>
              </>
            )}
            {booking.status === "confirmed" && (
              <Button onClick={handleComplete} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Complete
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reservation #{booking.id}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <img
              src={getPropertyImage(booking) || "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg"}
              alt={booking.listing?.title || "Property"}
              className="h-56 w-full rounded-lg object-cover"
            />
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">{booking.listing?.title || "Property"}</h2>
              <p className="text-sm text-gray-600">
                {booking.listing?.city || "N/A"} {booking.listing?.region ? `, ${booking.listing.region}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                <Badge variant="outline">Payment: {booking.payment_status}</Badge>
              </div>
              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Check-in</p>
                  <p className="font-medium">{formatDate(booking.check_in_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Check-out</p>
                  <p className="font-medium">{formatDate(booking.check_out_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Guests</p>
                  <p className="font-medium">{booking.guest_count || 1}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-medium">{formatCurrency(booking.total_price, booking.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Guest name</p>
                  <p className="font-medium">{guest.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Guest email</p>
                  <p className="font-medium">{guest.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Guest phone</p>
                  <p className="font-medium">{guest.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Booked on</p>
                  <p className="font-medium">{formatDate(booking.created_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rejection note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="cancel-reason">Reason (optional)</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Add a note for why this reservation is being rejected"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-gray-500">
              This reason is sent when you reject a pending reservation.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
