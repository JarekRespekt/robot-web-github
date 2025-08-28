'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/status-badge';
import { TaskForm } from '@/components/task-form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useTasks, useDeleteTask } from '@/lib/queries';
import { useToast } from '@/hooks/use-toast';
import { formatRelativeTime } from '@/lib/utils';
import { Task } from '@/types/task';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface DataTableProps {
  initialSearch?: string;
}

export function DataTable({ initialSearch = '' }: DataTableProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Data fetching
  const { 
    data, 
    isLoading, 
    error 
  } = useTasks({ 
    search: search || undefined, 
    page, 
    limit 
  });

  // Delete mutation
  const deleteTask = useDeleteTask({
    onSuccess: () => {
      toast({
        title: 'Успіх!',
        description: 'Завдання успішно видалено',
        variant: 'success',
      });
      setDeletingTask(null);
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
    if (deletingTask) {
      deleteTask.mutate(deletingTask.id);
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;
  const canPrevious = page > 1;
  const canNext = page < totalPages;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Помилка завантаження: {error.message}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Спробувати знову
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Завдання</h1>
          <p className="text-muted-foreground">
            Управління вашими завданнями
            {data && ` (${data.total} всього)`}
          </p>
        </div>
        
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Створити завдання
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Пошук за заголовком..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page when searching
            }}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Заголовок</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Оновлено</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  <p className="mt-2 text-muted-foreground">Завантаження завдань...</p>
                </TableCell>
              </TableRow>
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <p className="text-muted-foreground">
                    {search ? 'Завдань не знайдено' : 'Немає завдань для відображення'}
                  </p>
                  {!search && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateForm(true)}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Створити перше завдання
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRelativeTime(task.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/tasks/${task.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingTask(task)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setDeletingTask(task)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Показано {((page - 1) * limit) + 1} - {Math.min(page * limit, data.total)} з {data.total} завдань
          </p>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!canPrevious}
            >
              <ChevronLeft className="w-4 h-4" />
              Попередня
            </Button>
            
            <span className="text-sm">
              Сторінка {page} з {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!canNext}
            >
              Наступна
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <TaskForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        mode="create"
      />

      <TaskForm
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        task={editingTask || undefined}
        mode="edit"
      />

      <ConfirmDialog
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        title="Видалити завдання"
        description={`Ви впевнені, що хочете видалити завдання "${deletingTask?.title}"? Цю дію неможливо скасувати.`}
        confirmLabel="Видалити"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteTask.isPending}
      />
    </div>
  );
}