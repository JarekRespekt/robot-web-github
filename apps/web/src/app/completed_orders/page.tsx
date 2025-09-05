'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin-header';
import { AdminSidebar } from '@/components/admin-sidebar';
import { OrdersTable } from '@/components/orders-table';
import { Card, CardContent } from '@/components/ui/card';
import { useOrders } from '@/lib/robot-queries';
import robotApi from '@/lib/robot-api';

export default function CompletedOrdersPage() {
  const router = useRouter();
  
  // Get all orders using React Query
  const { data: orders = [], isLoading } = useOrders();

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
        <AdminSidebar currentView="orders" />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50/30">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-ink">Замовлення</h1>
                <p className="text-muted-foreground mt-1">
                  Керуйте активними та виконаними замовленнями
                </p>
              </div>
              

            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="shadow-card border-0">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {orders.filter(o => o.status === 'нове').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Нові</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-card border-0">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {orders.filter(o => o.status === 'у реалізації').length}
                    </p>
                    <p className="text-sm text-muted-foreground">У реалізації</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-card border-0">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {orders.filter(o => o.status === 'виконано').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Виконано</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-card border-0">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-600">
                      {orders.filter(o => o.payment_status === 'оплачено').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Оплачено</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders Table */}
            <OrdersTable />
          </div>
        </main>
      </div>
    </div>
  );
}