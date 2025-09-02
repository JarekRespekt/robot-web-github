'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Truck, User, Store, Loader2 } from 'lucide-react';
import { useLocations, useUpdateDeliverySettings } from '@/lib/robot-queries';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, parseCurrency } from '@/lib/i18n';
import robotApi from '@/lib/robot-api';
import Link from 'next/link';
import type { Location } from '@/types/robot';

const DELIVERY_METHODS = [
  {
    method: 'pickup' as const,
    icon: Store,
    title: 'Самовивіз',
    description: 'Клієнт забирає замовлення в ресторані',
  },
  {
    method: 'courier' as const,
    icon: Truck,
    title: "Кур'єр",
    description: 'Доставка замовлення кур\'єром',
  },
  {
    method: 'self' as const,
    icon: User,
    title: 'Власна доставка',
    description: 'Доставка власним транспортом',
  },
];

export default function DeliverySettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const { data: locations, isLoading: locationsLoading } = useLocations();
  const updateDeliverySettings = useUpdateDeliverySettings();

  const [settings, setSettings] = useState<Location['delivery_settings']>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Get first location (assuming single location for now)
  const location = locations?.[0];

  // Check authentication
  useEffect(() => {
    if (!robotApi.isAuthenticated()) {
      router.push('/auth-group/login');
    }
  }, [router]);

  // Initialize settings from location data
  useEffect(() => {
    if (location?.delivery_settings) {
      setSettings([...location.delivery_settings]);
    } else if (!locationsLoading && locations?.length === 0) {
      // Initialize default settings if no location exists
      setSettings(
        DELIVERY_METHODS.map(method => ({
          method: method.method,
          enabled: method.method === 'pickup', // Enable pickup by default
          delivery_fee: 0,
        }))
      );
    }
  }, [location, locationsLoading, locations]);

  const handleMethodToggle = (method: string, enabled: boolean) => {
    setSettings(prev => prev.map(setting =>
      setting.method === method 
        ? { ...setting, enabled }
        : setting
    ));
    setHasChanges(true);
  };

  const handleFeeChange = (method: string, fee: string) => {
    const numericFee = parseCurrency(fee);
    setSettings(prev => prev.map(setting =>
      setting.method === method 
        ? { ...setting, delivery_fee: numericFee }
        : setting
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!location) {
      toast({
        title: 'Помилка',
        description: 'Локація не знайдена',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateDeliverySettings.mutateAsync({
        id: location.id,
        data: { delivery_settings: settings },
      });

      toast({
        title: 'Успіх!',
        description: 'Налаштування доставки збережено',
        variant: 'success',
      });

      setHasChanges(false);
    } catch (error) {
      toast({
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалося зберегти налаштування',
        variant: 'destructive',
      });
    }
  };

  if (locationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-robot-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Завантаження налаштувань...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-surface border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild className="cursor-pointer">
              <Link href="/menu">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад до меню
              </Link>
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold text-ink">Налаштування доставки</h1>
              <p className="text-muted-foreground mt-1">Керуйте методами доставки та тарифами</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-6 space-y-6">
            
            <div>
              <h1 className="text-2xl font-bold robot-ink">Налаштування доставки</h1>
              <p className="text-muted-foreground">
                Керуйте методами та цінами доставки
              </p>
            </div>
          </div>

          {hasChanges && (
            <Button 
              onClick={handleSave}
              disabled={updateDeliverySettings.isPending}
            >
              {updateDeliverySettings.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Збереження...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Зберегти
                </>
              )}
            </Button>
          )}
        </div>

        {/* Delivery Methods */}
        <div className="space-y-4">
          {DELIVERY_METHODS.map((methodConfig, index) => {
            const setting = settings.find(s => s.method === methodConfig.method);
            const isEnabled = setting?.enabled || false;
            const fee = setting?.delivery_fee || 0;

            const Icon = methodConfig.icon;

            return (
              <Card key={methodConfig.method} className="robot-card-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-robot-md bg-robot-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-robot-primary" />
                      </div>
                      
                      <div>
                        <CardTitle className="text-lg">{methodConfig.title}</CardTitle>
                        <CardDescription>{methodConfig.description}</CardDescription>
                      </div>
                    </div>

                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => 
                        handleMethodToggle(methodConfig.method, checked)
                      }
                    />
                  </div>
                </CardHeader>

                {isEnabled && (
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${methodConfig.method}-fee`}>
                          Вартість доставки
                        </Label>
                        <div className="relative">
                          <Input
                            id={`${methodConfig.method}-fee`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={fee}
                            onChange={(e) => 
                              handleFeeChange(methodConfig.method, e.target.value)
                            }
                            placeholder="0.00"
                            className="pr-12"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                            грн
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {fee === 0 ? 'Безкоштовно' : `Вартість: ${formatCurrency(fee)}`}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Додаткова інформація</Label>
                        <div className="p-3 bg-muted rounded-robot-sm">
                          <p className="text-sm text-muted-foreground">
                            {methodConfig.method === 'pickup' && 
                              'Клієнти можуть забрати замовлення безпосередньо в ресторані'
                            }
                            {methodConfig.method === 'courier' && 
                              'Доставка здійснюється професійними кур\'єрами'
                            }
                            {methodConfig.method === 'self' && 
                              'Доставка власним транспортом ресторану'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        <Card className="border-robot-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Підсумок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Активні методи доставки:
              </p>
              
              {settings.filter(s => s.enabled).length === 0 ? (
                <p className="text-sm font-medium text-destructive">
                  Не обрано жодного методу доставки
                </p>
              ) : (
                <ul className="space-y-1">
                  {settings
                    .filter(s => s.enabled)
                    .map(setting => {
                      const methodConfig = DELIVERY_METHODS.find(m => m.method === setting.method);
                      return (
                        <li key={setting.method} className="flex justify-between items-center text-sm">
                          <span>{methodConfig?.title}</span>
                          <span className="font-medium">
                            {setting.delivery_fee === 0 
                              ? 'Безкоштовно' 
                              : formatCurrency(setting.delivery_fee)
                            }
                          </span>
                        </li>
                      );
                    })
                  }
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Actions */}
        {hasChanges && (
          <Card className="border-robot-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-robot-primary">Є незбережені зміни</p>
                  <p className="text-sm text-muted-foreground">
                    Збережіть зміни, щоб оновити налаштування доставки
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSettings(location?.delivery_settings || []);
                      setHasChanges(false);
                    }}
                  >
                    Скасувати
                  </Button>
                  
                  <Button 
                    onClick={handleSave}
                    disabled={updateDeliverySettings.isPending}
                  >
                    {updateDeliverySettings.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Збереження...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Зберегти зміни
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}