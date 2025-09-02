'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, MapPin, Phone, Clock, Edit, Trash2, Loader2 } from 'lucide-react';
import { useLocations } from '@/lib/robot-queries';
import { useToast } from '@/hooks/use-toast';
import { getLocalizedText } from '@/lib/i18n';
import robotApi from '@/lib/robot-api';
import Link from 'next/link';
import type { Location } from '@/types/robot';

export default function LocationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const { data: locations, isLoading: locationsLoading, error } = useLocations();

  // Check authentication
  useEffect(() => {
    if (!robotApi.isAuthenticated()) {
      router.push('/auth-group/login');
      return;
    }
  }, [router]);

  const handleCreateLocation = () => {
    // TODO: Open create location modal
    toast({
      title: 'В розробці',
      description: 'Функція створення нових локацій буде додана найближчим часом',
      variant: 'default',
    });
  };

  const handleEditLocation = (location: Location) => {
    // TODO: Open edit location modal
    toast({
      title: 'В розробці', 
      description: 'Функція редагування локацій буде додана найближчим часом',
      variant: 'default',
    });
  };

  const handleDeleteLocation = (location: Location) => {
    // TODO: Open delete confirmation
    toast({
      title: 'В розробці',
      description: 'Функція видалення локацій буде додана найближчим часом',
      variant: 'default',
    });
  };

  if (locationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Завантаження локацій...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-card">
          <CardContent className="pt-6 text-center">
            <div className="text-destructive mb-4">⚠️ Помилка завантаження</div>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-primary text-white hover:opacity-90 cursor-pointer"
            >
              Спробувати знову
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild className="cursor-pointer">
                <Link href="/menu">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад до меню
                </Link>
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-ink">Управління локаціями</h1>
                <p className="text-muted-foreground mt-1">
                  Керування адресами, годинами роботи та контактами ваших закладів
                </p>
              </div>
            </div>

            <Button 
              onClick={handleCreateLocation}
              className="bg-primary text-white hover:opacity-90 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Додати локацію
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {!locations || locations.length === 0 ? (
          <Card className="shadow-card border-0">
            <CardContent className="pt-12 text-center py-16">
              <div className="text-6xl mb-6">📍</div>
              <h2 className="text-2xl font-semibold mb-3 text-ink">Додайте першу локацію</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Створіть локацію для вашого закладу з адресою, годинами роботи та контактною інформацією.
              </p>
              <Button 
                onClick={handleCreateLocation}
                className="bg-primary text-white hover:opacity-90 cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Створити локацію
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink">
                Ваші локації ({locations.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location) => (
                <Card key={location.id} className="shadow-card border-0 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-ink flex items-center">
                          <MapPin className="h-5 w-5 mr-2 text-primary" />
                          {getLocalizedText(location.name)}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {location.address}
                        </CardDescription>
                      </div>
                      
                      <Badge variant="secondary" className="ml-2">
                        Активна
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      {location.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          {location.phone}
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        Пн-Нд: 9:00 - 22:00
                      </div>
                    </div>

                    {/* Delivery Methods */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Методи доставки:</p>
                      <div className="flex flex-wrap gap-1">
                        {location.delivery_settings?.map((setting) => (
                          setting.enabled && (
                            <Badge key={setting.method} variant="outline" className="text-xs">
                              {setting.method === 'pickup' ? 'Самовивіз' : 
                               setting.method === 'courier' ? 'Кур\'єр' : 'Власна'}
                              {setting.delivery_fee > 0 && ` (+${setting.delivery_fee} грн)`}
                            </Badge>
                          )
                        )) || (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Не налаштовано
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditLocation(location)}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Редагувати
                      </Button>

                      {locations.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteLocation(location)}
                          className="text-destructive hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}