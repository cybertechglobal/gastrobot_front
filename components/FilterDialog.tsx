// components/FilterDialog.tsx
'use client';

import { useState, type ChangeEvent } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { SlidersHorizontal } from 'lucide-react';
import { RestaurantFilters } from '@/types/restaurant';

interface FilterDialogProps {
  cities: string[];
  cuisines: string[];
  onApply: (filters: RestaurantFilters) => void;
  onReset?: () => void;
}

export function FilterDialog({
  cities,
  cuisines,
  onApply,
  onReset,
}: FilterDialogProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState<string | undefined>('');
  const [cuisine, setCuisine] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>('');

  function apply() {
    onApply({ name, location, city, status });
  }

  function reset() {
    setName('');
    setLocation('');
    setCity('');
    setCuisine(undefined);
    setStatus('');
    onReset?.();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="dark:bg-transparent dark:text-slate-200 cursor-pointer"
        >
          <SlidersHorizontal />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border border-gray text-slate-100 rounded-lg p-6">
        <DialogHeader>
          <DialogTitle>Filteri - Ne radi, ovo je sad samo test UI</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Naziv */}
          <div className="space-y-1">
            <Label htmlFor="filter-name">Naziv</Label>
            <Input
              id="filter-name"
              placeholder="Pretraži po nazivu"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              className="border-0 dark:bg-[#1C1E24]"
            />
          </div>

          {/* Grid za ostalo */}
          <div className="grid grid-cols-2 gap-4">
            {/* Lokacija */}
            <div className="space-y-1">
              <Label htmlFor="filter-location">Lokacija</Label>
              <Input
                id="filter-location"
                placeholder="Pretraži po lokaciji"
                value={location}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setLocation(e.target.value)
                }
                className="border-0 dark:bg-[#1C1E24]"
              />
            </div>

            {/* Grad */}
            <div className="space-y-1 ">
              <Label htmlFor="filter-city">Grad</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger
                  id="filter-city"
                  className="border-0 dark:bg-[#1C1E24] w-full text-slate-200"
                >
                  <SelectValue placeholder="Svi gradovi" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-slate-100">
                  <SelectGroup>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Tip kuhinje */}
            <div className="space-y-1">
              <Label htmlFor="filter-cuisine">Tip kuhinje</Label>
              <Select value={cuisine} onValueChange={setCuisine}>
                <SelectTrigger
                  id="filter-cuisine"
                  className="border-0 dark:bg-[#1C1E24] w-full text-slate-200"
                >
                  <SelectValue placeholder="Svi tipovi" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-slate-100">
                  <SelectGroup>
                    {cuisines.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <Label htmlFor="filter-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger
                  id="filter-status"
                  className="border-0 dark:bg-[#1C1E24] w-full text-slate-200"
                >
                  <SelectValue placeholder="Svi statusi" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-slate-100">
                  <SelectGroup>
                    <SelectItem value="Aktivan">Aktivan</SelectItem>
                    <SelectItem value="Neaktivan">Neaktivan</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Separator + dugmad */}
        <div className="border-t border-gray mt-6 pt-4">
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              className=" dark:bg-transparent text-slate-200"
              onClick={reset}
            >
              Poništi
            </Button>
            <Button
              variant="default"
              className="bg-brand-blue hover:bg-brand-blue-hover text-white"
              onClick={apply}
            >
              Primeni
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
