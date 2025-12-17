'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { updateUser } from '@/lib/api/users';
import { useSession } from 'next-auth/react';

export const editUserSchema = z.object({
  firstname: z
    .string()
    .min(1, 'Ime je obavezno')
    .min(2, 'Ime mora imati najmanje 2 karaktera'),
  lastname: z
    .string()
    .min(1, 'Prezime je obavezno')
    .min(2, 'Prezime mora imati najmanje 2 karaktera'),
  email: z
    .string()
    .min(1, 'Email je obavezan')
    .email('Neispravna email adresa'),
  role: z.enum(['waiter', 'manager', 'chef', 'admin'], {
    required_error: 'Molimo izaberite ulogu',
  }),
});

export type EditUserFormData = z.infer<typeof editUserSchema>;

export type UserData = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: 'waiter' | 'manager' | 'chef' | 'admin';
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isVerified?: boolean;
  password?: string;
  profileImageUrl?: string | null;
};

interface EditUserFormProps {
  userId: string;
  initialData: UserData;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditUserForm({
  userId,
  initialData,
  open,
  onOpenChange,
}: EditUserFormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { data: session } = useSession();
  const userRole = session?.user?.restaurantUsers[0]?.role;
  const isRootUser = userRole === 'root';
  const canManageManagerRole = userRole === 'root' || userRole === 'admin';
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      role: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        firstname: initialData.firstname || '',
        lastname: initialData.lastname || '',
        email: initialData.email || '',
        role: initialData.role || undefined,
      });
    }
  }, [initialData, reset]);

  const updateUserMutation = useMutation({
    mutationFn: (data: EditUserFormData) => updateUser(userId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurant-users'] });
      onOpenChange?.(false);
    },
    onError: (error) => {
      console.error('Greška pri ažuriranju korisnika:', error);
    },
  });

  const onSubmit = (data: EditUserFormData) => {
    updateUserMutation.mutate(data);
  };

  const roleValue = watch('role');

  const FormContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstname">Ime</Label>
        <Input
          id="firstname"
          placeholder="Unesite ime"
          {...register('firstname')}
        />
        {errors.firstname && (
          <p className="text-sm text-red-500">{errors.firstname.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastname">Prezime</Label>
        <Input
          id="lastname"
          placeholder="Unesite prezime"
          {...register('lastname')}
        />
        {errors.lastname && (
          <p className="text-sm text-red-500">{errors.lastname.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Unesite email adresu"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Uloga</Label>
        <Select
          onValueChange={(value) =>
            setValue('role', value as 'waiter' | 'manager' | 'chef' | 'admin')
          }
          value={roleValue}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Izaberite ulogu" />
          </SelectTrigger>
          <SelectContent>
            {isRootUser && <SelectItem value="admin">Administrator</SelectItem>}
            {canManageManagerRole && (
              <SelectItem value="manager">Menadžer</SelectItem>
            )}
            <SelectItem value="waiter">Konobar</SelectItem>
            <SelectItem value="chef">Kuvar</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-500">{errors.role.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={updateUserMutation.isPending}
      >
        {updateUserMutation.isPending ? 'Ažuriranje...' : 'Ažuriraj korisnika'}
      </Button>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Izmeni korisnika</DialogTitle>
          </DialogHeader>
          {FormContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Izmeni korisnika</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto">{FormContent}</div>
      </DrawerContent>
    </Drawer>
  );
}
