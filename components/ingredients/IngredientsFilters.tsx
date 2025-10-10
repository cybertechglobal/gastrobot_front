'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import IngredientModal from './IngredientModal';
import { useDebouncedCallback } from '@/hooks/useDebounce';

interface IngredientsFiltersProps {
  initialFilters: {
    name: string;
  };
}

export default function IngredientsFilters({
  initialFilters,
}: IngredientsFiltersProps) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Helper function to create clean URLs
  const createUrl = (name: string, page?: number) => {
    const params = new URLSearchParams();

    // Only add name if it's not empty
    if (name.trim()) {
      params.set('name', name.trim());
    }

    // Only add page if it's greater than 1
    if (page && page > 1) {
      params.set('page', page.toString());
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  // Debounced search function
  const debouncedSearch = useDebouncedCallback((searchValue: string) => {
    const url = createUrl(searchValue);
    router.push(url || '/ingredients'); // Fallback to base path if no params
  }, 500); // 500ms delay

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  // Handle form submit (immediate search)
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    const url = createUrl(name);
    router.push(url || '/ingredients');
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Lista sastojaka</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          + Dodaj sastojak
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch}>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              name="name"
              type="text"
              placeholder="Pretraži po imenu"
              defaultValue={initialFilters.name}
              onChange={handleInputChange}
              className="pl-10 placeholder-gray-400 focus:ring-blue-500"
            />
          </div>
        </form>
      </div>

      <IngredientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
