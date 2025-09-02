'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ImageUploader } from '@/components/image-uploader';
import { ArrowLeft, Save, Loader2, MenuIcon } from 'lucide-react';
import { useCategories, useCreateItem } from '@/lib/robot-queries';
import { useToast } from '@/hooks/use-toast';
import { createEmptyI18nStr, LOCALE_FLAGS, LOCALE_NAMES } from '@/lib/i18n';
import robotApi from '@/lib/robot-api';
import Link from 'next/link';
import type { I18nStr } from '@/types/robot';

const itemSchema = z.object({
  category_id: z.string().min(1, 'Оберіть категорію'),
  name: z.object({
    ua: z.string().min(1, 'Назва українською обов\'язкова'),
    pl: z.string().min(1, 'Назва польською обов\'язкова'),
    en: z.string().min(1, 'Назва англійською обов\'язкова'),
    by: z.string().min(1, 'Назва білоруською обов\'язкова'),
  }),
  description: z.object({
    ua: z.string(),
    pl: z.string(),
    en: z.string(),
    by: z.string(),
  }),
  price: z.number().min(0, 'Ціна повинна бути позитивною'),
  packaging_price: z.number().min(0, 'Ціна упаковки повинна бути позитивною').optional(),
  photo_url: z.string().optional(),
  available: z.boolean(),
});

type ItemFormData = z.infer<typeof itemSchema>;

function CreateItemContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  const createItem = useCreateItem({
    onSuccess: () => {
      toast({
        title: 'Успіх!',
        description: 'Страву створено успішно',
        variant: 'success',
      });
      router.push('/menu');
    },
    onError: (error) => {
      toast({
        title: 'Помилка',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      category_id: searchParams.get('category') || '',
      name: createEmptyI18nStr(),
      description: createEmptyI18nStr(),
      price: 0,
      packaging_price: 0,
      photo_url: undefined,
      available: true,
    },
  });

  const watchedPrice = watch('price') || 0;
  const watchedPackagingPrice = watch('packaging_price') || 0;
  const totalPrice = watchedPrice + watchedPackagingPrice;

  useEffect(() => {
    setValue('photo_url', imageUrl);
  }, [imageUrl, setValue]);

  const onSubmit = async (data: ItemFormData) => {
    try {
      await createItem.mutateAsync({
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        price: data.price,
        packaging_price: data.packaging_price || 0,
        available: data.available,
        photo: data.photo_url ? {
          public_id: '',
          url: data.photo_url,
        } : undefined,
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const languageFields = [
    { key: 'ua' as const, name: 'Українська', flag: '🇺🇦' },
    { key: 'pl' as const, name: 'Польська', flag: '🇵🇱' },
    { key: 'en' as const, name: 'Англійська', flag: '🇺🇸' },
    { key: 'by' as const, name: 'Білоруська', flag: '🇧🇾' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Header */}
      <div className="bg-primary border-b border-primary-foreground/20 shadow-sm sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center shadow-sm">
                  <span className="text-primary text-xl">🤖</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">ROBOT Admin</h1>
                  <p className="text-sm text-primary-foreground/80">Створення нової страви</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push('/menu')}
                className="cursor-pointer border-white/30 text-white hover:bg-surface hover:text-ink"
              >
                Назад до меню
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Sidebar */}
        <div className="w-64 bg-white border-r border-border h-full">
          <nav className="p-4 space-y-2">
            <Button
              variant="secondary"
              className="w-full justify-start cursor-pointer bg-surface text-ink"
              onClick={() => router.push('/menu')}
            >
              <MenuIcon className="h-5 w-5 mr-3" />
              Меню
            </Button>
          </nav>
        </div>

        {/* Category Navigation */}
        <div className="w-80 bg-white border-r border-border h-full">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-ink">Категорії</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {categoriesLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Завантаження...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories?.map((category) => (
                  <div
                    key={category.id}
                    className={`
                      group flex items-center space-x-2 p-3 rounded-md border transition-colors cursor-pointer
                      ${selectedCategoryId === category.id
                        ? 'bg-surface border-primary' 
                        : 'bg-white border-border hover:border-primary/50'
                      }
                    `}
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    <span className={`font-medium truncate ${
                      selectedCategoryId === category.id ? 'text-primary' : ''
                    }`}>
                      {category.name.ua}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Form */}
        <div className="flex-1 overflow-auto bg-gray-50/30">
          <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-6">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="cursor-pointer"
          >
            <Link href="/menu">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад до меню
            </Link>
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-ink">Створення нової страви</h1>
            <p className="text-muted-foreground mt-1">Додайте інформацію про нову страву до меню</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Information Card */}
          <Card className="shadow-card border-0">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <h2 className="text-lg font-semibold text-ink">Основна інформація</h2>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category">Категорія *</Label>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={categoriesLoading}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Оберіть категорію..." />
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

              {/* Availability Switch */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface/50">
                <div>
                  <Label htmlFor="available" className="text-base font-medium">Доступна для замовлення</Label>
                  <p className="text-sm text-muted-foreground">Чи можуть клієнти замовляти цю страву</p>
                </div>
                <Controller
                  name="available"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="available"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Multi-language Names */}
          <Card className="shadow-card border-0">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <h2 className="text-lg font-semibold text-ink">Назва страви</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {languageFields.map((lang) => (
                  <div key={lang.key} className="space-y-2">
                    <Label htmlFor={`name-${lang.key}`} className="flex items-center space-x-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name} *</span>
                    </Label>
                    <Input
                      id={`name-${lang.key}`}
                      {...register(`name.${lang.key}`)}
                      placeholder={`Введіть назву ${lang.name.toLowerCase()}...`}
                      disabled={isSubmitting}
                    />
                    {errors.name?.[lang.key] && (
                      <p className="text-sm text-destructive">{errors.name[lang.key]?.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Multi-language Descriptions */}
          <Card className="shadow-card border-0">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <h2 className="text-lg font-semibold text-ink">Опис страви</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {languageFields.map((lang) => (
                  <div key={lang.key} className="space-y-2">
                    <Label htmlFor={`desc-${lang.key}`} className="flex items-center space-x-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </Label>
                    <Textarea
                      id={`desc-${lang.key}`}
                      {...register(`description.${lang.key}`)}
                      placeholder={`Опишіть страву ${lang.name.toLowerCase()}...`}
                      disabled={isSubmitting}
                      rows={3}
                    />
                    {errors.description?.[lang.key] && (
                      <p className="text-sm text-destructive">{errors.description[lang.key]?.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="shadow-card border-0">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <h2 className="text-lg font-semibold text-ink">Ціноутворення</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Основна ціна *</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('price', { valueAsNumber: true })}
                      placeholder="150.00"
                      disabled={isSubmitting}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      грн
                    </span>
                  </div>
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packaging_price">Упаковка</Label>
                  <div className="relative">
                    <Input
                      id="packaging_price"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('packaging_price', { valueAsNumber: true })}
                      placeholder="15.00"
                      disabled={isSubmitting}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      грн
                    </span>
                  </div>
                  {errors.packaging_price && (
                    <p className="text-sm text-destructive">{errors.packaging_price.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Додаткова плата за упаковку</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Загальна вартість</Label>
                  <div className="flex items-center h-10 px-3 bg-surface rounded-md border">
                    <span className="text-lg font-semibold text-ink">
                      {totalPrice.toFixed(2)} грн
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Вартість для клієнта</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card className="shadow-card border-0">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center space-x-2 pb-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <h2 className="text-lg font-semibold text-ink">Фото страви</h2>
              </div>

              <ImageUploader
                value={imageUrl ? { public_id: '', url: imageUrl } : undefined}
                onChange={(image) => setImageUrl(image?.url || '')}
                disabled={isSubmitting}
              />
              {errors.photo_url && (
                <p className="text-sm text-destructive">{errors.photo_url.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/menu')}
                  disabled={isSubmitting}
                  className="cursor-pointer"
                >
                  Скасувати
                </Button>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-white hover:opacity-90 cursor-pointer disabled:opacity-50"
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
            </CardContent>
          </Card>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewItemPage() {
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    if (!robotApi.isAuthenticated()) {
      router.push('/auth-group/login');
      return;
    }
  }, [router]);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Завантаження...</p>
        </div>
      </div>
    }>
      <CreateItemContent />
    </Suspense>
  );
}