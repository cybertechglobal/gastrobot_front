'use client';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from '@/components/ui/select';
import { Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { updateRestaurant } from '@/lib/api/restaurants';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { updateLocation } from '@/lib/api/locations';

const workingHourSchema = z.object({
  day: z.string(),
  dayKey: z.string(),
  open: z.boolean(),
  from: z.string(),
  to: z.string(),
});

const restaurantFormSchema = z.object({
  name: z.string().min(1, 'Ime je obavezno'),
  description: z.string().optional(),
  email: z
    .string()
    .email('Neispravna email adresa')
    .optional()
    .or(z.literal('')),
  phoneNumber: z.string().optional(),
  workingHours: z.array(workingHourSchema),
  // Dodajemo lokaciju fields
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
});

type RestaurantFormData = z.infer<typeof restaurantFormSchema>;
type WorkingHour = z.infer<typeof workingHourSchema>;

const DAYS_OF_WEEK = [
  { day: 'Ponedeljak', key: 'monday' },
  { day: 'Utorak', key: 'tuesday' },
  { day: 'Sreda', key: 'wednesday' },
  { day: 'Četvrtak', key: 'thursday' },
  { day: 'Petak', key: 'friday' },
  { day: 'Subota', key: 'saturday' },
  { day: 'Nedelja', key: 'sunday' },
];

// Memoized time options generator
const useTimeOptions = () => {
  return useMemo(() => {
    const times: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        times.push(`${hh}:${mm}`);
      }
    }
    return times;
  }, []);
};

export function EditRestaurantDialog({
  restaurant,
  button,
}: {
  restaurant: any;
  button: any;
}) {
  const timeOptions = useTimeOptions();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Funkcija za parsiranje workingHours format-a
  const parseWorkingHours = (workingHours: any) => {
    return DAYS_OF_WEEK.map(({ day, key }) => {
      const hourString = workingHours?.[key];
      if (!hourString || hourString === 'Closed') {
        return {
          day,
          dayKey: key,
          open: false,
          from: '08:00',
          to: '22:00',
        };
      }

      const [from, to] = hourString.split('-');
      return {
        day,
        dayKey: key,
        open: true,
        from: from || '08:00',
        to: to || '22:00',
      };
    });
  };

  // Pripremi defaultne vrednosti za radno vreme
  const defaultWorkingHours = parseWorkingHours(restaurant.workingHours);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: {
      name: restaurant.name,
      description: restaurant.description,
      email: restaurant.email || '',
      phoneNumber: restaurant.phoneNumber || '',
      workingHours: defaultWorkingHours,
      // Dodajemo default vrednosti za lokaciju
      address: restaurant.location?.address || '',
      city: restaurant.location?.city || '',
      country: restaurant.location?.country || '',
      zipCode: restaurant.location?.zipCode || '',
    },
  });

  const { fields, update } = useFieldArray({
    control,
    name: 'workingHours',
  });

  const watchedWorkingHours = watch('workingHours');

  const mutation = useMutation({
    mutationFn: async (data: RestaurantFormData) => {
      // Convert working hours to the required format
      const workingHoursFormatted = data.workingHours.reduce((acc, hour) => {
        acc[hour.dayKey] = hour.open ? `${hour.from}-${hour.to}` : 'Closed';
        return acc;
      }, {} as Record<string, string>);

      // Prepare restaurant payload
      const restaurantPayload = {
        name: data.name,
        description: data.description || null,
        email: data.email || null,
        phoneNumber: data.phoneNumber || null,
        workingHours: workingHoursFormatted,
      };

      // Prepare location payload
      const locationPayload = {
        address: data.address || null,
        city: data.city || null,
        country: data.country || null,
        zipCode: data.zipCode || null,
      };

      // Update restaurant
      const restaurantRes = await updateRestaurant(
        restaurant.id,
        restaurantPayload
      );

      // Update location if locationId exists
      if (restaurant.location?.id) {
        await updateLocation(restaurant.location.id, locationPayload);
      }

      return restaurantRes;
    },
    onSuccess: () => {
      toast.success('Restoran uspešno izmenjen');
      setOpen(false);
      router.refresh();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast.error('Došlo je do greške');
    },
  });

  const onSubmit = (data: RestaurantFormData) => {
    mutation.mutate(data);
  };

  const handleWorkingHourChange = (
    dayIndex: number,
    field: keyof WorkingHour,
    value: any
  ) => {
    const currentHour = watchedWorkingHours[dayIndex];
    update(dayIndex, { ...currentHour, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{button}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Izmena restorana</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Osnovni podaci */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Osnovni podaci</h3>

            <div className="grid gap-3">
              <Label htmlFor="name">Ime *</Label>
              <Input
                id="name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Opis</Label>
              <Input id="description" {...register('description')} />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="restoran@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="phoneNumber">Broj telefona</Label>
              <Input
                id="phoneNumber"
                {...register('phoneNumber')}
                placeholder="+381 60 123 4567"
              />
            </div>
          </div>

          {/* Lokacija */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-muted-foreground" />
              <h3 className="text-lg font-semibold">Lokacija</h3>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="address">Adresa</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Knez Mihailova 12"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-3">
                <Label htmlFor="city">Grad</Label>
                <Input id="city" {...register('city')} placeholder="Beograd" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="zipCode">Poštanski broj</Label>
                <Input
                  id="zipCode"
                  {...register('zipCode')}
                  placeholder="11000"
                />
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="country">Zemlja</Label>
              <Input
                id="country"
                {...register('country')}
                placeholder="Srbija"
              />
            </div>
          </div>

          {/* Radno vreme */}
          <div className="space-y-4 pt-4 border-t">
            {/* <Label className="text-lg font-semibold">Radno vreme</Label> */}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={watchedWorkingHours[index]?.open}
                      onCheckedChange={(checked) =>
                        handleWorkingHourChange(index, 'open', checked)
                      }
                    />
                    <span
                      className={cn(
                        'font-medium text-sm',
                        watchedWorkingHours[index]?.open
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {field.day}
                    </span>
                    {/* {!watchedWorkingHours[index]?.open && (
                    
                    )} */}
                  </div>

                  {watchedWorkingHours[index]?.open ? (
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Clock
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Select
                          value={watchedWorkingHours[index]?.from}
                          onValueChange={(value) =>
                            handleWorkingHourChange(index, 'from', value)
                          }
                        >
                          <SelectTrigger className="w-28 sm:w-30 pl-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {timeOptions.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <span className="text-muted-foreground text-sm">do</span>

                      <div className="relative">
                        <Clock
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Select
                          value={watchedWorkingHours[index]?.to}
                          onValueChange={(value) =>
                            handleWorkingHourChange(index, 'to', value)
                          }
                        >
                          <SelectTrigger className="w-28 sm:w-30 pl-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {timeOptions.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Zatvoreno
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              Sačuvaj
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
