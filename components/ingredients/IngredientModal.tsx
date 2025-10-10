'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createIngredient, updateIngredient } from '@/lib/api/ingredients';
import { Ingredient } from '@/types/ingredient';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface FormData {
  name: string;
}

interface IngredientModalProps {
  ingredient?: Ingredient | null;
  isOpen: boolean;
  isClient?: boolean;
  onClose: () => void;
  restaurantId?: string | null;
}

export default function IngredientModal({
  ingredient,
  isOpen,
  onClose,
  restaurantId = null,
  isClient = false,
}: IngredientModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const isEditMode = !!ingredient;

  const createMutation = useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      toast.success('Sastojak je uspešno kreiran!');
      handleClose();

      if (isClient) {
        queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      } else {
        router.refresh();
      }
    },
    onError: (error: Error) => {
      console.error('Failed to create ingredient:', error);
      toast.error(error.message || 'Greška pri kreiranju sastojka');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: FormData | { restaurantId: string; name: string };
    }) => updateIngredient(id, data),
    onSuccess: () => {
      toast.success('Sastojak je uspešno izmenjen!');
      handleClose();

      if (isClient) {
        queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      } else {
        router.refresh();
      }
    },
    onError: (error: Error) => {
      console.error('Failed to update ingredient:', error);
      toast.error(error.message || 'Greška pri izmeni sastojka');
    },
  });

  useEffect(() => {
    if (ingredient) {
      reset({ name: ingredient.name });
    } else {
      reset({ name: '' });
    }
  }, [ingredient, reset]);

  const onSubmit = async (data: FormData) => {
    const payload = restaurantId ? { ...data, restaurantId } : data;

    if (isEditMode && ingredient) {
      updateMutation.mutate({ id: ingredient.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Zajednički sadržaj forme
  const FormContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name" className="block mb-1 font-medium">
          Naziv
        </Label>
        <Input
          id="name"
          {...register('name', {
            required: 'Naziv je obavezan',
            minLength: {
              value: 2,
              message: 'Naziv mora imati najmanje 2 karaktera',
            },
            maxLength: {
              value: 100,
              message: 'Naziv ne može biti duži od 100 karaktera',
            },
          })}
          placeholder="Unesite naziv sastojka"
          autoFocus
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Submit button samo na desktop */}
      {isDesktop && (
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button" disabled={isLoading}>
              Otkaži
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Izmeni' : 'Kreiraj'}
          </Button>
        </DialogFooter>
      )}
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Uredi sastojak' : 'Dodaj novi sastojak'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {isEditMode ? 'Izmeni podatke o sastojku.' : ''}
            </DialogDescription>
          </DialogHeader>
          {FormContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>
            {isEditMode ? 'Uredi sastojak' : 'Dodaj novi sastojak'}
          </DrawerTitle>
          {isEditMode && (
            <DrawerDescription>Izmeni podatke o sastojku.</DrawerDescription>
          )}
        </DrawerHeader>
        <div className="px-4 pb-4">{FormContent}</div>
        <DrawerFooter className="pt-2">
          <Button onClick={handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Izmeni' : 'Kreiraj'}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Otkaži
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
