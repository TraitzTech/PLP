"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const routeParams = useParams<{ locale: string }>();
  const locale = routeParams?.locale === "fr" ? "fr" : "en";
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);

  const copy = locale === "fr"
    ? { title: "Créez votre mot de passe", email: "Adresse e-mail", password: "Nouveau mot de passe", confirm: "Confirmer le mot de passe", submit: "Enregistrer le mot de passe", invalid: "Le lien de création du mot de passe est incomplet ou invalide.", success: "Mot de passe enregistré. Vous pouvez vous connecter." }
    : { title: "Create your password", email: "Email address", password: "New password", confirm: "Confirm password", submit: "Save password", invalid: "The password setup link is incomplete or invalid.", success: "Password saved. You can now sign in." };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !email) return toast.error(copy.invalid);
    if (password.length < 8) return toast.error("Use at least 8 characters for your password.");
    if (password !== confirmation) return toast.error("The passwords do not match.");

    setSaving(true);
    try {
      await authService.resetPassword({ token, email, password, password_confirmation: confirmation });
      toast.success(copy.success);
      router.replace(`/${locale}/auth/signin?type=pao`);
    } catch (error: any) {
      toast.error(error?.message || copy.invalid);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f8f5fb] via-white to-[#fff5f6] px-5 py-12 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-purple-100 bg-white p-8 shadow-xl shadow-purple-950/5 sm:p-10">
        <Link href={`/${locale}`} className="mx-auto mb-8 flex w-fit" aria-label="PLP home">
          <Logo showText={false} className="h-11 w-11" disableLink />
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-plp-purple"><KeyRound className="h-6 w-6" /></span>
          <h1 className="text-2xl font-bold text-gray-950">{copy.title}</h1>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2"><Label htmlFor="email">{copy.email}</Label><Input id="email" type="email" value={email} readOnly required /></div>
          <div className="space-y-2"><Label htmlFor="password">{copy.password}</Label><Input id="password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="confirmation">{copy.confirm}</Label><Input id="confirmation" type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} required /></div>
          <Button type="submit" className="w-full bg-plp-purple text-white hover:bg-plp-purple/90" disabled={saving || !token || !email}>{saving ? "Saving…" : copy.submit}</Button>
        </form>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="min-h-screen bg-gray-50" />}><ResetPasswordForm /></Suspense>;
}
