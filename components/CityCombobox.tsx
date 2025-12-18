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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { City } from '@/types/city';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCity, updateCity } from '@/lib/api/locations';
import { toast } from 'sonner';

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
  const [newCityName, setNewCityName] = React.useState('');
  const [newCityZipcode, setNewCityZipcode] = React.useState('');
  const [editingCity, setEditingCity] = React.useState<City | null>(null);
  const queryClient = useQueryClient();

  const createCityMutation = useMutation({
    mutationFn: (data: { name: string; zipcode: string }) => createCity(data),
    onSuccess: (newCity: City) => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast.success('Grad uspešno kreiran!');
      onValueChange(newCity.name);
      if (onCitySelect) {
        onCitySelect(newCity);
      }
      setDialogOpen(false);
      setNewCityName('');
      setNewCityZipcode('');
      setOpen(false);
    },
    onError: () => {
      toast.error('Greška pri kreiranju grada');
    },
  });

  const updateCityMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; zipcode: string };
    }) => updateCity(id, data),
    onSuccess: (updatedCity: City) => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast.success('Grad uspešno ažuriran!');
      onValueChange(updatedCity.name);
      if (onCitySelect) {
        onCitySelect(updatedCity);
      }
      setDialogOpen(false);
      setNewCityName('');
      setNewCityZipcode('');
      setEditingCity(null);
      setOpen(false);
    },
    onError: () => {
      toast.error('Greška pri ažuriranju grada');
    },
  });

  const handleCreateCity = () => {
    if (!newCityName.trim() || !newCityZipcode.trim()) {
      toast.error('Popunite sva polja');
      return;
    }

    if (editingCity) {
      updateCityMutation.mutate({
        id: editingCity.id,
        data: {
          name: newCityName,
          zipcode: newCityZipcode,
        },
      });
    } else {
      createCityMutation.mutate({
        name: newCityName,
        zipcode: newCityZipcode,
      });
    }
  };

  const handleEditCity = (city: City, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCity(city);
    setNewCityName(city.name);
    setNewCityZipcode(city.zipcode);
    setDialogOpen(true);
    setOpen(false);
  };

  return (
    <>
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingCity(null);
            setNewCityName('');
            setNewCityZipcode('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCity ? 'Izmeni grad' : 'Kreiraj novi grad'}
            </DialogTitle>
            <DialogDescription>
              {editingCity
                ? 'Izmenite ime grada i poštanski broj.'
                : 'Unesite ime grada i poštanski broj.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="city-name">Ime grada *</Label>
              <Input
                id="city-name"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                placeholder="npr. Beograd"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city-zipcode">Poštanski broj *</Label>
              <Input
                id="city-zipcode"
                value={newCityZipcode}
                onChange={(e) => setNewCityZipcode(e.target.value)}
                placeholder="npr. 11000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setNewCityName('');
                setNewCityZipcode('');
                setEditingCity(null);
              }}
            >
              Otkaži
            </Button>
            <Button
              onClick={handleCreateCity}
              disabled={
                createCityMutation.isPending || updateCityMutation.isPending
              }
            >
              {createCityMutation.isPending || updateCityMutation.isPending
                ? editingCity
                  ? 'Ažuriranje...'
                  : 'Kreiranje...'
                : editingCity
                ? 'Ažuriraj'
                : 'Kreiraj'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
