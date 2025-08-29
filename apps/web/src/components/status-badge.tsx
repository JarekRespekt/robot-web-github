import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/task";

interface StatusBadgeProps {
  status: Task['status'];
  className?: string;
}

const statusConfig = {
  new: {
    variant: 'info' as const,
    label: 'Нове',
  },
  in_progress: {
    variant: 'warning' as const,
    label: 'В роботі',
  },
  done: {
    variant: 'success' as const,
    label: 'Виконано',
  },
  failed: {
    variant: 'destructive' as const,
    label: 'Помилка',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}