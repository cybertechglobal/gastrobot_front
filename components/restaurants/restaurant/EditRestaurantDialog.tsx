'use client';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
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
import { cn } from '@/lib/utils/utils';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { updateRestaurant } from '@/lib/api/restaurants';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { fetchCities, updateLocation } from '@/lib/api/locations';
import { DAYS_OF_WEEK } from '@/lib/utils/translations';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
});

type RestaurantFormData = z.infer<typeof restaurantFormSchema>;
type WorkingHour = z.infer<typeof workingHourSchema>;

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
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const timeOptions = useTimeOptions();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => fetchCities(),
    staleTime: Infinity,
  });

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
      const workingHoursFormatted = data.workingHours.reduce((acc, hour) => {
        acc[hour.dayKey] = hour.open ? `${hour.from}-${hour.to}` : 'Closed';
        return acc;
      }, {} as Record<string, string>);

      const restaurantPayload = {
        name: data.name,
        description: data.description || null,
        email: data.email || null,
        phoneNumber: data.phoneNumber || null,
        workingHours: workingHoursFormatted,
      };

      const locationPayload = {
        address: data.address || null,
        city: data.city || null,
        country: data.country || null,
        zipCode: data.zipCode || null,
      };

      const restaurantRes = await updateRestaurant(
        restaurant.id,
        restaurantPayload
      );

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

  // Zajednička forma
  const FormContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full dark:border-0 dark:bg-[#1C1E24]">
                    <SelectValue placeholder="Beograd" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {cities?.map((city) => (
                        <SelectItem key={city.id} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="zipCode">Poštanski broj</Label>
            <Input id="zipCode" {...register('zipCode')} placeholder="11000" />
          </div>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="country">Zemlja</Label>
          <Input id="country" {...register('country')} placeholder="Srbija" />
        </div>
      </div>

      {/* Radno vreme */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-muted-foreground" />
          <h3 className="text-lg font-semibold">Radno vreme</h3>
        </div>
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
                <span className="text-sm text-muted-foreground">Zatvoreno</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit button - samo na desktop */}
      {isDesktop && (
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting || mutation.isPending}>
            Sačuvaj
          </Button>
        </DialogFooter>
      )}
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{button}</DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Izmena restorana</DialogTitle>
          </DialogHeader>
          <div className="mt-4">{FormContent}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{button}</DrawerTrigger>
      <DrawerContent className="h-[96vh] max-h-[96vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Izmena restorana</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4">{FormContent}</div>
        <DrawerFooter className="pt-3">
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || mutation.isPending}
          >
            Sačuvaj
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
