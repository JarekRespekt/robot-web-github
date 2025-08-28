import { DataTable } from '@/components/data-table';

interface TasksPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function TasksPage({ searchParams }: TasksPageProps) {
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';

  return (
    <div className="container mx-auto py-8">
      <DataTable initialSearch={search} />
    </div>
  );
}