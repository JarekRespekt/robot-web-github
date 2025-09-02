'use client';

import { useState, useEffect } from 'react';
import { useCategories, useItems } from '@/lib/robot-queries';
import { AdminHeader } from '@/components/admin-header';
import { AdminSidebar } from '@/components/admin-sidebar';
import { CategoryNavigation } from '@/components/category-navigation'; 
import { ItemsTable } from '@/components/items-table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import robotApi from '@/lib/robot-api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MenuPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'menu' | 'locations' | 'delivery'>('menu');
  const [isMenuOpen, setIsMenuOpen] = useState(true);

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

  const handleMenuToggle = () => {
    setCurrentView('menu');
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLocationClick = () => {
    setCurrentView('locations');
    setIsMenuOpen(false);
  };

  const handleDeliveryClick = () => {
    setCurrentView('delivery');
    setIsMenuOpen(false);
  };

  if (categoriesError || itemsError) {
    return (
      <div className="min-h-screen bg-white">
        <AdminHeader />
        <div className="flex items-center justify-center p-4 py-20">
          <Card className="max-w-md w-full shadow-card">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Header */}
      <AdminHeader />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Sidebar */}
        <AdminSidebar 
          onMenuClick={handleMenuToggle}
          onLocationClick={handleLocationClick}
          onDeliveryClick={handleDeliveryClick}
          isMenuOpen={isMenuOpen && currentView === 'menu'}
          currentView={currentView}
        />

        {/* Category Navigation - Only show for menu */}
        {currentView === 'menu' && (
          <CategoryNavigation 
            isOpen={isMenuOpen}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50/30">
          {currentView === 'menu' && (
            <>
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Завантаження категорій...</p>
                  </div>
                </div>
              ) : !selectedCategory ? (
                <div className="p-6">
                  <Card className="shadow-card border-0">
                    <CardContent className="pt-12 text-center py-16">
                      <div className="text-6xl mb-6">🍽️</div>
                      <h2 className="text-2xl font-semibold mb-3 text-ink">Створіть першу категорію</h2>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Почніть з додавання категорії для організації вашого меню. Категорії допомагають структурувати страви та полегшують навігацію.
                      </p>
                      <Button 
                        className="bg-primary text-white hover:opacity-90 cursor-pointer"
                        onClick={handleMenuToggle}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Відкрити панель категорій
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="p-6 space-y-6">
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
            </>
          )}

          {currentView === 'locations' && (
            <LocationsSettingsView />
          )}

          {currentView === 'delivery' && (
            <div className="p-6">
              <Card className="shadow-card border-0">
                <CardContent className="pt-12 text-center py-16">
                  <div className="text-6xl mb-6">🚚</div>
                  <h2 className="text-2xl font-semibold mb-3 text-ink">Налаштування доставки</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Самовивіз, доставка та можливість створення нових методів доставки буде додана найближчим часом.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}