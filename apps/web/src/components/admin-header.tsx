'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, ChevronDown, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import robotApi from '@/lib/robot-api';

interface AdminHeaderProps {
  currentRestaurant?: string;
  restaurants?: Array<{ id: string; name: string; }>;
}

export function AdminHeader({ 
  currentRestaurant = '', 
  restaurants = [] 
}: AdminHeaderProps) {
  const router = useRouter();
  const [selectedRestaurant, setSelectedRestaurant] = useState(currentRestaurant);

  const handleLogout = async () => {
    await robotApi.logout();
    router.push('/');
  };

  const handleCreateRestaurant = () => {
    // TODO: Open create restaurant modal
    console.log('Create new restaurant');
  };

  return (
    <header className="bg-primary border-b border-primary-foreground/20 shadow-sm sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Restaurant Selector */}
          <div className="flex items-center space-x-6">
            {/* Restaurant Selector - MOVED TO LEFT */}
            <div className="flex items-center space-x-2">
              <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                <SelectTrigger className="w-64 bg-white border-white/20 text-ink">
                  <SelectValue placeholder="Оберіть заклад..." />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.length === 0 ? (
                    <SelectItem value="no-restaurants" disabled>
                      Немає доступних закладів
                    </SelectItem>
                  ) : (
                    restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))
                  )}
                  <div className="border-t pt-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCreateRestaurant}
                      className="w-full justify-start text-primary hover:text-primary hover:bg-surface"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Створити новий
                    </Button>
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Section - User Actions */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="cursor-pointer border-white/30 text-white hover:bg-surface hover:text-ink"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Вихід
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}