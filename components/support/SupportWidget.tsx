"use client";

import React, { useMemo, useState } from "react";
import { MessageCircle, Send, HelpCircle, Mail, Phone, Sparkles, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildWhatsappMessageUrl, useContactSettings } from "@/hooks/use-contact-settings";

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const isValid = useMemo(() => form.name && form.phone && form.message, [form]);
  const { contact } = useContactSettings();
  const pathname = usePathname();
  const locale = useMemo(() => {
    if (!pathname) return 'en';
    const seg = pathname.split('/').filter(Boolean)[0];
    return seg === 'fr' ? 'fr' : 'en';
  }, [pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);

    const supportMessage = [
      "Hello PLP Support,",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Message: ${form.message}`,
      `Source: ${pathname || '/'}`,
    ].join("\n");

    const whatsappUrl = buildWhatsappMessageUrl(contact.whatsappPhone || contact.primaryPhone, supportMessage);
    window.location.href = whatsappUrl;
  };

  return (
    <div className="fixed bottom-20 right-5 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            aria-label="Open support"
            className="relative group w-14 h-14 rounded-full shadow-lg grid place-items-center text-white bg-gradient-to-br from-plp-purple via-plp-pink to-plp-yellow hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-plp-pink/30 transition-all"
          >
            <span className="absolute -top-2 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[10px] text-plp-purple shadow">
              <Sparkles className="w-3 h-3" />
            </span>
            <MessageCircle className="w-6 h-6 drop-shadow" />
            <span className="absolute inset-0 rounded-full animate-ping bg-plp-pink/20" aria-hidden />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-plp-purple via-plp-pink to-plp-yellow p-5 text-white">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5" /> We\'re here to help
              </DialogTitle>
              <DialogDescription className="text-white/90">
                Get quick answers or send us a message. We typically respond as soon as possible.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5 space-y-5">
            {/* Quick help */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Quick help</h4>
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/${locale}/help/getting-started`} className="group">
                  <div className="border rounded-lg p-3 hover:bg-gray-50 transition flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-plp-purple" />
                    <span className="text-sm text-gray-900 group-hover:underline">Getting started</span>
                  </div>
                </Link>
                <Link href={`/${locale}/help/verify-agent-kyc`} className="group">
                  <div className="border rounded-lg p-3 hover:bg-gray-50 transition flex items-center gap-2">
                    <ShieldCheckIcon />
                    <span className="text-sm text-gray-900 group-hover:underline">Agent verification</span>
                  </div>
                </Link>
                <Link href={`/${locale}/help/manage-listings`} className="group">
                  <div className="border rounded-lg p-3 hover:bg-gray-50 transition flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-plp-pink" />
                    <span className="text-sm text-gray-900 group-hover:underline">Manage listings</span>
                  </div>
                </Link>
                <Link href={`/${locale}/help/payments-and-billing`} className="group">
                  <div className="border rounded-lg p-3 hover:bg-gray-50 transition flex items-center gap-2">
                    <Mail className="w-4 h-4 text-plp-yellow" />
                    <span className="text-sm text-gray-900 group-hover:underline">Payments & billing</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Contact form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <h4 className="font-semibold text-gray-900">Contact support</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-700" htmlFor="support-name">Name</label>
                  <Input id="support-name" value={form.name} onChange={(e)=>setForm(f=>({...f, name: e.target.value}))} placeholder="Your name" required />
                </div>
                <div>
                  <label className="text-sm text-gray-700" htmlFor="support-phone">Phone</label>
                  <Input id="support-phone" value={form.phone} onChange={(e)=>setForm(f=>({...f, phone: e.target.value}))} placeholder="+2376XXXXXXXX" required />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-700" htmlFor="support-message">Message</label>
                <Textarea id="support-message" value={form.message} onChange={(e)=>setForm(f=>({...f, message: e.target.value}))} placeholder="Tell us how we can help" rows={4} required />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1"><Phone className="w-4 h-4 text-plp-purple" /> {contact.primaryPhone}</span>
                  <span className="hidden md:inline">•</span>
                  <span className="inline-flex items-center gap-1"><Mail className="w-4 h-4 text-plp-pink" /> {contact.supportEmail}</span>
                </div>
                <Button type="submit" disabled={!isValid || submitting} className="btn-primary inline-flex items-center gap-2">
                  <Send className="w-4 h-4" /> {submitting ? "Opening WhatsApp..." : "Chat on WhatsApp"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShieldCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-600">
      <path fillRule="evenodd" d="M11.48 3.499a1.875 1.875 0 0 1 1.04 0l6.75 2.25c.805.268 1.23 1.15.962 1.955l-2.25 6.75a1.875 1.875 0 0 1-.962 1.039l-6.75 2.25a1.875 1.875 0 0 1-1.04 0l-6.75-2.25a1.875 1.875 0 0 1-.962-1.039l-2.25-6.75a1.875 1.875 0 0 1 .962-1.955l6.75-2.25Z" clipRule="evenodd" />
      <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default SupportWidget;
