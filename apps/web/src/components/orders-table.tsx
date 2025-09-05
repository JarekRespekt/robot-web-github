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
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Статус замовлення" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі статуси</SelectItem>
                {Object.entries(ORDER_STATUSES).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Source Filter */}
            <Select value={sourceFilter} onValueChange={(value: any) => setSourceFilter(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Джерело замовлення" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі джерела</SelectItem>
                {Object.entries(SOURCE_LABELS).map(([source, label]) => (
                  <SelectItem key={source} value={source}>
                    {label}
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
            <Button onClick={() => refetch()} variant="outline">
              Оновити
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = ORDER_STATUSES[order.status];
            const paymentConfig = PAYMENT_STATUSES[order.payment_status];
            const DeliveryIcon = DELIVERY_METHODS[order.delivery_type].icon;
            
            return (
              <Card key={order.id} className="shadow-card border-0 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-ink">#{order.id}</h3>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                        <Badge className={paymentConfig.color}>
                          {paymentConfig.label}
                        </Badge>
                        <Badge variant="outline" className="text-muted-foreground">
                          {SOURCE_LABELS[order.source]}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DeliveryIcon className="h-4 w-4 mr-1" />
                          {DELIVERY_METHODS[order.delivery_type].label}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-ink">{order.customer?.name || 'Невідомий клієнт'}</p>
                          {order.customer?.phone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-4 w-4 mr-1" />
                              {order.customer.phone}
                            </div>
                          )}
                          {order.customer?.address && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-1" />
                              {order.customer.address}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center text-sm text-muted-foreground mb-1">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(order.order_time)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Items Preview */}
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Страви:</span>{' '}
                        {order.items.map((item, index) => (
                          <span key={index}>
                            {item.item_name.ua || item.item_name.en} (×{item.quantity})
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
                      
                      <div className="flex gap-2 flex-wrap">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Деталі
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                        
                        {order.status === 'нове' && (
                          <Button 
                            size="sm" 
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => handleStatusChange(order.id, 'у реалізації')}
                            disabled={updateOrderStatus.isPending}
                          >
                            У реалізацію
                          </Button>
                        )}
                        
                        {order.status === 'у реалізації' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleStatusChange(order.id, 'виконано')}
                            disabled={updateOrderStatus.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Виконано
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Деталі замовлення #{selectedOrder.id}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Order Status & Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Статус замовлення</h4>
                  <div className="space-y-2">
                    <Badge className={ORDER_STATUSES[selectedOrder.status].color}>
                      {ORDER_STATUSES[selectedOrder.status].label}
                    </Badge>
                    <Badge className={PAYMENT_STATUSES[selectedOrder.payment_status].color}>
                      {PAYMENT_STATUSES[selectedOrder.payment_status].label}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Інформація про замовлення</h4>
                  <p className="text-sm text-muted-foreground">
                    Джерело: {SOURCE_LABELS[selectedOrder.source]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Тип: {DELIVERY_METHODS[selectedOrder.delivery_type].label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Час: {formatDate(selectedOrder.order_time)}
                  </p>
                </div>
              </div>
              
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Інформація про клієнта
                </h4>
                <div className="bg-surface rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Ім'я:</span> {selectedOrder.customer?.name || 'Не вказано'}</p>
                  {selectedOrder.customer?.phone && (
                    <p><span className="font-medium">Телефон:</span> {selectedOrder.customer.phone}</p>
                  )}
                  {selectedOrder.customer?.address && (
                    <p><span className="font-medium">Адреса:</span> {selectedOrder.customer.address}</p>
                  )}
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Позиції замовлення
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="bg-surface rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.item_name.ua || item.item_name.en}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.total)}</p>
                    </div>
                  ))}
                  <div className="bg-primary/10 rounded-lg p-4 flex justify-between items-center font-semibold">
                    <span>Загальна сума:</span>
                    <span className="text-lg">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
              
              {/* Delivery Info */}
              {selectedOrder.delivery_info && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Truck className="h-4 w-4 mr-2" />
                    Інформація про доставку
                  </h4>
                  <div className="bg-surface rounded-lg p-4 space-y-2">
                    {selectedOrder.delivery_info.address && (
                      <p><span className="font-medium">Адреса:</span> {selectedOrder.delivery_info.address}</p>
                    )}
                    {selectedOrder.delivery_info.phone && (
                      <p><span className="font-medium">Телефон:</span> {selectedOrder.delivery_info.phone}</p>
                    )}
                    {selectedOrder.delivery_info.delivery_time && (
                      <p><span className="font-medium">Час доставки:</span> {selectedOrder.delivery_info.delivery_time}</p>
                    )}
                    {selectedOrder.delivery_info.notes && (
                      <p><span className="font-medium">Примітки:</span> {selectedOrder.delivery_info.notes}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
        </div>
      )}
    </div>
  );
}