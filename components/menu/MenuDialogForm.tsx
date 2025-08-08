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
import { createMenu, updateMenu } from '@/lib/api/menu';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

const menuSchema = z.object({
  name: z.string().min(1, 'Ime je obavezno'),
});

type MenuForm = z.infer<typeof menuSchema>;

interface MenuDialogProps {
  restaurantId: string;
  menu?: any;
  trigger: React.ReactNode;
  onSuccess?: () => void;
  // Dodaj ove za external control
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MenuDialogForm({
  restaurantId,
  menu,
  trigger,
  onSuccess,
  open,
  onOpenChange,
}: MenuDialogProps) {
  const isEdit = Boolean(menu);
  const router = useRouter();

  // Use external state if provided, otherwise use internal state
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MenuForm>({
    resolver: zodResolver(menuSchema),
    defaultValues: menu ? { name: menu.name } : { name: '' },
  });

  useEffect(() => {
    if (menu) {
      reset({
        name: menu.name,
      });
    }
  }, [menu, reset]);

  const createM = useMutation({
    mutationFn: ({
      restaurantId,
      data,
    }: {
      restaurantId: string;
      data: MenuForm;
    }) => createMenu(restaurantId, data),
    onSuccess: () => {
      // Osveži serverske podatke
      router.refresh(); // ili `revalidatePath('/restaurants')` ako koristiš Next.js 14+
      // qc.invalidateQueries({ queryKey: ['categories'] });
      setInternalOpen(false); // Zatvori dijalog
      onSuccess?.();
    },
  });

  const updateM = useMutation({
    mutationFn: ({
      restaurantId,
      menuId,
      data,
    }: {
      restaurantId: string;
      menuId: string;
      data: MenuForm;
    }) => updateMenu(restaurantId, menuId, data),
    onSuccess: () => {
      // Osveži serverske podatke
      setInternalOpen(false); // Zatvori dijalog
      router.refresh(); // ili `revalidatePath('/restaurants')` ako koristiš Next.js 14+
      toast.success('Menu je izmenjen.');
      // qc.invalidateQueries({ queryKey: ['categories'] });
      onSuccess?.();
    },
  });

  const onSubmit = (data: MenuForm) => {
    if (isEdit && menu) {
      updateM.mutate({ restaurantId, menuId: menu.id, data });
    } else {
      createM.mutate({ restaurantId, data });
    }
  };

  React.useEffect(() => {
    if (isEdit ? updateM.isSuccess : createM.isSuccess) {
      reset();
    }
  }, [createM.isSuccess, updateM.isSuccess, isEdit, reset]);

  return (
   <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {open === undefined && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Uredi meni' : 'Nov meni'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Izmeni naziv postojećeg menija.'
              : 'Unesi naziv novog menija.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Naziv</label>
            <Input
              {...register('name')}
              placeholder="npr. Jelovnik"
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isSubmitting}>
                Otkaži
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {(createM.isPending || updateM.isPending) && <Loader />}
              {isEdit ? 'Izmeni' : 'Kreiraj'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
