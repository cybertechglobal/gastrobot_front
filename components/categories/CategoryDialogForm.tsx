'use client';

import React, { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { createCategory, updateCategory } from '@/lib/api/category';
import { Category } from '@/types/category';

const categorySchema = z.object({
  name: z.string().min(1, 'Ime je obavezno'),
  type: z.enum(['food', 'drink'], { message: 'Morate izabrati tip' }),
});

type CategoryForm = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  category?: Category;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function CategoryDialogForm({
  category,
  trigger,
  onSuccess,
}: CategoryDialogProps) {
  const isEdit = Boolean(category);
  const router = useRouter();
  const [open, setOpen] = React.useState(false); // Kontrola stanja dijaloga
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? { name: category.name, type: category.type as 'food' | 'drink' }
      : { name: '', type: undefined },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        type: category.type as 'food' | 'drink',
      });
    }
  }, [category, reset]);

  const createM = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      // Osveži serverske podatke
      router.refresh(); // ili `revalidatePath('/restaurants')` ako koristiš Next.js 14+
      // qc.invalidateQueries({ queryKey: ['categories'] });
      setOpen(false); // Zatvori dijalog
      onSuccess?.();
    },
  });

  const updateM = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryForm }) =>
      updateCategory(id, data),
    onSuccess: () => {
      // Osveži serverske podatke
      router.refresh(); // ili `revalidatePath('/restaurants')` ako koristiš Next.js 14+
      // qc.invalidateQueries({ queryKey: ['categories'] });
      setOpen(false); // Zatvori dijalog
      onSuccess?.();
    },
  });

  const onSubmit = (data: CategoryForm) => {
    if (isEdit && category) {
      updateM.mutate({ id: category.id, data });
    } else {
      createM.mutate(data);
    }
  };

  React.useEffect(() => {
    if (isEdit ? updateM.isSuccess : createM.isSuccess) {
      reset();
    }
  }, [createM.isSuccess, updateM.isSuccess, isEdit, reset]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Uredi kategoriju' : 'Nova kategorija'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Izmeni naziv i tip postojeće kategorije.'
              : 'Unesi naziv i izaberi tip nove kategorije.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Naziv</label>
            <Input {...register('name')} placeholder="npr. Pizza" autoFocus />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Tip</label>
            <Select
              onValueChange={(value) =>
                setValue('type', value as 'food' | 'drink')
              }
              defaultValue={category?.type}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Izaberi tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="drink">Drink</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isSubmitting}>
                Otkaži
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isEdit ? 'Spremi promene' : 'Kreiraj'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
