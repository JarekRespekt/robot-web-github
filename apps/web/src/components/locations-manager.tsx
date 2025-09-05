'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  MapPin, 
  Phone, 
  Clock, 
  Globe, 
  Instagram, 
  Facebook,
  ChevronDown,
  ChevronRight,
  Save,
  Loader2,
  Building,
  Edit,
  Trash2
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLocations, useUpdateLocation } from '@/lib/robot-queries';
import { useToast } from '@/hooks/use-toast';
import type { Location } from '@/types/robot';

const DAYS_OF_WEEK = [
  { key: 'mon' as const, label: 'Понеділок' },
  { key: 'tue' as const, label: 'Вівторок' },
  { key: 'wed' as const, label: 'Середа' },
  { key: 'thu' as const, label: 'Четвер' },
  { key: 'fri' as const, label: 'П\'ятниця' },
  { key: 'sat' as const, label: 'Субота' },
  { key: 'sun' as const, label: 'Неділя' },
];

interface LocationFormData {
  name: string;
  address: string;
  phone: string;
  hours: Record<string, { open: string; close: string; closed: boolean }>;
  socials: {
    facebook: string;
    instagram: string;
    tiktok: string;
  };
  banking: {
    bank_name: string;
    account_holder: string;
    iban: string;
    swift: string;
  };
  establishment_enabled: boolean;
}

interface LocationBlockProps {
  location: Location;
  onUpdate: (locationId: string, data: Partial<LocationFormData>) => void;
  isUpdating: boolean;
}

function LocationBlock({ location, onUpdate, isUpdating }: LocationBlockProps) {
  const [isGeneralOpen, setIsGeneralOpen] = useState(false);
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const { register, handleSubmit, watch, setValue } = useForm<LocationFormData>({
    defaultValues: {
      name: location.name || '',
      address: location.address || '',
      phone: location.phone || '',
      hours: location.hours || {},
      socials: location.socials || { facebook: '', instagram: '', tiktok: '' },
      banking: {
        bank_name: '',
        account_holder: '',
        iban: '',
        swift: ''
      },
      establishment_enabled: true,
    }
  });

  const onSubmit = (data: LocationFormData) => {
    onUpdate(location.id, data);
  };

  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-primary" />
            {location.name || 'Заклад без назви'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-1" />
              Редагувати
            </Button>
            <Button size="sm" variant="outline">
              <Trash2 className="h-4 w-4 mr-1" />
              Видалити
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Establishment Status */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface/50">
          <div>
            <Label className="text-base font-medium">Заклад працює</Label>
            <p className="text-sm text-muted-foreground">Вимкніть, якщо заклад тимчасово закритий</p>
          </div>
          <Switch
            {...register('establishment_enabled')}
            disabled={isUpdating}
          />
        </div>

        {/* Banking Information */}
        <Card className="border border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Globe className="h-4 w-4 mr-2 text-primary" />
              Банківські дані
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`bank_name_${location.id}`}>Назва банку</Label>
                <Input
                  id={`bank_name_${location.id}`}
                  {...register('banking.bank_name')}
                  placeholder="ПриватБанк"
                  disabled={isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`account_holder_${location.id}`}>Власник рахунку</Label>
                <Input
                  id={`account_holder_${location.id}`}
                  {...register('banking.account_holder')}
                  placeholder="ТОВ 'Назва компанії'"
                  disabled={isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`iban_${location.id}`}>IBAN</Label>
                <Input
                  id={`iban_${location.id}`}
                  {...register('banking.iban')}
                  placeholder="UA21 3223 1300 0002 6007 2335 6600 1"
                  disabled={isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`swift_${location.id}`}>SWIFT код</Label>
                <Input
                  id={`swift_${location.id}`}
                  {...register('banking.swift')}
                  placeholder="PBANUA2X"
                  disabled={isUpdating}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="border border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Instagram className="h-4 w-4 mr-2 text-primary" />
              Соціальні мережі
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`facebook_${location.id}`}>Facebook</Label>
                <Input
                  id={`facebook_${location.id}`}
                  {...register('socials.facebook')}
                  placeholder="https://facebook.com/yourpage"
                  disabled={isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`instagram_${location.id}`}>Instagram</Label>
                <Input
                  id={`instagram_${location.id}`}
                  {...register('socials.instagram')}
                  placeholder="https://instagram.com/yourpage"
                  disabled={isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`tiktok_${location.id}`}>TikTok</Label>
                <Input
                  id={`tiktok_${location.id}`}
                  {...register('socials.tiktok')}
                  placeholder="https://tiktok.com/@yourpage"
                  disabled={isUpdating}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Information - Collapsible */}
        <Collapsible open={isGeneralOpen} onOpenChange={setIsGeneralOpen}>
          <CollapsibleTrigger asChild>
            <Card className="border border-border/50 cursor-pointer hover:bg-surface/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    Загальна інформація
                  </CardTitle>
                  {isGeneralOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="border border-border/50 mt-2">
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`name_${location.id}`}>Назва закладу</Label>
                    <Input
                      id={`name_${location.id}`}
                      {...register('name')}
                      placeholder="Назва вашого ресторану"
                      disabled={isUpdating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`phone_${location.id}`}>Телефон</Label>
                    <Input
                      id={`phone_${location.id}`}
                      {...register('phone')}
                      placeholder="+380501234567"
                      disabled={isUpdating}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`address_${location.id}`}>Адреса</Label>
                  <Input
                    id={`address_${location.id}`}
                    {...register('address')}
                    placeholder="вул. Хрещатик, 1, Київ, 01001"
                    disabled={isUpdating}
                  />
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Working Hours - Collapsible */}
        <Collapsible open={isHoursOpen} onOpenChange={setIsHoursOpen}>
          <CollapsibleTrigger asChild>
            <Card className="border border-border/50 cursor-pointer hover:bg-surface/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    Години роботи
                  </CardTitle>
                  {isHoursOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="border border-border/50 mt-2">
              <CardContent className="pt-4 space-y-3">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.key} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium">{day.label}</div>
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        {...register(`hours.${day.key}.open`)}
                        disabled={isUpdating || watch(`hours.${day.key}.closed`)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">до</span>
                      <Input
                        type="time"
                        {...register(`hours.${day.key}.close`)}
                        disabled={isUpdating || watch(`hours.${day.key}.closed`)}
                        className="w-32"
                      />
                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          {...register(`hours.${day.key}.closed`)}
                          disabled={isUpdating}
                        />
                        <Label className="text-sm">Вихідний</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSubmit(onSubmit)}
            disabled={isUpdating}
            className="bg-primary text-white hover:opacity-90"
          >
            {isUpdating ? (
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
      </CardContent>
    </Card>
  );
}

