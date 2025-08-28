'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateTask, useUpdateTask } from '@/lib/queries';
import { createTaskSchema, updateTaskSchema, CreateTaskFormData, UpdateTaskFormData } from '@/lib/validations';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types/task';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task; // If provided, this is edit mode
  mode?: 'create' | 'edit';
}

export function TaskForm({ open, onOpenChange, task, mode = 'create' }: TaskFormProps) {
  const { toast } = useToast();
  const isEdit = mode === 'edit' && task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormData | UpdateTaskFormData>({
    resolver: zodResolver(isEdit ? updateTaskSchema : createTaskSchema),
    defaultValues: isEdit
      ? {
          title: task.title,
          description: task.description || '',
        }
      : {
          title: '',
          description: '',
        },
  });

  const createTask = useCreateTask({
    onSuccess: () => {
      toast({
        title: 'Успіх!',
        description: 'Завдання успішно створено',
        variant: 'success',
      });
      reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Помилка',
        description: error.message || 'Не вдалося створити завдання',
        variant: 'destructive',
      });
    },
  });

  const updateTask = useUpdateTask({
    onSuccess: () => {
      toast({
        title: 'Успіх!',
        description: 'Завдання успішно оновлено',
        variant: 'success',
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Помилка',
        description: error.message || 'Не вдалося оновити завдання',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateTaskFormData | UpdateTaskFormData) => {
    if (isEdit && task) {
      updateTask.mutate({
        id: task.id,
        input: data as UpdateTaskFormData,
      });
    } else {
      createTask.mutate(data as CreateTaskFormData);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Редагувати завдання' : 'Створити завдання'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Введіть заголовок завдання"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Опис (необов'язково)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Введіть опис завдання"
              disabled={isSubmitting}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Скасувати
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEdit
                  ? 'Оновлення...'
                  : 'Створення...'
                : isEdit
                ? 'Оновити'
                : 'Створити'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}