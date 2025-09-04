'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin-header';
import { AdminSidebar } from '@/components/admin-sidebar';
import { DeliverySettingsView } from '@/components/delivery-settings-view';
import robotApi from '@/lib/robot-api';

export default function DeliverySettingsPage() {
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    if (!robotApi.isAuthenticated()) {
      router.push('/auth-group/login');
      return;
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Header */}
      <AdminHeader />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Sidebar */}
        <AdminSidebar 
          currentView="delivery"
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50/30">
          <DeliverySettingsView />
        </main>
      </div>
    </div>
  );
}