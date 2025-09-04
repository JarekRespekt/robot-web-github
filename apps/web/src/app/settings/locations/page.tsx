'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin-header';
import { AdminSidebar } from '@/components/admin-sidebar';
import { LocationsSettingsView } from '@/components/locations-settings-view';
import robotApi from '@/lib/robot-api';

export default function LocationsSettingsPage() {
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
          currentView="locations"
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50/30">
          <LocationsSettingsView />
        </main>
      </div>
    </div>
  );
}