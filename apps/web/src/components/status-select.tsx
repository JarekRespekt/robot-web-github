'use client';

import { Task } from '@/types/task';
import { Badge } from '@/components/ui/badge';

interface StatusSelectProps {
  status: Task['status'];
  onChange?: (status: Task['status']) => void;
  disabled?: boolean;
}

const statusOptions = [
  { value: 'new', label: 'Нове', variant: 'info' as const },
  { value: 'in_progress', label: 'В роботі', variant: 'warning' as const },
  { value: 'done', label: 'Виконано', variant: 'success' as const },
  { value: 'failed', label: 'Помилка', variant: 'destructive' as const },
] as const;

export function StatusSelect({ status, onChange, disabled = false }: StatusSelectProps) {
  const currentStatus = statusOptions.find(option => option.value === status);

  if (!onChange || disabled) {
    return <Badge variant={currentStatus?.variant}>{currentStatus?.label}</Badge>;
  }

  return (
    <select 
      value={status} 
      onChange={(e) => onChange(e.target.value as Task['status'])}
      className="text-sm border rounded px-2 py-1"
      disabled={disabled}
    >
      {statusOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}