'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { z } from 'zod';
import { Plus, Eye, EyeOff } from 'lucide-react';
import { createUser } from '@/lib/api/users';
import { toast } from 'sonner';

export const addUserSchema = z
  .object({
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
    password: z
      .string()
      .min(1, 'Lozinka je obavezna')
      .min(8, 'Lozinka mora imati najmanje 8 karaktera'),
    confirmPassword: z.string().min(1, 'Potvrda lozinke je obavezna'),
    role: z.enum(['waiter', 'manager'], {
      required_error: 'Molimo izaberite ulogu',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Lozinke se ne poklapaju',
    path: ['confirmPassword'],
  });

interface AddUserFormProps {
  open?: boolean;
  restaurantId: string;
}

export type AddUserFormData = z.infer<typeof addUserSchema>;

export function AddUserForm({ restaurantId }: AddUserFormProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      reset();
      toast.success('Korisnik je kreiran.');
      qc.invalidateQueries({ queryKey: ['restaurant-users'] });
      setOpen(false);
    },
    onError: (error) => {
      console.error('Greška pri kreiranju korisnika:', error);
    },
  });

  const onSubmit = (data: AddUserFormData) => {
    const { confirmPassword, ...submitData } = data;

    const body = {
      ...submitData,
      restaurantId: restaurantId,
    };

    createUserMutation.mutate(body);
  };

  const roleValue = watch('role');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Dodaj korisnika
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj novog korisnika</DialogTitle>
        </DialogHeader>
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
            <Label htmlFor="password">Lozinka</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Unesite lozinku"
                {...register('password')}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potvrdite lozinku</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ponovite lozinku"
                {...register('confirmPassword')}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2 w-full">
            <Label htmlFor="role">Uloga</Label>
            <Select
              onValueChange={(value) =>
                setValue('role', value as 'waiter' | 'manager')
              }
              value={roleValue}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Izaberite ulogu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="waiter">Konobar</SelectItem>
                <SelectItem value="manager">Menadžer</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending
              ? 'Kreiranje...'
              : 'Kreiraj korisnika'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
