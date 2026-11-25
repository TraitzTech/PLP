"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale === "fr" ? "fr" : "en";

  const copy = locale === "fr"
    ? { eyebrow: "Une erreur est survenue", title: "Cette page n’a pas pu se charger", body: "Veuillez réessayer. Si le problème continue, retournez à l’accueil et reprenez votre recherche.", retry: "Réessayer", home: "Accueil" }
    : { eyebrow: "Something went wrong", title: "We couldn’t load this page", body: "Please try again. If the problem continues, return home and continue your search.", retry: "Try again", home: "Home" };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f8f5fb] via-white to-[#fff5f6] px-5 py-12 flex items-center justify-center">
      <section className="w-full max-w-xl rounded-3xl border border-purple-100 bg-white p-8 text-center shadow-xl shadow-purple-950/5 sm:p-12">
        <Link href={`/${locale}`} className="mx-auto mb-10 flex w-fit items-center" aria-label="PLP home">
          <Logo showText={false} className="h-11 w-11" disableLink />
        </Link>
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-plp-purple">{copy.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-gray-600">{copy.body}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} className="bg-plp-purple text-white hover:bg-plp-purple/90">
            <RefreshCw className="mr-2 h-4 w-4" />{copy.retry}
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${locale}`}><Home className="mr-2 h-4 w-4" />{copy.home}</Link>
          </Button>
        </div>
        <p className="mt-10 text-xs text-gray-400">PLP · Property Listing Portal</p>
      </section>
    </main>
  );
}
