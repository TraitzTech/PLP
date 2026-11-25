import Link from "next/link";
import { CheckCircle2, MailWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default async function EmailVerificationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ locale: rawLocale }, query] = await Promise.all([params, searchParams]);
  const locale = rawLocale === "fr" ? "fr" : "en";
  const verified = query.status === "verified";
  const copy = locale === "fr"
    ? {
        title: verified ? "Adresse e-mail vérifiée" : "Lien de vérification invalide",
        body: verified
          ? "Votre adresse e-mail est confirmée. Vous pouvez maintenant vous connecter à votre compte PAO."
          : "Ce lien est invalide ou a expiré. Demandez à un administrateur de vous envoyer un nouveau lien de vérification.",
        action: verified ? "Se connecter" : "Retour à la connexion",
      }
    : {
        title: verified ? "Email verified" : "Verification link is invalid",
        body: verified
          ? "Your email address is confirmed. You can now sign in to your PAO account."
          : "This link is invalid or has expired. Ask an administrator to send you a new verification link.",
        action: verified ? "Sign in" : "Back to sign in",
      };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f8f5fb] via-white to-[#fff5f6] px-5 py-12 flex items-center justify-center">
      <section className="w-full max-w-lg rounded-3xl border border-purple-100 bg-white p-8 text-center shadow-xl shadow-purple-950/5 sm:p-12">
        <Link href={`/${locale}`} className="mx-auto mb-10 flex w-fit" aria-label="PLP home">
          <Logo showText={false} className="h-11 w-11" disableLink />
        </Link>
        <span className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${verified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
          {verified ? <CheckCircle2 className="h-7 w-7" /> : <MailWarning className="h-7 w-7" />}
        </span>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-plp-purple">PLP · Property Listing Portal</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-gray-600">{copy.body}</p>
        <Button asChild className="mt-8 bg-plp-purple text-white hover:bg-plp-purple/90">
          <Link href={`/${locale}/auth/signin?type=pao`}>{copy.action}</Link>
        </Button>
      </section>
    </main>
  );
}
