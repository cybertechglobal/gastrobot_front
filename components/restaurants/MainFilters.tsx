'use client';
import { useState, ChangeEvent, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { RestaurantFilters } from '@/types/restaurant';
import { useQuery } from '@tanstack/react-query';
import { fetchCities } from '@/lib/api/locations';

const MainFilters = ({ initialFilters }: { initialFilters: any }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<RestaurantFilters>({
    ...initialFilters,
  });

  const debouncedSearch = useDebounce(filters.name, 500);

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => fetchCities(),
    staleTime: Infinity,
  });

  const updateFilter = useCallback((key: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const updateUrl = useCallback(
    (filtersToUpdate: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(filtersToUpdate).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Resetuj stranicu na 1 kada se mijenjaju filteri
      params.delete('page');

      const newUrl = params.toString()
        ? `/restaurants?${params.toString()}`
        : '/restaurants';
      router.push(newUrl);
    },
    [searchParams, router]
  );

  // Funkcija za uklanjanje pojedinačnog filtera
  const removeFilter = useCallback(
    (filterKey: string) => {
      const newFilters = { ...filters, [filterKey]: '' };
      setFilters(newFilters);
      updateUrl(newFilters);
    },
    [filters, updateUrl]
  );

  const statuses = ['active', 'inactive'];

  const handleFilterCity = (query: string) => {
    updateFilter('city', query);
    updateUrl({ ...filters, city: query });
  };

  const handleFilterStatus = (query: string) => {
    updateFilter('status', query);
    updateUrl({ ...filters, status: query });
  };

  // Dodaj ref za tracking prethodne vrijednosti
  const prevDebouncedSearchRef = useRef(debouncedSearch);

  useEffect(() => {
    // Pozovi updateUrl samo ako se debounced search stvarno promijenio
    if (prevDebouncedSearchRef.current !== debouncedSearch) {
      console.log('debounced search changed');
      updateUrl({ ...filters, name: debouncedSearch });
      prevDebouncedSearchRef.current = debouncedSearch;
    }
  }, [debouncedSearch, updateUrl, filters]);

  // Effect za sinhronizaciju sa URL-om na mount
  useEffect(() => {
    setFilters({
      name: searchParams.get('name') || '',
      city: searchParams.get('city') || '',
      status: searchParams.get('status') || '',
    });
  }, [searchParams]);

  // const resetFilters = () => {
  //   setFilters({ name: '', city: '', status: '' });
  //   router.push('/restaurants');
  // };

  const hasActiveFilters = !!(filters.name || filters.city || filters.status);

  return (
    <>
      <header className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-3xl font-semibold">Lista restorana</h1>
        <Link href="restaurants/new">
          <Button variant="default" className="cursor-pointer">
            + Dodaj restoran
          </Button>
        </Link>
      </header>

      {/* 1. red: search + 2 selekta */}
      <div className="flex flex-wrap gap-4 mb-2">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={16}
          />
          <Input
            placeholder="Pretraži po imenu"
            value={filters.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateFilter('name', e.target.value)
            }
            className="pl-10 dark:border-0 dark:bg-[#1C1E24]"
          />
        </div>
        <Select value={filters.city} onValueChange={handleFilterCity}>
          <SelectTrigger className="w-32 dark:border-0 dark:bg-[#1C1E24]">
            <SelectValue placeholder="Grad" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {cities?.map((city) => (
                <SelectItem key={city.id} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={handleFilterStatus}>
          <SelectTrigger className="w-32 dark:border-0 dark:bg-[#1C1E24]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Active filters display sa funkcionalnim X dugmićima */}
      <div className="min-h-[32px] mb-2 flex flex-wrap items-center gap-2">
        {hasActiveFilters ? (
          <>
            {filters.name && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                Pretraga: {filters.name}
                <button
                  onClick={() => removeFilter('name')}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-sm p-0.5 transition-colors"
                  aria-label="Ukloni filter pretrage"
                >
                  <X size={12} />
                </button>
              </Badge>
            )}
            {filters.city && filters.city !== 'all' && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                Grad: {filters.city}
                <button
                  onClick={() => removeFilter('city')}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-sm p-0.5 transition-colors"
                  aria-label="Ukloni filter grada"
                >
                  <X size={12} />
                </button>
              </Badge>
            )}
            {filters.status && filters.status !== 'all' && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                Status: {filters.status}
                <button
                  onClick={() => removeFilter('status')}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-sm p-0.5 transition-colors"
                  aria-label="Ukloni filter statusa"
                >
                  <X size={12} />
                </button>
              </Badge>
            )}
          </>
        ) : null}
      </div>
    </>
  );
};

export default MainFilters;
