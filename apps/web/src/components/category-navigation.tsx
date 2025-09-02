'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CategoryModal } from '@/components/category-modal';
import { 
  Search, 
  Plus, 
  GripVertical, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2,
  Loader2
} from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/lib/robot-queries';
import { useToast } from '@/hooks/use-toast';
import { getLocalizedText } from '@/lib/i18n';
import type { Category } from '@/types/robot';

interface CategoryNavigationProps {
  isOpen: boolean;
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryNavigation({ 
  isOpen, 
  selectedCategoryId, 
  onSelectCategory 
}: CategoryNavigationProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    data: categories, 
    isLoading: categoriesLoading 
  } = useCategories();

  const createCategory = useCreateCategory({
    onSuccess: () => {
      toast({
        title: 'Успіх!',
        description: 'Категорію створено успішно',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Помилка',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateCategory = () => {
    const newCategory = {
      name: {
        ua: 'Нова категорія',
        pl: 'Nowa kategoria',
        en: 'New category',
      },
      description: {
        ua: '',
        pl: '',
        en: '',
      },
      visible: true,
      order: (categories?.length || 0) + 1,
    };

    createCategory.mutate(newCategory);
  };

  // Filter categories based on search
  const filteredCategories = (categories || []).filter(category =>
    getLocalizedText(category.name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  if (categoriesLoading) {
    return (
      <div className="w-80 bg-white border-r border-border h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Завантаження категорій...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-border h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink">Категорії</h2>
          <Button 
            size="sm" 
            className="bg-primary text-white hover:opacity-90 cursor-pointer"
            onClick={handleCreateCategory}
            disabled={createCategory.isPending}
          >
            {createCategory.isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-1" />
            )}
            Нова
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Пошук категорій..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'Категорій не знайдено' : 'Немає категорій'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className={`
                  group flex items-center space-x-2 p-3 rounded-md border transition-colors cursor-pointer
                  ${selectedCategoryId === category.id
                    ? 'bg-surface border-primary' 
                    : 'bg-white border-border hover:border-primary/50'
                  }
                `}
                onClick={() => onSelectCategory(category.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium truncate ${
                      selectedCategoryId === category.id ? 'text-primary' : ''
                    }`}>
                      {getLocalizedText(category.name)}
                    </span>
                    {!category.visible && (
                      <Badge variant="secondary" className="text-xs">
                        Прихована
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Toggle visibility
                    }}
                  >
                    {category.visible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Edit category
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Delete category
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="p-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Всього: {categories?.length || 0} {(categories?.length || 0) === 1 ? 'категорія' : 'категорій'}
        </div>
      </div>
    </div>
  );
}