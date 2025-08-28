'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { TaskForm } from '@/components/task-form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useTask, useDeleteTask } from '@/lib/queries';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TaskDetailClientProps {
  taskId: string;
}

export function TaskDetailClient({ taskId }: TaskDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: task, isLoading, error } = useTask(taskId);

  const deleteTask = useDeleteTask({
    onSuccess: () => {
      toast({
        title: 'Успіх!',
        description: 'Завдання успішно видалено',
        variant: 'success',
      });
      router.push('/tasks');
    },
    onError: (error) => {
      toast({
        title: 'Помилка',
        description: error.message || 'Не вдалося видалити завдання',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = () => {
    if (task) {
      deleteTask.mutate(task.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Завантаження завдання...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-destructive mb-4">Помилка завантаження: {error.message}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Спробувати знову
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!task) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground">Завдання не знайдено</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              <div className="flex items-center space-x-4">
                <StatusBadge status={task.status} />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowEditForm(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Редагувати
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2 text-destructive" />
                Видалити
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          {task.description ? (
            <div>
              <h3 className="font-semibold mb-2">Опис</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold mb-2">Опис</h3>
              <p className="text-muted-foreground italic">Опис не вказано</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Створено</h4>
              <p className="text-sm">{formatDate(task.createdAt)}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Останнє оновлення</h4>
              <p className="text-sm">{formatDate(task.updatedAt)}</p>
            </div>
          </div>

          {/* Task ID for reference */}
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm text-muted-foreground mb-1">ID завдання</h4>
            <p className="text-sm font-mono">{task.id}</p>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <TaskForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        task={task}
        mode="edit"
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Видалити завдання"
        description={`Ви впевнені, що хочете видалити завдання "${task.title}"? Цю дію неможливо скасувати.`}
        confirmLabel="Видалити"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteTask.isPending}
      />
    </>
  );
}