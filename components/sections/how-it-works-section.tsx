"use client";

import { CalendarCheck2, CreditCard, LocateFixed, MessagesSquare, ShieldCheck, Wand2 } from "lucide-react";
import { useTranslations } from "@/components/translation-provider";

const stepIcons = [
  <LocateFixed className="w-6 h-6" key="locate" />,
  <CalendarCheck2 className="w-6 h-6" key="calendar" />,
  <CreditCard className="w-6 h-6" key="credit" />,
  <MessagesSquare className="w-6 h-6" key="messages" />,
];

export function HowItWorksSection() {
  const t = useTranslations();

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-12 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #6366f1, transparent 25%), radial-gradient(circle at 80% 0%, #a855f7, transparent 20%)" }} />
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <p className="uppercase tracking-[0.2em] text-xs text-indigo-200">{t('howItWorks.sectionLabel')}</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 leading-tight">{t('howItWorks.heading')}</h2>
            <p className="text-indigo-100 mt-3 max-w-2xl">{t('howItWorks.description')}</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-full px-4 py-2">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <span className="text-sm text-indigo-100">{t('howItWorks.securityBadge')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="group relative h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-indigo-200 tracking-wide">{t(`howItWorks.steps.${i}.accent`)}</span>
                <Wand2 className="w-4 h-4 text-indigo-200 opacity-70" />
              </div>
              <div className="inline-flex items-center justify-center rounded-full bg-indigo-500/20 text-indigo-100 p-3 mb-4">
                {stepIcons[i]}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t(`howItWorks.steps.${i}.title`)}</h3>
              <p className="text-sm text-indigo-100 leading-relaxed">{t(`howItWorks.steps.${i}.description`)}</p>
              <div className="absolute inset-x-0 bottom-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-emerald-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