export function LocationsManager() {
  const { toast } = useToast();
  const { data: locations = [], isLoading: locationsLoading } = useLocations();
  const updateLocation = useUpdateLocation();

  const handleLocationUpdate = async (locationId: string, data: Partial<LocationFormData>) => {
    try {
      await updateLocation.mutateAsync({ id: locationId, data });
      toast({
        title: "Локацію оновлено",
        description: "Зміни успішно збережено",
      });
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося зберегти зміни",
        variant: "destructive",
      });
    }
  };

  const handleAddLocation = () => {
    // TODO: Implement add location functionality
    toast({
      title: "Функція в розробці",
      description: "Додавання нових локацій буде доступно незабаром",
    });
  };

  if (locationsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Завантаження локацій...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Налаштування закладів</h1>
          <p className="text-muted-foreground mt-1">
            Керуйте інформацією про ваші заклади
          </p>
        </div>
        
        <Button 
          onClick={handleAddLocation}
          className="bg-primary text-white hover:opacity-90 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Додати заклад
        </Button>
      </div>

      {/* Locations List */}
      {locations.length === 0 ? (
        <Card className="shadow-card border-0">
          <CardContent className="pt-12 text-center py-16">
            <div className="text-6xl mb-6">🏢</div>
            <h2 className="text-2xl font-semibold mb-3 text-ink">Немає закладів</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Додайте перший заклад для початку роботи з системою.
            </p>
            <Button 
              onClick={handleAddLocation}
              className="bg-primary text-white hover:opacity-90 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Додати заклад
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {locations.map((location) => (
            <LocationBlock
              key={location.id}
              location={location}
              onUpdate={handleLocationUpdate}
              isUpdating={updateLocation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}