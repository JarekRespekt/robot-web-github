'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Truck, Package, Save, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  enabled: boolean;
  custom: boolean;
}

const DEFAULT_METHODS: DeliveryMethod[] = [
  {
    id: 'pickup',
    name: 'Самовивіз',
    description: 'Клієнт забирає замовлення самостійно',
    price: 0,
    enabled: true,
    custom: false,
  },
  {
    id: 'delivery',
    name: 'Доставка',
    description: 'Доставка нашим кур\'єром',
    price: 25,
    enabled: true,
    custom: false,
  },
];

export function DeliverySettingsView() {
  const { toast } = useToast();
  const [methods, setMethods] = useState<DeliveryMethod[]>(DEFAULT_METHODS);
  const [isCreating, setIsCreating] = useState(false);
  const [newMethod, setNewMethod] = useState({
    name: '',
    description: '',
    price: 0,
  });

  const handleToggleMethod = (methodId: string) => {
    setMethods(prev => 
      prev.map(method => 
        method.id === methodId 
          ? { ...method, enabled: !method.enabled }
          : method
      )
    );
    toast({
      title: 'Оновлено',
      description: 'Налаштування доставки збережено',
      variant: 'success',
    });
  };

  const handlePriceChange = (methodId: string, price: number) => {
    setMethods(prev => 
      prev.map(method => 
        method.id === methodId 
          ? { ...method, price }
          : method
      )
    );
  };

  const handleCreateMethod = () => {
    if (!newMethod.name.trim()) {
      toast({
        title: 'Помилка',
        description: 'Назва методу обов\'язкова',
        variant: 'destructive',
      });
      return;
    }

    const customMethod: DeliveryMethod = {
      id: `custom_${Date.now()}`,
      name: newMethod.name,
      description: newMethod.description,
      price: newMethod.price,
      enabled: true,
      custom: true,
    };

    setMethods(prev => [...prev, customMethod]);
    setNewMethod({ name: '', description: '', price: 0 });
    setIsCreating(false);

    toast({
      title: 'Успіх!',
      description: 'Новий метод доставки створено',
      variant: 'success',
    });
  };

  const handleDeleteMethod = (methodId: string) => {
    if (confirm('Ви впевнені, що хочете видалити цей метод доставки?')) {
      setMethods(prev => prev.filter(method => method.id !== methodId));
      toast({
        title: 'Видалено',
        description: 'Метод доставки видалено',
        variant: 'success',
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Налаштування доставки</h1>
          <p className="text-muted-foreground mt-1">Керуйте методами та цінами доставки</p>
        </div>
        
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-primary text-white hover:opacity-90 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Створити новий метод доставки
        </Button>
      </div>

      {/* Create New Method Modal */}
      {isCreating && (
        <Card className="shadow-card border-primary">
          <CardHeader>
            <CardTitle>Створити новий метод доставки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Назва методу *</Label>
                <Input
                  id="new-name"
                  value={newMethod.name}
                  onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Наприклад: Експрес доставка"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-price">Ціна доставки</Label>
                <div className="relative">
                  <Input
                    id="new-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newMethod.price}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="50.00"
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    грн
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-description">Опис методу</Label>
              <Input
                id="new-description"
                value={newMethod.description}
                onChange={(e) => setNewMethod(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Короткий опис методу доставки"
              />
            </div>
            
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewMethod({ name: '', description: '', price: 0 });
                }}
              >
                Скасувати
              </Button>
              <Button
                onClick={handleCreateMethod}
                className="bg-primary text-white hover:opacity-90"
              >
                <Save className="h-4 w-4 mr-2" />
                Створити
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Methods */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-ink">Методи доставки</h2>
        
        {methods.map((method) => (
          <Card key={method.id} className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {method.id === 'pickup' ? (
                      <Package className="h-6 w-6 text-primary" />
                    ) : (
                      <Truck className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-ink">{method.name}</h3>
                      {method.custom && (
                        <Badge variant="outline" className="text-xs">Власний</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={() => handleToggleMethod(method.id)}
                  />
                  
                  {method.custom && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteMethod(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {method.enabled && (
                <div>
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${method.id}-price`}>Вартість доставки</Label>
                      <div className="relative">
                        <Input
                          id={`${method.id}-price`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={method.price}
                          onChange={(e) => handlePriceChange(method.id, parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          грн
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {method.price === 0 ? 'Безкоштовна доставка' : `Клієнт сплачує: ${method.price.toFixed(2)} грн`}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Статус</Label>
                      <div className="flex items-center h-10">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Активний
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Тип методу</Label>
                      <div className="flex items-center h-10">
                        <Badge variant={method.custom ? "default" : "outline"}>
                          {method.custom ? 'Власний' : 'Системний'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}