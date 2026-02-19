'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { NotificationsPage } from '@/components/dashboard/notifications-page';

export default function OwnerNotificationsPage() {
  return (
    <DashboardLayout userType="owner">
      <NotificationsPage userType="owner" />
    </DashboardLayout>
  );
}
