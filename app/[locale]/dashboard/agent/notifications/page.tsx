'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { NotificationsPage } from '@/components/dashboard/notifications-page';

export default function AgentNotificationsPage() {
  return (
    <DashboardLayout userType="agent">
      <NotificationsPage userType="agent" />
    </DashboardLayout>
  );
}
