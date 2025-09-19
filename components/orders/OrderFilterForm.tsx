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
import { Filter, X, ShoppingCart, UtensilsCrossed } from 'lucide-react';
import { startOfDay, endOfDay, format } from 'date-fns';

const orderFilterSchema = z.object({
  orderNumber: z.string().optional(),
  tableNum: z.string().optional(),
  selectedDate: z.string().optional(),
  status: z.enum(['all', 'confirmed', 'rejected']),
});

export type OrderFilterFormData = z.infer<typeof orderFilterSchema>;

interface OrderFilterFormProps {
  onFiltersChange: (
    filters: OrderFilterFormData & {
      from?: string;
      to?: string;
    }
  ) => void;
  initialFilters?: Partial<OrderFilterFormData>;
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

const OrderFilterForm: React.FC<OrderFilterFormProps> = ({
  onFiltersChange,
  initialFilters = {},
  className = '',
  debounceTime = 700, // Default 700ms debounce
}) => {
  // Danas datum u DD.MM.YYYY formatu
  const todayDateString = format(new Date(), 'dd.MM.yyyy');

  // Funkcije za konverziju formata
  const convertToInputFormat = (dateStr: string): string => {
    if (!dateStr) return '';
    // Konvertuje DD.MM.YYYY u YYYY-MM-DD za HTML input
    const [day, month, year] = dateStr.split('.');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const convertFromInputFormat = (dateStr: string): string => {
    if (!dateStr) return '';
    // Konvertuje YYYY-MM-DD u DD.MM.YYYY
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  };

  const form = useForm<OrderFilterFormData>({
    resolver: zodResolver(orderFilterSchema),
    defaultValues: {
      orderNumber: '',
      tableNum: '',
      selectedDate: todayDateString, // Default je danas
      status: 'all',
      ...initialFilters,
    },
  });

  const watchedValues = form.watch();

  // Debounce search fields
  const debouncedOrderNumber = useDebounce(
    watchedValues.orderNumber || '',
    debounceTime
  );
  const debouncedTableNum = useDebounce(
    watchedValues.tableNum || '',
    debounceTime
  );

  // Transform filters and handle date conversion
  const transformFilters = (data: OrderFilterFormData) => {
    const transformed: any = {
      ...data,
    };

    // Handle date transformation to ISO format with timezone
    if (data.selectedDate) {
      // Konvertuj DD.MM.YYYY u Date objekat
      const [day, month, year] = data.selectedDate.split('.');
      const selectedDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );

      transformed.from = startOfDay(selectedDate).toISOString();
      transformed.to = endOfDay(selectedDate).toISOString();
    } else {
      // Ako nema datuma, prikaži samo za danas
      const today = new Date();

      transformed.from = startOfDay(today).toISOString();
      transformed.to = endOfDay(today).toISOString();
    }

    return transformed;
  };

  // Effect za debounced search polja
  React.useEffect(() => {
    const filters: OrderFilterFormData = {
      orderNumber: debouncedOrderNumber,
      tableNum: debouncedTableNum,
      selectedDate: watchedValues.selectedDate,
      status: watchedValues.status,
    };

    const transformedFilters = transformFilters(filters);
    onFiltersChange(transformedFilters);
  }, [
    debouncedOrderNumber,
    debouncedTableNum,
    watchedValues.selectedDate,
    watchedValues.status,
    onFiltersChange,
  ]);

  // Effect za instant update ostalih polja (datum i status)
  React.useEffect(() => {
    // Ovaj effect se poziva samo kada se promeni datum ili status
    // Search polja se ignorišu jer imaju svoj debounced effect
    const filters: OrderFilterFormData = {
      orderNumber: debouncedOrderNumber, // Koristimo već debounced vrednost
      tableNum: debouncedTableNum, // Koristimo već debounced vrednost
      selectedDate: watchedValues.selectedDate,
      status: watchedValues.status,
    };

    const transformedFilters = transformFilters(filters);
    onFiltersChange(transformedFilters);
  }, [watchedValues.selectedDate, watchedValues.status]); // Samo datum i status

  const handleClearFilters = () => {
    form.reset({
      orderNumber: '',
      tableNum: '',
      selectedDate: todayDateString, // Reset na danas umesto prazno
      status: 'all',
    });
  };

  const hasActiveFilters =
    watchedValues.orderNumber ||
    watchedValues.tableNum ||
    (watchedValues.selectedDate &&
      watchedValues.selectedDate !== todayDateString) ||
    watchedValues.status !== 'all';

  const getActiveFilterBadges = () => {
    const badges = [];

    if (watchedValues.orderNumber) {
      badges.push(
        <Badge key="order" variant="outline" className="text-xs">
          Porudžbina: {watchedValues.orderNumber}
        </Badge>
      );
    }

    if (watchedValues.tableNum) {
      badges.push(
        <Badge key="table" variant="outline" className="text-xs">
          Sto: {watchedValues.tableNum}
        </Badge>
      );
    }

    if (
      watchedValues.selectedDate &&
      watchedValues.selectedDate !== todayDateString
    ) {
      const [day, month, year] = watchedValues.selectedDate.split('.');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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
          {watchedValues.status === 'confirmed' ? 'Prihvaćeno' : 'Odbijeno'}
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
            Filteri za porudžbine
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Order Number */}
              <FormField
                control={form.control}
                name="orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Broj porudžbine</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ShoppingCart className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          placeholder="ORD123..."
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Table Number */}
              <FormField
                control={form.control}
                name="tableNum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Broj stola</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UtensilsCrossed className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          placeholder="5..."
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
                      <Input
                        type="date"
                        className="w-full"
                        value={convertToInputFormat(
                          field.value || todayDateString
                        )}
                        onChange={(e) => {
                          const convertedDate = convertFromInputFormat(
                            e.target.value
                          );
                          field.onChange(convertedDate);
                        }}
                      />
                    </FormControl>
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
                        <SelectItem value="confirmed">Prihvaćeno</SelectItem>
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

export default OrderFilterForm;
