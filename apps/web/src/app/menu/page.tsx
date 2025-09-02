'use client';

import { useState, useEffect } from 'react';
import { useCategories, useItems } from '@/lib/robot-queries';
import { CategorySidebar } from '@/components/category-sidebar';
import { ItemsTable } from '@/components/items-table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Menu as MenuIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import robotApi from '@/lib/robot-api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MenuPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { 
    data: categories, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useCategories();

  const { 
    data: items, 
    isLoading: itemsLoading, 
    error: itemsError,
    refetch: refetchItems
  } = useItems(selectedCategoryId || undefined);

  // Check authentication
  useEffect(() => {
    if (!robotApi.isAuthenticated()) {
      router.push('/auth-group/login');
      return;
    }
  }, [router]);

  // Auto-select first category when categories load
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const selectedCategory = categories?.find(cat => cat.id === selectedCategoryId);
  const categoryItems = items || [];

  if (categoriesError || itemsError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-destructive mb-4">
              ⚠️ Помилка завантаження даних
            </div>
            <p className="text-muted-foreground mb-4">
              {categoriesError?.message || itemsError?.message}
            </p>
            <Button onClick={() => window.location.reload()}>
              Спробувати знову
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-surface border-b border-border px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden cursor-pointer"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center shadow-sm">
                <span className="text-white text-xl">🤖</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-ink">ROBOT Admin</h1>
                <p className="text-sm text-muted-foreground">Управління меню</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              asChild 
              className="bg-primary text-white hover:opacity-90 cursor-pointer shadow-sm"
            >
              <Link href="/menu/item/new">
                <Plus className="h-4 w-4 mr-2" />
                Додати страву
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={async () => {
                await robotApi.logout();
                router.push('/auth-group/login');
              }}
              className="cursor-pointer"
            >
              Вихід
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar - Categories */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed lg:relative lg:translate-x-0
          z-30 w-80 bg-white border-r border-border
          transition-transform duration-200 ease-in-out
          lg:block
        `}>
          <CategorySidebar
            categories={categories || []}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            loading={categoriesLoading}
          />
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-gray-50/30">
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Завантаження категорій...</p>
              </div>
            </div>
          ) : !selectedCategory ? (
            <Card className="shadow-card border-0">
              <CardContent className="pt-12 text-center py-16">
                <div className="text-6xl mb-6">🍽️</div>
                <h2 className="text-2xl font-semibold mb-3 text-ink">Створіть першу категорію</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Почніть з додавання категорії для організації вашого меню. Категорії допомагають структурувати страви та полегшують навігацію.
                </p>
                <Button className="bg-primary text-white hover:opacity-90 cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Створити категорію
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Category Header */}              
              <div className="bg-surface rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-ink">
                      {selectedCategory.name.ua}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {categoryItems.length} {categoryItems.length === 1 ? 'страва' : 'страв'} у категорії
                    </p>
                  </div>
                  
                  <Button 
                    asChild 
                    className="bg-primary text-white hover:opacity-90 cursor-pointer"
                  >
                    <Link href={`/menu/item/new?category=${selectedCategoryId}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Додати страву
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Items Table */}
              <ItemsTable 
                items={categoryItems}
                loading={itemsLoading}
                onRefetch={refetchItems}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}