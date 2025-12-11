'use client';

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  type ChangeEvent,
  useEffect,
} from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { Clock, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Stepper } from '@/components/Stepper';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { restaurantSchema } from '@/lib/validation/restaurant';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createLocation, fetchCities } from '@/lib/api/locations';
import { createRestaurant } from '@/lib/api/restaurants';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CountrySelect } from '@/components/CountrySelect';
import { CityCombobox } from '@/components/CityCombobox';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const DAY_NAMES_SR = {
  Monday: 'Ponedeljak',
  Tuesday: 'Utorak',
  Wednesday: 'Sreda',
  Thursday: 'Četvrtak',
  Friday: 'Petak',
  Saturday: 'Subota',
  Sunday: 'Nedelja',
} as const;

const STEPS = ['Osnovni podaci', 'Lokacija', 'Radni sati', 'Podešavanja'];

type RestaurantForm = z.infer<typeof restaurantSchema>;

// Memoized time options generator
const useTimeOptions = () => {
  return useMemo(() => {
    const times: Array<{ value: string; label: string }> = [];
    // Od 00:00 do 23:30
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        times.push({ value: `${hh}:${mm}`, label: `${hh}:${mm}` });
      }
    }
    // Dodaj vreme za sledeći dan (00:00 - 03:00 sledećeg dana)
    for (let h = 0; h <= 3; h++) {
      for (let m = 0; m < 60; m += 30) {
        if (h === 3 && m > 0) break; // Završi na 03:00
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        times.push({
          value: `${(h + 24).toString().padStart(2, '0')}:${mm}`,
          label: `${hh}:${mm} (+1)`,
        });
      }
    }
    return times;
  }, []);
};

