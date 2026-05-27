"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, ShieldCheck, Users } from "lucide-react";

export function AgentCTASection() {
  const pathname = usePathname();
  
  const locale = React.useMemo(() => {
    const first = pathname?.split("/").filter(Boolean)[0];
    return first === "en" || first === "fr" ? first : "en";
  }, [pathname]);

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 blur-3xl opacity-10 pointer-events-none">
        <div className="aspect-square w-[600px] rounded-full bg-gradient-to-br from-plp-purple to-plp-pink" />
      </div>
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Are you a <span className="text-plp-purple">Property Owner</span> or <span className="text-plp-pink">Agent</span>?
              </h2>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                Join Cameroon's fastest-growing property portal. Reach thousands of potential tenants and buyers every day. Our platform provides the tools you need to manage your listings effectively.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col items-start gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-plp-purple/10 text-plp-purple">
                  <Users className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Large Audience</h4>
                <p className="text-xs text-gray-500">Connect with thousands of active seekers.</p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-plp-pink/10 text-plp-pink">
                  <Building2 className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Easy Management</h4>
                <p className="text-xs text-gray-500">List and track properties with ease.</p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-plp-yellow/10 text-plp-yellow">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Verified Leads</h4>
                <p className="text-xs text-gray-500">Get quality leads from verified users.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/${locale}/auth/signup?type=agent`} className="inline-block">
                <Button size="lg" className="bg-gradient-to-r from-plp-purple to-plp-pink hover:opacity-90 text-white font-bold py-6 px-8 rounded-full shadow-lg hover:shadow-xl transition-all group">
                  Start Listing Today
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg"
                alt="Agents working together"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${i}`} alt="Agent" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-medium">Joined by 1,000+ agents this month</span>
                </div>
              </div>
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl hidden sm:block border border-gray-100 max-w-[200px] animate-bounce-subtle">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Verified</p>
                  <p className="text-sm font-bold text-gray-900">Top Rated Agent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
