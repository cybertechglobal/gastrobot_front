'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, X } from 'lucide-react';
import { CreateProductDialog } from './CreateProductDialog';
import { useDebouncedCallback } from '@/hooks/useDebounce';

interface Filters {
  name: string;
  categoryId: string;
  page: number;
}

interface ProductsHeaderProps {
  restaurantId: string;
  categories: any[];
  totalProducts: number;
  ingredients?: any;
  filters: Filters;
  onSearchChange: (search: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onClearFilters?: () => void;
  isLoading?: boolean;
}

export function ProductsHeader({
  restaurantId,
  categories,
  totalProducts,
  ingredients,
  filters,
  onSearchChange,
  onCategoryChange,
  onClearFilters,
  isLoading,
}: ProductsHeaderProps) {
  const [createProductOpen, setCreateProductOpen] = useState(false);

  // Debounced search funkcija
  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearchChange(value);
  }, 600);

  const handleCategoryChange = (value: string) => {
    const categoryValue = value === 'all' ? '' : value;
    onCategoryChange(categoryValue);
  };

  const hasFilters = filters.name || filters.categoryId;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Proizvodi</CardTitle>
            <p className="text-muted-foreground">
              Ukupno proizvoda: {!isLoading ? totalProducts : ''}
            </p>
          </div>
          <Button onClick={() => setCreateProductOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novi Proizvod
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretrazi proizvod..."
              defaultValue={filters.name}
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filters.categoryId || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sve kategorije" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve kategorije</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="outline" size="icon" onClick={onClearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>

      <CreateProductDialog
        open={createProductOpen}
        onOpenChange={setCreateProductOpen}
        restaurantId={restaurantId}
        categories={categories}
        ingredients={ingredients}
      />
    </Card>
  );
}
