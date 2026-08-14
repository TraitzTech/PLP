"use client";

import React from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  MessageSquare,
  Bell,
  LifeBuoy,
  Settings,
  ChevronRight,
  GraduationCap,
  Megaphone,
  FileBarChart,
} from "lucide-react";

type MoreLink = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const LINKS: MoreLink[] = [
  {
    href: "/dashboard/pao/more/profile",
    label: "My Profile",
    description: "Your details, staff code and territory",
    icon: User,
  },
  {
    href: "/dashboard/messages",
    label: "Messages",
    description: "Conversations with the team",
    icon: MessageSquare,
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    description: "Updates on your listings and tasks",
    icon: Bell,
  },
  {
    href: "/contact",
    label: "Support",
    description: "Get help from the PLP team",
    icon: LifeBuoy,
  },
  {
    href: "/dashboard/pao/more/profile",
    label: "Settings",
    description: "Password and account preferences",
    icon: Settings,
  },
];

const COMING_SOON: { label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Training", icon: GraduationCap },
  { label: "Marketing Materials", icon: Megaphone },
  { label: "Reports", icon: FileBarChart },
];

export default function PaoMorePage() {
  return (
    <DashboardLayout userType="pao">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">More</h1>
          <p className="text-gray-600 mt-1">Everything else in one place.</p>
        </div>

        <Card>
          <CardContent className="p-0 divide-y">
            {LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={`${link.label}-${link.href}`} href={link.href}>
                  <div className="flex items-center gap-3 p-4 min-h-[64px] hover:bg-gray-50 transition cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-plp-purple/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-plp-purple" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{link.label}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{link.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 divide-y">
            {COMING_SOON.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-4 min-h-[64px] opacity-60 cursor-not-allowed"
                  aria-disabled
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-700 flex-1">{item.label}</p>
                  <Badge variant="secondary" className="border-transparent bg-gray-100 text-gray-600">
                    Coming soon
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
