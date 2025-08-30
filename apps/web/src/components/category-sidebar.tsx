'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { getLocalizedText } from '@/lib/i18n';
import { useReorderCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/lib/robot-queries';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/types/robot';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  loading?: boolean;
}

interface SortableCategoryItemProps {
  category: Category;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: (categoryId: string, visible: boolean) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function SortableCategoryItem({ 
  category, 
  isSelected, 
  onSelect,
  onToggleVisibility,
  onEdit,
  onDelete 
}: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center space-x-2 p-3 rounded-robot-sm border transition-colors
        ${isSelected 
          ? 'bg-robot-primary/10 border-robot-primary' 
          : 'bg-white border-border hover:border-robot-primary/50'
        }
        ${isDragging ? 'shadow-lg' : ''}
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 -m-1 text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Category Content */}
      <div className="flex-1 min-w-0" onClick={onSelect}>
        <div className="flex items-center space-x-2 cursor-pointer">
          <span className={`font-medium truncate ${isSelected ? 'robot-primary' : ''}`}>
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
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(category.id, !category.visible);
          }}
          className="h-6 w-6 p-0"
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
          onClick={(e) => {
            e.stopPropagation();
            onEdit(category);
          }}
          className="h-6 w-6 p-0"
        >
          <Edit className="h-3 w-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(category);
          }}
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function CategorySidebar({ 
  categories, 
  selectedCategoryId, 
  onSelectCategory, 
  loading = false 
}: CategorySidebarProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [localCategories, setLocalCategories] = useState(categories);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const reorderCategories = useReorderCategories({
    onSuccess: () => {
      toast({
        title: 'Успіх!',
        description: 'Порядок категорій оновлено',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Помилка',
        description: error.message,
        variant: 'destructive',
      });
      // Revert local state on error
      setLocalCategories(categories);
    },
  });

  const updateCategory = useUpdateCategory({
    onSuccess: () => {
      toast({
        title: 'Успіх!',
        description: 'Категорію оновлено',
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

  // Sync local state with props
  useState(() => {
    setLocalCategories(categories);
  });

  // Filter categories based on search
  const filteredCategories = localCategories.filter(category =>
    getLocalizedText(category.name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = localCategories.findIndex(cat => cat.id === active.id);
      const newIndex = localCategories.findIndex(cat => cat.id === over?.id);

      const newOrder = arrayMove(localCategories, oldIndex, newIndex);
      setLocalCategories(newOrder);

      // Update order on server
      const reorderData = newOrder.map((cat, index) => ({
        id: cat.id,
        order: index + 1,
      }));

      reorderCategories.mutate({ categories: reorderData });
    }
  };

  const handleToggleVisibility = (categoryId: string, visible: boolean) => {
    updateCategory.mutate({
      id: categoryId,
      data: { visible },
    });
  };

  const handleEdit = (category: Category) => {
    // TODO: Open edit modal
    console.log('Edit category:', category);
  };

  const handleDelete = (category: Category) => {
    // TODO: Open delete confirmation
    console.log('Delete category:', category);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-robot-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold robot-ink">Категорії</h2>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredCategories.map(cat => cat.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {filteredCategories.map((category) => (
                  <SortableCategoryItem
                    key={category.id}
                    category={category}
                    isSelected={selectedCategoryId === category.id}
                    onSelect={() => onSelectCategory(category.id)}
                    onToggleVisibility={handleToggleVisibility}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Stats */}
      <div className="p-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Всього: {categories.length} {categories.length === 1 ? 'категорія' : 'категорій'}
        </div>
      </div>
    </div>
  );
}