'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useOrders, useUpdateOrderStatus } from '@/lib/robot-queries';
import type { Order, OrdersFilters } from '@/types/robot';
import { 
  Search, 
  Eye, 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Package,
  Truck,
  MapPin,
  User,
  ShoppingBag
} from 'lucide-react';

const ORDER_STATUSES = {
  'нове': { label: 'Нове', color: 'bg-yellow-100 text-yellow-700' },
  'у реалізації': { label: 'У реалізації', color: 'bg-orange-100 text-orange-700' },
  'виконано': { label: 'Виконано', color: 'bg-green-100 text-green-700' },
};

const PAYMENT_STATUSES = {
  'оплачено': { label: 'Оплачено', color: 'bg-green-100 text-green-700' },
  'неоплачено': { label: 'Неоплачено', color: 'bg-red-100 text-red-700' },
};

const SOURCE_LABELS = {
  'resto': 'Ресторан',
  'telegram': 'Telegram',
  'glovo': 'Glovo',
  'bolt': 'Bolt',
  'wolt': 'Wolt',
  'custom': 'Інше',
};

const DELIVERY_METHODS = {
  'доставка': { label: 'Доставка', icon: Truck },
  'особистий відбір': { label: 'Особистий відбір', icon: Package },
};

export function OrdersTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<Order['source'] | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const { toast } = useToast();

  // Build filters for API query
  const filters: OrdersFilters = {};
  if (statusFilter !== 'all') filters.status = statusFilter;
  if (sourceFilter !== 'all') filters.source = sourceFilter;

  const { data: orders = [], isLoading, refetch } = useOrders(filters);
  const updateOrderStatus = useUpdateOrderStatus();

  // Filter orders based on search
  const filteredOrders = orders.filter(order => {
    const customerName = order.customer?.name || '';
    const customerPhone = order.customer?.phone || '';
    const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customerPhone.includes(searchQuery) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus.mutateAsync({ 
        id: orderId, 
        data: { status: newStatus } 
      });
      toast({
        title: "Статус замовлення оновлено",
        description: `Замовлення #${orderId} тепер має статус "${ORDER_STATUSES[newStatus].label}"`,
      });
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося оновити статус замовлення",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} грн`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card className="shadow-card border-0">
        <CardContent className="pt-12 text-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Завантаження замовлень...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="shadow-card border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Пошук за ім'ям, телефоном або номером замовлення..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Статус замовлення" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі замовлення</SelectItem>
                {Object.entries(ORDER_STATUSES).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="shadow-card border-0">
          <CardContent className="pt-12 text-center py-16">
            <div className="text-6xl mb-6">📦</div>
            <h2 className="text-2xl font-semibold mb-3 text-ink">
              {searchQuery || statusFilter !== 'all' ? 'Замовлень не знайдено' : 'Немає замовлень'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all' 
                ? 'Спробуйте змінити фільтри пошуку'
                : 'Як тільки клієнти почнуть робити замовлення, вони з\'являться тут.'
              }
            </p>
            {onRefetch && (
              <Button onClick={onRefetch} variant="outline">
                Оновити
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = ORDER_STATUSES[order.status];
            const DeliveryIcon = DELIVERY_METHODS[order.delivery_method].icon;
            
            return (
              <Card key={order.id} className="shadow-card border-0 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-ink">#{order.id}</h3>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DeliveryIcon className="h-4 w-4 mr-1" />
                          {DELIVERY_METHODS[order.delivery_method].label}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-ink">{order.customer_name}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="h-4 w-4 mr-1" />
                            {order.customer_phone}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center text-sm text-muted-foreground mb-1">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(order.created_at)}
                          </div>
                          {order.estimated_ready_time && (
                            <p className="text-sm text-muted-foreground">
                              Готово: {formatDate(order.estimated_ready_time)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Items Preview */}
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Страви:</span>{' '}
                        {order.items.map((item, index) => (
                          <span key={index}>
                            {item.name} (×{item.quantity})
                            {index < order.items.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Actions & Total */}
                    <div className="flex flex-col items-end space-y-3 lg:ml-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-ink">
                          {formatCurrency(order.total_amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} позицій
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Деталі
                        </Button>
                        
                        {order.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => onStatusChange?.(order.id, 'confirmed')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Підтвердити
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => onStatusChange?.(order.id, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Скасувати
                            </Button>
                          </>
                        )}
                        
                        {order.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => onStatusChange?.(order.id, 'preparing')}
                          >
                            Готується
                          </Button>
                        )}
                        
                        {order.status === 'preparing' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => onStatusChange?.(order.id, 'ready')}
                          >
                            Готово
                          </Button>
                        )}
                        
                        {order.status === 'ready' && order.delivery_method !== 'pickup' && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => onStatusChange?.(order.id, 'delivered')}
                          >
                            Доставлено
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}