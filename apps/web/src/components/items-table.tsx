'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Image as ImageIcon,
  Loader2,
  Plus
} from 'lucide-react';
import { getLocalizedText, formatCurrency } from '@/lib/i18n';
import { useUpdateItemAvailability, useDeleteItem } from '@/lib/robot-queries';
import { useToast } from '@/hooks/use-toast';
import type { Item } from '@/types/robot';

interface ItemsTableProps {
  items: Item[];
  loading?: boolean;
  onRefetch?: () => void;
}

export function ItemsTable({ items, loading = false, onRefetch }: ItemsTableProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const updateAvailability = useUpdateItemAvailability({
    onSuccess: () => {
      toast({
        title: 'Успіх!',
        description: 'Доступність оновлено',
        variant: 'success',
      });
      onRefetch?.();
    },
    onError: (error) => {
      toast({
        title: 'Помилка',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteItem = useDeleteItem({
    onSuccess: () => {
      toast({
        title: 'Успіх!',
        description: 'Страву видалено',
        variant: 'success',
      });
      onRefetch?.();
    },
    onError: (error) => {
      toast({
        title: 'Помилка',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Filter items based on search
  const filteredItems = items.filter(item =>
    getLocalizedText(item.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getLocalizedText(item.description).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAvailabilityToggle = (itemId: string, available: boolean) => {
    updateAvailability.mutate({ id: itemId, available });
  };

  const handleDelete = (item: Item) => {
    if (window.confirm(`Видалити страву "${getLocalizedText(item.name)}"?`)) {
      deleteItem.mutate(item.id);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Завантаження страв...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Страви у категорії</CardTitle>
          
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук страв..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            {searchQuery ? (
              <div>
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium mb-2">Нічого не знайдено</h3>
                <p className="text-muted-foreground mb-4">
                  Спробуйте інший пошуковий запит
                </p>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Очистити пошук
                </Button>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold mb-2">Немає страв у цій категорії</h3>
                <p className="text-muted-foreground mb-4">
                  Почніть з додавання першої страви до меню
                </p>
                <Button asChild className="bg-primary text-white rounded-lg shadow-card hover:opacity-90">
                  <Link href="/menu/item/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Додати страву
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Назва</TableHead>
                  <TableHead>Ціна</TableHead>
                  <TableHead>Упаковка</TableHead>
                  <TableHead className="text-center">Доступна</TableHead>
                  <TableHead className="text-right">Дії</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="group">
                    {/* Photo */}
                    <TableCell>
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        {item.photo ? (
                          <img
                            src={item.photo.url}
                            alt={getLocalizedText(item.name)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>

                    {/* Name & Description */}
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {getLocalizedText(item.name)}
                        </div>
                        {getLocalizedText(item.description) && (
                          <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {getLocalizedText(item.description)}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(item.price)}
                      </div>
                    </TableCell>

                    {/* Packaging Price */}
                    <TableCell>
                      {item.packaging_price ? (
                        <div className="text-sm">
                          {formatCurrency(item.packaging_price)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Availability Toggle */}
                    <TableCell className="text-center">
                      <Switch
                        checked={item.available}
                        onCheckedChange={(checked) => 
                          handleAvailabilityToggle(item.id, checked)
                        }
                        disabled={updateAvailability.isPending}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/menu/item/${item.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/menu/item/${item.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(item)}
                          disabled={deleteItem.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}