export default function NewRestaurantPage() {
  const timeOptions = useTimeOptions();
  console.log(timeOptions);
  const router = useRouter();
  const fromDefault =
    timeOptions.find((t) => t.value === '08:00')?.value ?? timeOptions[0].value;
  const toDefault =
    timeOptions.find((t) => t.value === '22:00')?.value ?? timeOptions[0].value;

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => fetchCities(),
    staleTime: Infinity,
  });

  const methods = useForm<RestaurantForm>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: '',
      description: '',
      email: '',
      phoneNumber: '',
      logo: null,
      location: {
        address: '',
        city: '',
        country: '',
        zipCode: '',
        lat: '',
        lng: '',
      },
      hours: DAYS.map((day) => ({
        day,
        open: false,
        from: fromDefault,
        to: toDefault,
      })),
      onlineOrdering: false,
      allowReservations: false,
    },
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Memoized validation for each step
  const stepValidation = useMemo(() => {
    const watchedValues = methods.watch();
    return [
      // Step 1: Basic info
      Boolean(watchedValues.name?.trim()) &&
        Boolean(watchedValues.description?.trim()) &&
        Boolean(watchedValues.email?.trim()),

      // Step 2: Location - convert to boolean
      Boolean(watchedValues.location?.address?.trim()) &&
        Boolean(watchedValues.location?.city?.trim()) &&
        Boolean(watchedValues.location?.country?.trim()) &&
        Boolean(watchedValues.location?.zipCode?.trim()) &&
        Boolean(watchedValues.location?.lat?.trim()) &&
        Boolean(watchedValues.location?.lng?.trim()),

      // Step 3: Working hours
      watchedValues.hours?.every((h) => !h.open || (h.from && h.to)) ?? false,
      // Step 4: Settings (always valid)
      true,
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.watch()]);

  const handleLogoChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      const file = files?.[0] ?? null;

      // Najpre očistimo prethodne greške
      methods.clearErrors('logo');

      if (!file) {
        // Nema fajla – resetuj preview i vrednost
        methods.setValue('logo', null);
        setLogoPreview(null);
        return;
      }

      // Dozvoljeni MIME tipovi
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        methods.setError('logo', {
          type: 'manual',
          message: 'Dozvoljeni formati su JPG i PNG.',
        });
        // Očistimo preview i ne postavljamo fajl
        setLogoPreview(null);
        methods.setValue('logo', null);
        return;
      }

      // Provera veličine (5 MB = 5 * 1024 * 1024 bytes)
      const maxSizeInBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        methods.setError('logo', {
          type: 'manual',
          message: 'Maksimalna veličina fajla je 5 MB.',
        });
        setLogoPreview(null);
        methods.setValue('logo', null);
        return;
      }

      // Validno – postavi fajl i napravi preview
      methods.setValue('logo', files);
      // Očistimo stari URL da izbegnemo curenje memorije
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoPreview(URL.createObjectURL(file));
    },
    [methods, logoPreview]
  );

  const handleRemoveLogo = useCallback(() => {
    methods.setValue('logo', null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [methods, logoPreview]);

  const handleStepChange = useCallback(
    (step: number) => {
      if (step <= currentStep || stepValidation[step - 1]) {
        setCurrentStep(step);
      }
    },
    [currentStep, stepValidation]
  );

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1 && stepValidation[currentStep]) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, stepValidation]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const createLocationMutation = useMutation({
    mutationFn: (location: any) => createLocation(location),
    onError: (error) => {
      toast.error(error.message || 'Nešto nije u redu');
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: RestaurantForm) => {
      const createdLocation = await createLocationMutation.mutateAsync(
        data.location
      );
      const locationId = createdLocation.id;
      // const locationId = '95d13ca5-5e84-4115-86a9-6d3e9974f8ee';

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('email', data.email || '');
      formData.append('phoneNumber', data.phoneNumber || '');
      formData.append('locationId', locationId);

      // Funkcija za normalizaciju vremena (24:00 -> 00:00, 25:00 -> 01:00, itd.)
      const normalizeTime = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        if (hours >= 24) {
          return `${(hours - 24).toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}`;
        }
        return time;
      };

      const hours = data.hours
        .filter((day) => day.open)
        .reduce((acc, item) => {
          const fromNormalized = normalizeTime(item.from);
          const toNormalized = normalizeTime(item.to);
          acc[item.day.toLowerCase()] = `${fromNormalized}-${toNormalized}`;
          return acc;
        }, {} as Record<string, string>);

      formData.append('workingHours', JSON.stringify(hours));

      if (data.logo?.[0]) {
        formData.append('logo', data.logo[0]);
      }

      const restaurant = await createRestaurant(formData);
      return restaurant;
    },
    onSuccess: (restaurant) => {
      toast.success('Restoran uspešno dodat!');
      methods.reset();
      setCurrentStep(0);
      setLogoPreview(null);
      router.push(`/restaurants/${restaurant.id}`);
    },
    onError: () => {
      toast.error('Doslo je do greske prilokom kreiranja restorana');
    },
  });

  const handleSubmitAll = useCallback(
    (data: RestaurantForm) => {
      mutation.mutate(data);
    },
    [mutation]
  );

  // Cleanup effect for logo preview
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Ime restorana *</Label>
        <Input
          id="name"
          {...methods.register('name')}
          placeholder="Unesite ime restorana"
          className={cn(
            methods.formState.errors.name &&
              'border-red-500 focus-visible:ring-red-500'
          )}
        />
        {methods.formState.errors.name && (
          <p className="text-sm text-red-500">
            {methods.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">E-mail *</Label>
        <Input
          id="email"
          {...methods.register('email')}
          placeholder="Unesite e-mail restorana"
          className={cn(
            methods.formState.errors.name &&
              'border-red-500 focus-visible:ring-red-500'
          )}
        />
        {methods.formState.errors.email && (
          <p className="text-sm text-red-500">
            {methods.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Broj telefona</Label>
        <Input
          id="phoneNumber"
          {...methods.register('phoneNumber')}
          placeholder="Unesite broj telefona"
          className={cn(
            methods.formState.errors.name &&
              'border-red-500 focus-visible:ring-red-500'
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Opis *</Label>
        <Textarea
          id="description"
          placeholder="Opišite svoj restoran..."
          {...methods.register('description')}
          className={cn(
            methods.formState.errors.description &&
              'border-red-500 focus-visible:ring-red-500'
          )}
          rows={4}
        />
        {methods.formState.errors.description && (
          <p className="text-sm text-red-500">
            {methods.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Logo restorana</Label>
        <div className="flex items-start space-x-4">
          {logoPreview && (
            <div className="relative">
              <Image
                src={logoPreview}
                alt="Logo preview"
                width={96}
                height={96}
                className="rounded-lg object-cover border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={handleRemoveLogo}
              >
                <X size={12} />
              </Button>
            </div>
          )}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload size={16} className="mr-2" />
              {logoPreview ? 'Promeni logo' : 'Dodaj logo'}
            </Button>
            {methods.formState.errors.logo && (
              <p className="text-sm text-red-500">
                {methods.formState.errors.logo.message as string}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Podržani formati: JPG, PNG (maks. 5MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocationStep = () => (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Lokacija restorana</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Adresa *</Label>
            <Input
              id="address"
              placeholder="Ulica i broj"
              {...methods.register('location.address')}
              className={cn(
                methods.formState.errors.location?.address &&
                  'border-red-500 focus-visible:ring-red-500'
              )}
            />
            {methods.formState.errors.location?.address && (
              <p className="text-sm text-red-500">
                {methods.formState.errors.location.address.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Grad *</Label>
              <Controller
                name="location.city"
                control={methods.control}
                render={({ field }) => (
                  <CityCombobox
                    cities={cities}
                    value={field.value}
                    onValueChange={field.onChange}
                    onCitySelect={(selectedCity) => {
                      methods.setValue(
                        'location.zipCode',
                        selectedCity.zipcode
                      );
                    }}
                    error={methods.formState.errors.location?.city?.message}
                    placeholder="Izaberi grad..."
                  />
                )}
              />
              {methods.formState.errors.location?.city && (
                <p className="text-sm text-red-500">
                  {methods.formState.errors.location.city.message}
                </p>
              )}
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="country">Država *</Label>
              <Input
                id="country"
                placeholder="Država"
                {...methods.register('location.country')}
                className={cn(
                  methods.formState.errors.location?.country &&
                    'border-red-500 focus-visible:ring-red-500'
                )}
              />
              {methods.formState.errors.location?.country && (
                <p className="text-sm text-red-500">
                  {methods.formState.errors.location.country.message}
                </p>
              )}
            </div> */}

            <CountrySelect
              value={methods.watch('location.country')}
              onValueChange={(value) =>
                methods.setValue('location.country', value)
              }
              error={methods.formState.errors.location?.country?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">Poštanski broj</Label>
            <Input
              id="zipCode"
              placeholder="Poštanski broj"
              {...methods.register('location.zipCode')}
              className={cn(
                methods.formState.errors.location?.zipCode &&
                  'border-red-500 focus-visible:ring-red-500'
              )}
              readOnly
            />
            {methods.formState.errors.location?.zipCode && (
              <p className="text-sm text-red-500">
                {methods.formState.errors.location.zipCode.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude (Geo. širina) *</Label>
              <Input
                id="lat"
                placeholder="44.7866"
                {...methods.register('location.lat')}
                className={cn(
                  methods.formState.errors.location?.lat &&
                    'border-red-500 focus-visible:ring-red-500'
                )}
              />
              {methods.formState.errors.location?.lat && (
                <p className="text-sm text-red-500">
                  {methods.formState.errors.location.lat.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude (Geo. dužina) *</Label>
              <Input
                id="lng"
                placeholder="20.4489"
                {...methods.register('location.lng')}
                className={cn(
                  methods.formState.errors.location?.lng &&
                    'border-red-500 focus-visible:ring-red-500'
                )}
              />
              {methods.formState.errors.location?.lng && (
                <p className="text-sm text-red-500">
                  {methods.formState.errors.location.lng.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWorkingHoursStep = () => (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Radni sati</h3>
        <p className="text-sm text-muted-foreground">
          Uključite prekidač za dane kada restoran radi i postavite radne sate.
        </p>
      </div>

      {methods.watch('hours').map((hour, index) => (
        <div
          key={hour.day}
          className="flex items-center justify-between p-3 rounded-lg border"
        >
          <div className="flex items-center space-x-3">
            <Switch
              checked={hour.open}
              onCheckedChange={(checked) =>
                methods.setValue(`hours.${index}.open`, checked)
              }
            />
            <span
              className={cn(
                'font-medium min-w-[100px]',
                hour.open ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {DAY_NAMES_SR[hour.day as keyof typeof DAY_NAMES_SR]}
            </span>
            {!hour.open && (
              <span className="text-sm text-muted-foreground">Zatvoreno</span>
            )}
          </div>

          {hour.open && (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Clock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Select
                  value={hour.from}
                  onValueChange={(value) =>
                    methods.setValue(`hours.${index}.from`, value)
                  }
                >
                  <SelectTrigger className="w-32 pl-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {timeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <span className="text-muted-foreground">do</span>

              <div className="relative">
                <Clock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Select
                  value={hour.to}
                  onValueChange={(value) =>
                    methods.setValue(`hours.${index}.to`, value)
                  }
                >
                  <SelectTrigger className="w-32 pl-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {timeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSettingsStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold">Dodatne opcije</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="space-y-1">
              <Label htmlFor="onlineOrdering" className="font-medium">
                Online naručivanje
              </Label>
              <p className="text-sm text-muted-foreground">
                Omogući korisnicima da naručuju hranu online
              </p>
            </div>
            <Switch
              id="onlineOrdering"
              checked={methods.watch('onlineOrdering')}
              onCheckedChange={(checked) =>
                methods.setValue('onlineOrdering', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="space-y-1">
              <Label htmlFor="allowReservations" className="font-medium">
                Rezervacije
              </Label>
              <p className="text-sm text-muted-foreground">
                Omogući korisnicima da rezervišu stolove
              </p>
            </div>
            <Switch
              id="allowReservations"
              checked={methods.watch('allowReservations')}
              onCheckedChange={(checked) =>
                methods.setValue('allowReservations', checked)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderLocationStep();
      case 2:
        return renderWorkingHoursStep();
      case 3:
        return renderSettingsStep();
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSubmitAll)}
        className="max-w-4xl"
      >
        <div className="w-full p-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Dodaj novi restoran</h1>
          </div>

          {/* Stepper */}
          <Stepper
            steps={STEPS}
            current={currentStep}
            valid={stepValidation}
            onStepClick={handleStepChange}
          />

          {/* Step Content */}
          <div className="min-h-[400px] py-6">{renderCurrentStep()}</div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Nazad
            </Button>

            <div className="flex space-x-2">
              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!stepValidation[currentStep]}
                >
                  Dalje
                </Button>
              ) : null}
              {currentStep === STEPS.length - 1 && (
                <Button
                  type="submit"
                  disabled={mutation.isPending || !stepValidation[currentStep]}
                >
                  {mutation.isPending ? 'Čuvanje...' : 'Sačuvaj restoran'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
