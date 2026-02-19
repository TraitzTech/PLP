'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { NotificationsPage } from '@/components/dashboard/notifications-page';

export default function CustomerNotificationsPage() {
  return (
    <DashboardLayout userType="customer">
      <NotificationsPage userType="customer" />
    </DashboardLayout>
  );
}
