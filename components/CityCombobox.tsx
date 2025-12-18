'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { City } from '@/types/city';
import { CityFormDialog } from '@/components/CityFormDialog';

interface CityComboboxProps {
  cities?: City[];
  value: string;
  onValueChange: (value: string) => void;
  onCitySelect?: (city: City) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CityCombobox({
  cities = [],
  value,
  onValueChange,
  onCitySelect,
  error,
  placeholder = 'Izaberi grad...',
  disabled = false,
}: CityComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCity, setEditingCity] = React.useState<City | null>(null);

  const handleCitySuccess = (city: City) => {
    onValueChange(city.name);
    if (onCitySelect) {
      onCitySelect(city);
    }
    setOpen(false);
  };

  const handleEditCity = (city: City, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCity(city);
    setDialogOpen(true);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between dark:border-0 dark:bg-[#1C1E24]',
              !value && 'text-muted-foreground',
              error && 'border-red-500'
            )}
            disabled={disabled}
          >
            {value
              ? cities.find((city) => city.name === value)?.name
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <div className="border-b p-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDialogOpen(true);
                  setOpen(false);
                }}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Kreiraj novi grad
              </Button>
            </div>
            <CommandInput placeholder="Pretraži gradove..." />
            <CommandList>
              <CommandEmpty>
                <div className="p-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    Grad nije pronađen.
                  </p>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={city.id}
                    value={city.name}
                    onSelect={(currentValue) => {
                      const selectedCity = cities.find(
                        (c) =>
                          c.name.toLowerCase() === currentValue.toLowerCase()
                      );
                      if (selectedCity) {
                        onValueChange(selectedCity.name);
                        if (onCitySelect) {
                          onCitySelect(selectedCity);
                        }
                      }
                      setOpen(false);
                    }}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center">
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === city.name ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {city.name}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleEditCity(city, e)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CityFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingCity(null);
          }
        }}
        editingCity={editingCity}
        onSuccess={handleCitySuccess}
      />
    </>
  );
}
