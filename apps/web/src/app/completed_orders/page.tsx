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
  const { toast } = useToast();
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!robotApi.isAuthenticated()) {
      router.push('/auth-group/login');
      return;
    }
  }, [router]);

  // Fetch orders from API (placeholder for future implementation)
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await robotApi.get('/orders');
      // setOrders(response.data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrders(MOCK_ORDERS);
      
      toast({
        title: 'Оновлено',
        description: 'Список замовлень оновлено',
        variant: 'success',
      });
    } catch (err: any) {
      setError('Не вдалося завантажити замовлення');
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити замовлення',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // await robotApi.put(`/orders/${orderId}/status`, { status: newStatus });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as any }
            : order
        )
      );
      
      toast({
        title: 'Статус оновлено',
        description: `Замовлення #${orderId} змінено на ${newStatus}`,
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити статус замовлення',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <AdminHeader />
        <div className="flex h-[calc(100vh-80px)]">
          <AdminSidebar currentView="orders" />
          <main className="flex-1 overflow-auto bg-gray-50/30">
            <div className="p-6">
              <Card className="shadow-card border-0">
                <CardContent className="pt-12 text-center py-16">
                  <div className="text-6xl mb-6">⚠️</div>
                  <h2 className="text-2xl font-semibold mb-3 text-ink">Помилка завантаження</h2>
                  <p className="text-muted-foreground mb-6">{error}</p>
                  <Button onClick={fetchOrders} className="bg-primary text-white hover:opacity-90">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Спробувати знову
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
              
              <Button 
                onClick={fetchOrders}
                disabled={loading}
                className="bg-primary text-white hover:opacity-90 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Оновлення...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Оновити
                  </>
                )}
              </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="shadow-card border-0">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {orders.filter(o => o.status === 'pending').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Нові</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-card border-0">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length}
                    </p>
                    <p className="text-sm text-muted-foreground">В роботі</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-card border-0">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {orders.filter(o => o.status === 'ready').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Готові</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-card border-0">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-600">
                      {orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Завершені</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders Table */}
            <OrdersTable 
              orders={orders}
              loading={loading}
              onStatusChange={handleStatusChange}
              onRefetch={fetchOrders}
            />
          </div>
        </main>
      </div>
    </div>
  );
}