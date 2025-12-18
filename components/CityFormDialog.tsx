'use client';

import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { City } from '@/types/city';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCity, updateCity } from '@/lib/api/locations';
import { toast } from 'sonner';

interface CityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCity?: City | null;
  onSuccess?: (city: City) => void;
}

export function CityFormDialog({
  open,
  onOpenChange,
  editingCity = null,
  onSuccess,
}: CityFormDialogProps) {
  const [cityName, setCityName] = useState('');
  const [cityZipcode, setCityZipcode] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingCity) {
      setCityName(editingCity.name);
      setCityZipcode(editingCity.zipcode);
    } else {
      setCityName('');
      setCityZipcode('');
    }
  }, [editingCity, open]);

  const createCityMutation = useMutation({
    mutationFn: (data: { name: string; zipcode: string }) => createCity(data),
    onSuccess: (newCity: City) => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast.success('Grad uspešno kreiran!');
      if (onSuccess) {
        onSuccess(newCity);
      }
      handleClose();
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
      if (onSuccess) {
        onSuccess(updatedCity);
      }
      handleClose();
    },
    onError: () => {
      toast.error('Greška pri ažuriranju grada');
    },
  });

  const handleSubmit = () => {
    if (!cityName.trim() || !cityZipcode.trim()) {
      toast.error('Popunite sva polja');
      return;
    }

    if (editingCity) {
      updateCityMutation.mutate({
        id: editingCity.id,
        data: {
          name: cityName,
          zipcode: cityZipcode,
        },
      });
    } else {
      createCityMutation.mutate({
        name: cityName,
        zipcode: cityZipcode,
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCityName('');
    setCityZipcode('');
  };

  const isLoading = createCityMutation.isPending || updateCityMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="npr. Beograd"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city-zipcode">Poštanski broj *</Label>
            <Input
              id="city-zipcode"
              value={cityZipcode}
              onChange={(e) => setCityZipcode(e.target.value)}
              placeholder="npr. 11000"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Otkaži
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading
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
  );
}
