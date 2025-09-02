'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, 'Назва категорії обов\'язкова'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  isLoading?: boolean;
  initialName?: string;
  title?: string;
  description?: string;
}

export function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialName = '',
  title = 'Створити категорію',
  description = 'Введіть назву нової категорії меню',
}: CategoryModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialName,
    },
  });

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      await onSubmit(data.name);
      reset();
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-ink">{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Назва категорії</Label>
            <Input
              id="category-name"
              {...register('name')}
              placeholder="Наприклад: Перші страви"
              disabled={isLoading}
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-white hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Створення...
                </>
              ) : (
                initialName ? 'Зберегти' : 'Створити'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}