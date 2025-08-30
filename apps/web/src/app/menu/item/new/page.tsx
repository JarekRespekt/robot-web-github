'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { I18nInput } from '@/components/i18n-input';
import { ImageUploader } from '@/components/image-uploader';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useCategories, useCreateItem } from '@/lib/robot-queries';
import { useToast } from '@/hooks/use-toast';
import { createEmptyI18nStr, validateRequiredI18n } from '@/lib/i18n';
import robotApi from '@/lib/robot-api';
import Link from 'next/link';
import type { I18nStr, CreateItemRequest } from '@/types/robot';

// Zod schema for form validation
const createItemSchema = z.object({
  category_id: z.string().min(1, 'Оберіть категорію'),
  name: z.custom<I18nStr>(),
  description: z.custom<I18nStr>(),
  price: z.number().min(0, 'Ціна повинна бути додатною').max(10000, 'Ціна занадто велика'),
  packaging_price: z.number().min(0, 'Ціна упаковки повинна бути додатною').optional(),
  available: z.boolean(),
  photo: z.object({
    public_id: z.string(),
    url: z.string(),
  }).optional(),
});

type FormData = z.infer<typeof createItemSchema>;

function NewItemForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const preselectedCategory = searchParams.get('category');

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createItem = useCreateItem();

  const [nameErrors, setNameErrors] = useState<string[]>([]);
  const [descriptionErrors, setDescriptionErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      category_id: preselectedCategory || '',
      name: createEmptyI18nStr(),
      description: createEmptyI18nStr(),
      price: 0,
      packaging_price: undefined,
      available: true,
      photo: undefined,
    },
  });

  const watchedName = watch('name');
  const watchedDescription = watch('description');

  // Validate i18n fields on change
  useEffect(() => {
    const nameValidation = validateRequiredI18n(watchedName);
    setNameErrors(nameValidation);
  }, [watchedName]);

  useEffect(() => {
    const descriptionValidation = validateRequiredI18n(watchedDescription, []);
    setDescriptionErrors(descriptionValidation);
  }, [watchedDescription]);

  // Check authentication
  useEffect(() => {
    if (!robotApi.isAuthenticated()) {
      router.push('/auth-group/login');
    }
  }, [router]);

  const onSubmit = async (data: FormData) => {
    // Final validation for i18n fields
    const nameValidation = validateRequiredI18n(data.name);
    if (nameValidation.length > 0) {
      setNameErrors(nameValidation);
      toast({
        title: 'Помилка валідації',
        description: 'Заповніть назву українською мовою',
        variant: 'destructive',
      });
      return;
    }

    try {
      const itemData: CreateItemRequest = {
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        price: data.price,
        packaging_price: data.packaging_price || undefined,
        available: data.available,
        photo: data.photo,
      };

      await createItem.mutateAsync(itemData);

      toast({
        title: 'Успіх!',
        description: 'Страву створено успішно',
        variant: 'success',
      });

      router.push('/menu');
    } catch (error) {
      toast({
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалося створити страву',
        variant: 'destructive',
      });
    }
  };

  if (categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-robot-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-robot-surface p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/menu">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад до меню
            </Link>
          </Button>
        </div>

        {/* Main Form */}
        <Card className="robot-card-shadow">
          <CardHeader>
            <CardTitle className="robot-ink">Створити нову страву</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category">Категорія</Label>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Оберіть категорію" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name.ua}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category_id && (
                  <p className="text-sm text-destructive">{errors.category_id.message}</p>
                )}
              </div>

              {/* Name (i18n) */}
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <I18nInput
                    label="Назва страви"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Введіть назву страви"
                    required
                    error={nameErrors.length > 0 ? nameErrors[0] : undefined}
                    description="Назва страви різними мовами"
                  />
                )}
              />

              {/* Description (i18n) */}
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <I18nInput
                    label="Опис страви"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Опишіть страву"
                    multiline
                    rows={4}
                    description="Детальний опис інгредієнтів та способу приготування"
                  />
                )}
              />

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Ціна (грн)</Label>
                  <Input
                    {...register('price', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packaging_price">Упаковка (грн)</Label>
                  <Input
                    {...register('packaging_price', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00 (необов'язково)"
                    disabled={isSubmitting}
                  />
                  {errors.packaging_price && (
                    <p className="text-sm text-destructive">{errors.packaging_price.message}</p>
                  )}
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Фото страви</Label>
                <Controller
                  name="photo"
                  control={control}
                  render={({ field }) => (
                    <ImageUploader
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </div>

              {/* Availability */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="available"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                />
                <Label htmlFor="available">Доступна для замовлення</Label>
              </div>

              {/* Submit Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/menu')}
                  disabled={isSubmitting}
                >
                  Скасувати
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting || nameErrors.length > 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Створення...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Створити страву
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function NewItemPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-robot-primary" />
      </div>
    }>
      <NewItemForm />
    </Suspense>
  );
}