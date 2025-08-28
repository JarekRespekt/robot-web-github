import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { TaskDetailClient } from './task-detail-client';
import { ArrowLeft } from 'lucide-react';

interface TaskDetailPageProps {
  params: { id: string };
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/tasks">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад до списку
            </Link>
          </Button>
        </div>

        {/* Task Detail Content */}
        <TaskDetailClient taskId={params.id} />
      </div>
    </div>
  );
}