'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, MapPin, Phone, Clock, Globe, Loader2 } from 'lucide-react';
import { useLocations, useUpdateLocation } from '@/lib/robot-queries';
import { useToast } from '@/hooks/use-toast';
import robotApi from '@/lib/robot-api';
import Link from 'next/link';
import type { Location, UpdateLocationRequest } from '@/types/robot';

const DAYS_OF_WEEK = [
  { key: 'mon' as const, label: 'Понеділок' },
  { key: 'tue' as const, label: 'Вівторок' },
  { key: 'wed' as const, label: 'Середа' },
  { key: 'thu' as const, label: 'Четвер' },
  { key: 'fri' as const, label: 'П\'ятниця' },
  { key: 'sat' as const, label: 'Субота' },
  { key: 'sun' as const, label: 'Неділя' },
];

type FormData = {
  name: string;
  address: string;
  phone: string;
  hours: Record<string, { open: string; close: string; closed: boolean }>;
  socials: {
    facebook: string;
    instagram: string;
    tiktok: string;
  };
};

export default function LocationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const { data: locations, isLoading: locationsLoading } = useLocations();
  const updateLocation = useUpdateLocation();

  const [hasChanges, setHasChanges] = useState(false);

  // Get first location (assuming single location for admin)
  const location = locations?.[0];

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      address: 'Jutrzenki 156', // Default seed address
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