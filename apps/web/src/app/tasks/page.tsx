import { DataTable } from '@/components/data-table';

interface TasksPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : '';

  return (
    <div className="container mx-auto py-8">
      <DataTable initialSearch={search} />
    </div>
  );
}