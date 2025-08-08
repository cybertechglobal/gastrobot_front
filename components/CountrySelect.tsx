'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Countries } from '@/lib/countries';


interface CountrySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  error?: string;
}

export function CountrySelect({
  value,
  onValueChange,
  error,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor="country">Država *</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between',
              !value && 'text-muted-foreground',
              error && 'border-red-500'
            )}
          >
            {value
              ? Countries.find((country) => country.name === value)?.name
              : 'Izaberite državu...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Pretražite države..." />
            <CommandEmpty>Država nije pronađena.</CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {Countries.map((country) => (
                <CommandItem
                  key={country.Iso2}
                  value={country.name}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === country.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {country.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
