'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
          <CommandInput placeholder="Pretraži gradove..." />
          <CommandList>
            <CommandEmpty>Grad nije pronađen.</CommandEmpty>
            <CommandGroup>
              {cities.map((city) => (
                <CommandItem
                  key={city.id}
                  value={city.name}
                  onSelect={(currentValue) => {
                    const selectedCity = cities.find(
                      (c) => c.name.toLowerCase() === currentValue.toLowerCase()
                    );
                    if (selectedCity) {
                      onValueChange(selectedCity.name);
                      if (onCitySelect) {
                        onCitySelect(selectedCity);
                      }
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === city.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {city.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
