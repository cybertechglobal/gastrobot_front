import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Search } from 'lucide-react';
import { startOfDay, endOfDay, addDays } from 'date-fns';

const filterSchema = z.object({
  userName: z.string().optional(),
  reservationNumber: z.string().optional(),
  selectedDate: z.string().optional(),
  status: z.enum(['all', 'confirmed', 'rejected']),
});

export type FilterFormData = z.infer<typeof filterSchema>;

interface FilterFormProps {
  onFiltersChange: (
    filters: FilterFormData & {
      from?: string;
      to?: string;
    }
  ) => void;
  initialFilters?: Partial<FilterFormData>;
  className?: string;
  debounceTime?: number; // Dodano za konfiguraciju debounce vremena
}

// Custom hook za debounce
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const FilterForm: React.FC<FilterFormProps> = ({
  onFiltersChange,
  initialFilters = {},
  className = '',
  debounceTime = 700, // Default 700ms debounce
}) => {
  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      userName: '',
      reservationNumber: '',
      selectedDate: '',
      status: 'all',
      ...initialFilters,
    },
  });

  const watchedValues = form.watch();

  // Debounce samo search polja
  const debounceduserName = useDebounce(
    watchedValues.userName || '',
    debounceTime
  );
  const debouncedReservationNumber = useDebounce(
    watchedValues.reservationNumber || '',
    debounceTime
  );

  // Transform filters and handle date conversion
  const transformFilters = (data: FilterFormData) => {
    const transformed: any = {
      ...data,
    };

    // Handle date transformation to ISO format with timezone
    if (data.selectedDate) {
      const selectedDate = new Date(data.selectedDate);

      transformed.from = startOfDay(selectedDate).toISOString();
      transformed.to = endOfDay(selectedDate).toISOString();
    } else {
      // Ako nema datuma, prikaži od danas do sutra
      const today = new Date();
      const tomorrow = addDays(today, 1);

      transformed.from = startOfDay(today).toISOString();
      transformed.to = endOfDay(tomorrow).toISOString();
    }

    console.log(transformed);

    return transformed;
  };

  // Effect za debounced search polja
  React.useEffect(() => {
    const filters: FilterFormData = {
      userName: debounceduserName,
      reservationNumber: debouncedReservationNumber,
      selectedDate: watchedValues.selectedDate,
      status: watchedValues.status,
    };

    const transformedFilters = transformFilters(filters);
    onFiltersChange(transformedFilters);
  }, [
    debounceduserName,
    debouncedReservationNumber,
    watchedValues.selectedDate,
    watchedValues.status,
    onFiltersChange,
  ]);

  // Effect za instant update ostalih polja (datum i status)
  React.useEffect(() => {
    // Ovaj effect se poziva samo kada se promeni datum ili status
    // Search polja se ignorišu jer imaju svoj debounced effect
    const filters: FilterFormData = {
      userName: debounceduserName, // Koristimo već debounced vrednost
      reservationNumber: debouncedReservationNumber, // Koristimo već debounced vrednost
      selectedDate: watchedValues.selectedDate,
      status: watchedValues.status,
    };

    const transformedFilters = transformFilters(filters);
    onFiltersChange(transformedFilters);
  }, [watchedValues.selectedDate, watchedValues.status]); // Samo datum i status

  const handleClearFilters = () => {
    form.reset({
      userName: '',
      reservationNumber: '',
      selectedDate: '',
      status: 'all',
    });
  };

  const hasActiveFilters =
    watchedValues.userName ||
    watchedValues.reservationNumber ||
    watchedValues.selectedDate ||
    watchedValues.status !== 'all';

  const getActiveFilterBadges = () => {
    const badges = [];

    if (watchedValues.userName) {
      badges.push(
        <Badge key="search" variant="outline" className="text-xs">
          Pretraga: {watchedValues.userName}
        </Badge>
      );
    }

    if (watchedValues.reservationNumber) {
      badges.push(
        <Badge key="reservation" variant="outline" className="text-xs">
          Kod: {watchedValues.reservationNumber}
        </Badge>
      );
    }

    if (watchedValues.selectedDate) {
      const date = new Date(watchedValues.selectedDate);
      badges.push(
        <Badge key="date" variant="outline" className="text-xs">
          Datum: {date.toLocaleDateString('sr-RS')}
        </Badge>
      );
    }

    if (watchedValues.status !== 'all') {
      badges.push(
        <Badge key="status" variant="outline" className="text-xs">
          Status:{' '}
          {watchedValues.status === 'confirmed' ? 'Potvrđeno' : 'Odbijeno'}
        </Badge>
      );
    }

    return badges;
  };

  return (
    <Card
      className={` border border-gray-200 dark:border-gray-800 ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filteri za rezervacije
          </CardTitle>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="w-4 h-4 mr-1" />
              Obriši
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Form {...form}>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Term */}
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pretraži po imenu</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          placeholder="Ime osobe..."
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reservation Number */}
              <FormField
                control={form.control}
                name="reservationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jedinstveni kod</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          placeholder="npr: HR115DK"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="selectedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Datum</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="w-full" />
                    </FormControl>
                    {/* <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Prazno = naredna 2 dana
                    </div> */}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Izaberi status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Svi statusi</SelectItem>
                        <SelectItem value="confirmed">Potvrđeno</SelectItem>
                        <SelectItem value="rejected">Odbijeno</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Aktivni filteri:
            </span>
            {getActiveFilterBadges()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterForm;
