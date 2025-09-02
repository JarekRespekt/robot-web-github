'use client';

import { useEffect, useState } from 'react';
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
      phone: '',
      hours: DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day.key] = { open: '09:00', close: '22:00', closed: false };
        return acc;
      }, {} as any),
      socials: {
        facebook: '',
        instagram: '',
        tiktok: '',
      },
    },
  });

  // Watch for changes
  const watchedFields = watch();
  
  // Check authentication
  useEffect(() => {
    if (!robotApi.isAuthenticated()) {
      router.push('/auth-group/login');
    }
  }, [router]);

  // Initialize form with location data
  useEffect(() => {
    if (location) {
      reset({
        name: location.name || '',
        address: location.address || 'Jutrzenki 156',
        phone: location.phone || '',
        hours: location.hours ? { ...location.hours } : DAYS_OF_WEEK.reduce((acc, day) => {
          acc[day.key] = { open: '09:00', close: '22:00', closed: false };
          return acc;
        }, {} as any),
        socials: {
          facebook: location.socials?.facebook || '',
          instagram: location.socials?.instagram || '',
          tiktok: location.socials?.tiktok || '',
        },
      });
    }
  }, [location, reset]);

  // Track changes
  useEffect(() => {
    if (location) {
      setHasChanges(true); // Any watch change means changes exist
    }
  }, [watchedFields, location]);

  const onSubmit = async (data: FormData) => {
    if (!location) {
      toast({
        title: 'Помилка',
        description: 'Локація не знайдена',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updateData: UpdateLocationRequest = {
        name: data.name,
        address: data.address,
        phone: data.phone || undefined,
        hours: data.hours,
        socials: {
          facebook: data.socials.facebook || undefined,
          instagram: data.socials.instagram || undefined,
          tiktok: data.socials.tiktok || undefined,
        },
      };

      await updateLocation.mutateAsync({
        id: location.id,
        data: updateData,
      });

      toast({
        title: 'Успіх!',
        description: 'Налаштування локації збережено',
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
          <p className="text-muted-foreground">Завантаження налаштувань локації...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-robot-surface p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/menu">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад до меню
              </Link>
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold robot-ink">Налаштування локацій</h1>
              <p className="text-muted-foreground">
                Керуйте адресою, годинами роботи та контактами
              </p>
            </div>
          </div>

          {hasChanges && (
            <Button 
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card className="robot-card-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-robot-primary" />
                <CardTitle>Основна інформація</CardTitle>
              </div>
              <CardDescription>
                Назва та адреса закладу
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Назва закладу</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Назва обов\'язкова' })}
                    placeholder="ROBOT Restaurant"
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="+380 XX XXX XX XX"
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Адреса</Label>
                <Input
                  id="address"
                  {...register('address', { required: 'Адреса обов\'язкова' })}
                  placeholder="Jutrzenki 156"
                  disabled={isSubmitting}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card className="robot-card-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-robot-primary" />
                <CardTitle>Години роботи</CardTitle>
              </div>
              <CardDescription>
                Встановіть графік роботи для кожного дня тижня
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {DAYS_OF_WEEK.map((day, index) => (
                <div key={day.key}>
                  {index > 0 && <Separator className="my-4" />}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-24">
                        <Label className="text-sm font-medium">{day.label}</Label>
                      </div>

                      <Controller
                        name={`hours.${day.key}.closed`}
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={!field.value} // Inverted: closed=false means open
                              onCheckedChange={(checked) => field.onChange(!checked)}
                              disabled={isSubmitting}
                            />
                            <Label className="text-sm text-muted-foreground">
                              {field.value ? 'Зачинено' : 'Відчинено'}
                            </Label>
                          </div>
                        )}
                      />
                    </div>

                    <Controller
                      name={`hours.${day.key}.closed`}
                      control={control}
                      render={({ field: closedField }) => (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Label className="text-sm text-muted-foreground">з</Label>
                            <Input
                              type="time"
                              {...register(`hours.${day.key}.open`)}
                              disabled={isSubmitting || closedField.value}
                              className="w-24"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Label className="text-sm text-muted-foreground">до</Label>
                            <Input
                              type="time"
                              {...register(`hours.${day.key}.close`)}
                              disabled={isSubmitting || closedField.value}
                              className="w-24"
                            />
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card className="robot-card-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-robot-primary" />
                <CardTitle>Соціальні мережі</CardTitle>
              </div>
              <CardDescription>
                Посилання на соціальні мережі закладу
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    {...register('socials.facebook')}
                    placeholder="https://facebook.com/robot"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    {...register('socials.instagram')}
                    placeholder="https://instagram.com/robot"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    {...register('socials.tiktok')}
                    placeholder="https://tiktok.com/@robot"
                    disabled={isSubmitting}
                  />
                </div>
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
                      Збережіть зміни, щоб оновити інформацію про локацію
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => {
                        if (location) {
                          reset({
                            name: location.name || '',
                            address: location.address || 'Jutrzenki 156',
                            phone: location.phone || '',
                            hours: location.hours || {},
                            socials: {
                              facebook: location.socials?.facebook || '',
                              instagram: location.socials?.instagram || '',
                              tiktok: location.socials?.tiktok || '',
                            },
                          });
                        }
                        setHasChanges(false);
                      }}
                      disabled={isSubmitting}
                    >
                      Скасувати
                    </Button>
                    
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
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
        </form>
      </div>
    </div>
  );
}