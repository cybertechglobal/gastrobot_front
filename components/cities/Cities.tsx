'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCity } from '@/lib/api/locations';
import { City } from '@/types/city';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CityFormDialog } from '@/components/CityFormDialog';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CitiesProps {
  cities: City[];
}

export default function Cities({ cities }: CitiesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState<City | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast.success('Grad uspešno obrisan!');
      setDeleteDialogOpen(false);
      setCityToDelete(null);
      router.refresh();
    },
    onError: () => {
      toast.error('Greška pri brisanju grada');
    },
  });

  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.zipcode.includes(searchQuery)
  );

  const handleAddCity = () => {
    setEditingCity(null);
    setDialogOpen(true);
  };

  const handleEditCity = (city: City) => {
    setEditingCity(city);
    setDialogOpen(true);
  };

  const handleDeleteCity = (city: City) => {
    setCityToDelete(city);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (cityToDelete) {
      deleteMutation.mutate(cityToDelete.id);
    }
  };

  const handleCityFormSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gradovi</h1>
          <p className="text-muted-foreground mt-1">
            Upravljajte gradovima u sistemu
          </p>
        </div>
        <Button onClick={handleAddCity}>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj grad
        </Button>
      </header>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži gradove po imenu ili poštanskom broju..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredCities.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naziv grada</TableHead>
                  <TableHead>Poštanski broj</TableHead>
                  <TableHead className="text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCities.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell className="font-medium">{city.name}</TableCell>
                    <TableCell>{city.zipcode}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCity(city)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCity(city)}
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
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery
              ? 'Nema rezultata za zadati upit'
              : 'Nema dostupnih gradova'}
          </div>
        )}
      </div>

      <CityFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingCity={editingCity}
        onSuccess={handleCityFormSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija će obrisati grad{' '}
              <span className="font-semibold">{cityToDelete?.name}</span>. Ova
              akcija ne može biti poništena.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/80"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Brisanje...
                </>
              ) : (
                'Obriši'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
