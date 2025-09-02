'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, MapPin, Phone, Clock, Globe, Instagram, Facebook, Loader2 } from 'lucide-react';
import { useLocations, useUpdateLocation } from '@/lib/robot-queries';
import { useToast } from '@/hooks/use-toast';
import { getLocalizedText } from '@/lib/i18n';

const DAYS_OF_WEEK = [
  { key: 'mon' as const, label: 'Понеділок' },
  { key: 'tue' as const, label: 'Вівторок' },
  { key: 'wed' as const, label: 'Середа' },
  { key: 'thu' as const, label: 'Четвер' },
  { key: 'fri' as const, label: 'П\'ятниця' },
  { key: 'sat' as const, label: 'Субота' },
  { key: 'sun' as const, label: 'Неділя' },
];

interface FormData {
  name: string;
  address: string;
  phone: string;
  hours: Record<string, { open: string; close: string; closed: boolean }>;
  socials: {
    facebook: string;
    instagram: string;
    tiktok: string;
  };
}

export function LocationsSettingsView() {
  const { toast } = useToast();
  const { data: locations, isLoading: locationsLoading } = useLocations();
  const updateLocation = useUpdateLocation();
  const [hasChanges, setHasChanges] = useState(false);

  // Get first location (assuming single location for admin)
  const location = locations?.[0];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      address: 'Jutrzenki 156', // Default seed address
      phone: '',
      hours: {
        mon: { open: '09:00', close: '22:00', closed: false },
        tue: { open: '09:00', close: '22:00', closed: false },
        wed: { open: '09:00', close: '22:00', closed: false },
        thu: { open: '09:00', close: '22:00', closed: false },
        fri: { open: '09:00', close: '22:00', closed: false },
        sat: { open: '10:00', close: '23:00', closed: false },
        sun: { open: '10:00', close: '21:00', closed: false },
      },
      socials: {
        facebook: '',
        instagram: '',
        tiktok: '',
      },
    },
  });

  // Load location data when available
  useEffect(() => {
    if (location) {
      reset({
        name: getLocalizedText(location.name),
        address: location.address || 'Jutrzenki 156',
        phone: location.phone || '',
        hours: location.hours || {
          mon: { open: '09:00', close: '22:00', closed: false },
          tue: { open: '09:00', close: '22:00', closed: false },
          wed: { open: '09:00', close: '22:00', closed: false },
          thu: { open: '09:00', close: '22:00', closed: false },
          fri: { open: '09:00', close: '22:00', closed: false },
          sat: { open: '10:00', close: '23:00', closed: false },
          sun: { open: '10:00', close: '21:00', closed: false },
        },
        socials: location.socials || {
          facebook: '',
          instagram: '',
          tiktok: '',
        },
      });
    }
  }, [location, reset]);

  // Watch for changes
  const watchedValues = watch();
  useEffect(() => {
    setHasChanges(true);
  }, [watchedValues]);

  const onSubmit = async (data: FormData) => {
    if (!location) {
      toast({
        title: 'Помилка',
        description: 'Локацію не знайдено',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updateData = {
        name: {
          ua: data.name,
          pl: data.name,
          en: data.name,
          by: data.name,
        },
        address: data.address,
        phone: data.phone,
        hours: data.hours,
        socials: data.socials,
      };

      await updateLocation.mutateAsync({
        id: location.id,
        data: updateData,
      });

      toast({
        title: 'Успіх!',
        description: 'Налаштування закладу оновлено',
        variant: 'success',
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося зберегти зміни',
        variant: 'destructive',
      });
    }
  };

  if (locationsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Завантаження налаштувань...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Налаштування закладу</h1>
          <p className="text-muted-foreground mt-1">Керуйте інформацією про ваш заклад</p>
        </div>
        
        {hasChanges && (
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-primary text-white hover:opacity-90 cursor-pointer"
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
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Information */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              Загальна інформація
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Назва закладу</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Назва обов\'язкова' })}
                  placeholder="Назва вашого ресторану"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+380..."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Адреса</Label>
              <Textarea
                id="address"
                {...register('address', { required: 'Адреса обов\'язкова' })}
                placeholder="Вулиця, номер будинку, місто"
                disabled={isSubmitting}
                rows={2}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-primary" />
              Соціальні мережі
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center">
                  <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  {...register('socials.facebook')}
                  placeholder="https://facebook.com/your-page"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center">
                  <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  {...register('socials.instagram')}
                  placeholder="https://instagram.com/your-profile"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  {...register('socials.tiktok')}
                  placeholder="https://tiktok.com/@your-profile"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Години роботи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.key} className="flex items-center space-x-4">
                <div className="w-24">
                  <Label className="text-sm font-medium">{day.label}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    {...register(`hours.${day.key}.open`)}
                    disabled={isSubmitting || watch(`hours.${day.key}.closed`)}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="time"
                    {...register(`hours.${day.key}.close`)}
                    disabled={isSubmitting || watch(`hours.${day.key}.closed`)}
                    className="w-32"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={!watch(`hours.${day.key}.closed`)}
                    onCheckedChange={(checked) => {
                      // This would need custom handling with setValue
                    }}
                    disabled={isSubmitting}
                  />
                  <Label className="text-sm">Відкрито</Label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}