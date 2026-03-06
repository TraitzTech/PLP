"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ShieldCheck, Wallet, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import { useEffect } from "react";

interface BookingPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency: string;
  onSuccess: (paymentDetails: any) => void;
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export function BookingPaymentModal({
  isOpen,
  onClose,
  amount,
  currency = "XAF",
  onSuccess,
  guestInfo,
}: BookingPaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"MTN" | "ORANGE">("MTN");
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync phone number when guestInfo or isOpen changes
  useEffect(() => {
    if (isOpen && guestInfo?.phone) {
      setPhoneNumber(guestInfo.phone);
    }
  }, [isOpen, guestInfo?.phone]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter your mobile money number");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiClient.post("/payments/collect", {
        amount,
        phone_number: phoneNumber,
        service: paymentMethod,
        currency,
        purpose: "booking_fee",
        customer: guestInfo ? {
            email: guestInfo.email,
            first_name: guestInfo.name,
            phone: guestInfo.phone
        } : undefined
      });

      if (response.data.status === "success") {
        toast.success("Payment successful!");
        onSuccess(response.data.data);
        onClose();
      } else {
        toast.error(response.data.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(
        error?.response?.data?.message || "Payment failed. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl sm:rounded-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Secure Payment</DialogTitle>
          <DialogDescription>
            Please complete the platform fee payment to finalize your booking.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-gradient-to-br from-plp-purple via-purple-700 to-indigo-800 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Secure Payment</h2>
          </div>
          <p className="text-white/80 text-sm">
            Please complete the platform fee payment to finalize your booking.
          </p>
          <div className="mt-6 bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm font-medium">Total Amount</span>
              <span className="text-2xl font-black text-white">{formatCurrency(amount)}</span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Select Mobile Money Provider
              </Label>
              <RadioGroup
                defaultValue="MTN"
                onValueChange={(val: any) => setPaymentMethod(val)}
                className="grid grid-cols-2 gap-4"
              >
                <div className="relative">
                  <RadioGroupItem
                    value="MTN"
                    id="mtn"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="mtn"
                    className={`flex flex-col items-center justify-between rounded-xl border-2 bg-white p-4 hover:bg-gray-50 cursor-pointer transition-all ${
                      paymentMethod === "MTN"
                        ? "border-plp-yellow ring-2 ring-plp-yellow/20"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="w-12 h-12 relative mb-2">
                        <div className="w-full h-full bg-yellow-400 rounded-full flex items-center justify-center font-bold text-xs text-black shadow-sm">MTN</div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 uppercase">MTN MoMo</span>
                  </Label>
                  {paymentMethod === "MTN" && (
                      <div className="absolute -top-2 -right-2 bg-plp-yellow text-black rounded-full p-1 shadow-md">
                          <ShieldCheck className="w-3 h-3" />
                      </div>
                  )}
                </div>

                <div className="relative">
                  <RadioGroupItem
                    value="ORANGE"
                    id="orange"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="orange"
                    className={`flex flex-col items-center justify-between rounded-xl border-2 bg-white p-4 hover:bg-gray-50 cursor-pointer transition-all ${
                      paymentMethod === "ORANGE"
                        ? "border-orange-500 ring-2 ring-orange-500/20"
                        : "border-gray-100"
                    }`}
                  >
                     <div className="w-12 h-12 relative mb-2">
                        <div className="w-full h-full bg-orange-500 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shadow-sm italic">Orange</div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 uppercase">Orange Money</span>
                  </Label>
                  {paymentMethod === "ORANGE" && (
                      <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1 shadow-md">
                          <ShieldCheck className="w-3 h-3" />
                      </div>
                  )}
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Mobile Number
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  placeholder="6XX XXX XXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-4 h-12 rounded-xl border-gray-200 focus:border-plp-purple focus:ring-plp-purple/20 transition-all text-lg font-medium"
                />
              </div>
              <p className="text-[10px] text-gray-500 flex items-center gap-1.5 px-1">
                <ShieldCheck className="w-3 h-3" />
                Your payment is secure and encrypted by MeSomb.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 bg-gray-50 border-t border-gray-100 gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 h-12 rounded-xl font-bold border-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-[2] h-12 rounded-xl font-bold bg-plp-purple hover:bg-plp-purple/90 text-white shadow-lg shadow-plp-purple/20 transition-all active:scale-95"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${formatCurrency(amount)}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
