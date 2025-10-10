// app/restaurants/[id]/page.tsx
'use client';

import { JSX, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  MapPin,
  Edit,
  ChevronRight,
  ArrowLeft,
  Settings,
  Package,
  UtensilsCrossed,
  Users as UsersIcon,
  Camera,
  Upload,
  Trash,
  CheckSquare,
  Table,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import {
  deleteRestaurant,
  updateRestaurant,
  updateRestaurantLogo,
} from '@/lib/api/restaurants';
import { toast } from 'sonner';
import { DeleteDialog } from '@/components/DeleteDialog';
import { EditRestaurantDialog } from './EditRestaurantDialog';
import MenuList from '@/components/menu/MenuList';
import { useRouter } from 'next/navigation';
import { MenuDialogForm } from '@/components/menu/MenuDialogForm';
import Users from '@/components/users/Users';
import RestaurantIngredients from '@/components/ingredients/restaurant-ingredients/RestaurantIngredients';
import { Restaurant } from '@/types/restaurant';
import { Menu } from '@/types/menu';
import RestaurantSettings from './RestaurantSettings';
import ReservationDashboard from '@/components/reservations/Reservations';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/user';
import RegionsAndTables from './RegionsAndTables';
import Link from 'next/link';
import StarRating from '@/components/StarRating';
import { DAYS_OF_WEEK } from '@/lib/utils/translations';
import AddonsProductsSection from '@/components/addons-products/AddonsProductsSection';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage?: string;
  onImageUpdate: (imageUrl: string) => void;
  restaurantId: string;
  type: 'logo' | 'background';
  title: string;
}

interface BasicInfoSectionProps {
  restaurant: Restaurant;
  mutation: any;
  handleStatusChange: (status: 'active' | 'inactive') => void;
  status: 'active' | 'inactive';
  router: any;
  role: UserRole;
}

interface MenuSectionProps {
  restaurant: Restaurant;
  menus: Menu[];
}

interface UsersSectionProps {
  restaurantId: string;
}

interface RestaurantProfileProps {
  restaurant: Restaurant;
  menus: Menu[];
}

interface ImageFormData {
  imageFile: File;
}

interface Section {
  id: string;
  title: string;
  icon: JSX.Element;
  description: string;
  color: string;
  isVisible: boolean;
}

// Default logo component
const DefaultLogo: React.FC = () => (
  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
    <svg
      className="w-10 h-10 text-gray-400 dark:text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0V9a1 1 0 011-1h4a1 1 0 011 1v13.4"
      />
    </svg>
  </div>
);

// Default background component
const DefaultBackground: React.FC = () => (
  <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
    <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-600" />
  </div>
);

// Universal Image Upload Modal Component
const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  currentImage,
  onImageUpdate,
  restaurantId,
  type,
  title,
}) => {
  const [previewImage, setPreviewImage] = useState<string | undefined>(
    currentImage
  );
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ImageFormData>();

  const imageMutation = useMutation({
    mutationFn: async (imageData: File) => {
      const formData = new FormData();
      const fieldName = type === 'logo' ? 'logo' : 'backgroundImage';
      formData.append(fieldName, imageData);

      const res = await updateRestaurantLogo(restaurantId, formData);
      return res;
    },
    onSuccess: (data: { logoUrl?: string; backgroundImageUrl?: string }) => {
      const imageUrl = type === 'logo' ? data.logoUrl : data.backgroundImageUrl;
      if (imageUrl) {
        onImageUpdate(imageUrl);
        toast.success(
          `${
            type === 'logo' ? 'Logo' : 'Pozadinska slika'
          } je uspešno ažuriran!`
        );
        onClose();
      }
    },
    onError: () => {
      toast.error(
        `Greška prilikom ažuriranja ${
          type === 'logo' ? 'loga' : 'pozadinske slike'
        }`
      );
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validacija tipa fajla
      if (!file.type.startsWith('image/')) {
        toast.error('Molimo izaberite validnu sliku');
        return;
      }

      // Validacija veličine (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Slika je prevelika. Maksimalna veličina je 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
        setValue('imageFile', file);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ImageFormData) => {
    imageMutation.mutate(data.imageFile);
  };

  if (!isOpen) return null;

  const isLogo = type === 'logo';
  const previewContainerClass = isLogo
    ? 'w-24 h-24 rounded-2xl'
    : 'w-full h-32 rounded-xl';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>

        <div className="space-y-4">
          {/* Preview trenutne slike */}
          <div className="flex justify-center mb-4">
            <div
              className={`${previewContainerClass} overflow-hidden shadow-lg`}
            >
              {previewImage ? (
                <Image
                  src={previewImage}
                  width={isLogo ? 96 : 400}
                  height={isLogo ? 96 : 128}
                  alt={`${type} preview`}
                  className="w-full h-full object-cover"
                />
              ) : isLogo ? (
                <DefaultLogo />
              ) : (
                <DefaultBackground />
              )}
            </div>
          </div>

          {/* File input */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
            <input
              type="file"
              accept="image/*"
              {...register('imageFile', {
                required: !previewImage ? 'Molimo izaberite sliku' : false,
              })}
              onChange={handleFileSelect}
              className="hidden"
              id={`${type}-upload`}
            />
            <div
              onClick={() => document.getElementById(`${type}-upload`)?.click()}
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Kliknite za izbor slike
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                PNG, JPG do 5MB
                {!isLogo && <br />}
                {!isLogo && 'Preporučuje se format 16:9 (npr. 1200x675px)'}
              </span>
            </div>
          </div>

          {errors.imageFile && (
            <p className="text-red-600 dark:text-red-400 text-sm">
              {errors.imageFile.message}
            </p>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={imageMutation.isPending}
            >
              Otkaži
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="flex-1"
              disabled={imageMutation.isPending}
            >
              {imageMutation.isPending ? 'Čuva se...' : 'Sačuvaj'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Basic Info Section Component
const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  restaurant,
  handleStatusChange,
  status,
  role,
}) => (
  <div className="max-w-[1200px] space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold tracking-tight">Osnovni Podaci</h2>
      <EditRestaurantDialog
        restaurant={restaurant}
        button={
          <Button variant="outline" size="sm" className="gap-2">
            <Edit size={16} />
            Izmeni
          </Button>
        }
      />
    </div>

    {/* Status Badge */}
    {role === 'root' && (
      <div className="inline-block">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px] h-9 border-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Aktivan
              </div>
            </SelectItem>
            <SelectItem value="inactive">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                Neaktivan
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    )}

    {/* Info Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-6">
        <div className="group">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Ime
          </Label>
          <p className="text-base font-medium">{restaurant.name}</p>
        </div>

        <div className="group">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Lokacija
          </Label>
          <p className="text-base">
            {restaurant.location?.city}, {restaurant.location?.address}
          </p>
        </div>

        <div className="group">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Kontakt info
          </Label>
          <p className="text-base">{restaurant.phoneNumber || '/'}</p>
        </div>

        <div className="group">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            E-mail
          </Label>
          <p className="text-base text-blue-600 dark:text-blue-400">
            {restaurant.email || '/'}
          </p>
        </div>
      </div>

      {/* Right Column - Working Hours */}
      <div className="group">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
          Radno vreme
        </Label>
        <div className="space-y-2">
          {DAYS_OF_WEEK.map(({ day, key }) => {
            const hours = restaurant.workingHours?.[key];
            const isClosed = !hours || hours === 'Closed';

            return (
              <div
                key={day}
                className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/50 hover:bg-muted/80 transition-colors"
              >
                <span className="capitalize font-medium text-sm">{day}</span>
                <span
                  className={`text-sm font-medium ${
                    isClosed ? 'text-muted-foreground' : 'text-foreground'
                  }`}
                >
                  {hours || 'Closed'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

// Products Section Component
const ProductsAddonsSection = ({ restaurantId }: { restaurantId: string }) => (
  <AddonsProductsSection restaurantId={restaurantId} />
);

// Menu Section Component
const MenuSection: React.FC<MenuSectionProps> = ({ restaurant, menus }) => (
  <div>
    <div className="w-full flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold">Jelovnik / Karta pica</h2>
      <MenuDialogForm
        restaurantId={restaurant?.id}
        trigger={
          <Button variant="default" className="cursor-pointer">
            + Novi Menu
          </Button>
        }
      />
    </div>
    <MenuList menus={menus} restaurantId={restaurant?.id} />
  </div>
);

// Users Section Component
const UsersSection: React.FC<UsersSectionProps> = ({ restaurantId }) => (
  <Users restaurantId={restaurantId} />
);

// Settings Section Component
const SettingsSection: React.FC<UsersSectionProps> = ({ restaurantId }) => (
  <RestaurantSettings restaurantId={restaurantId} />
);

const RestaurantProfile: React.FC<RestaurantProfileProps> = ({
  restaurant,
  menus,
}) => {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<string>('overview');
  const [breadcrumb, setBreadcrumb] = useState<string[]>([restaurant.name]);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState<boolean>(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] =
    useState<boolean>(false);
  const [currentLogo, setCurrentLogo] = useState<string | undefined>(
    restaurant?.logoUrl
  );
  const [currentBackgroundImage, setCurrentBackgroundImage] = useState<
    string | undefined
  >(restaurant?.backgroundImageUrl);

  console.log(restaurant);

  const { data: session } = useSession();

  const userRole = session?.user.restaurantUsers[0]?.role || undefined;

  // Status dropdown state
  const [status, setStatus] = useState<'active' | 'inactive'>(
    restaurant.status
  );

  useEffect(() => {
    const hash = window.location.hash.slice(1); // Ukloni # iz hash-a
    if (hash) {
      const section = sections.find((s) => s.id === hash);
      if (section && section.isVisible) {
        setCurrentView(hash);
        setBreadcrumb([restaurant.name, section.title]);
      }
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const section = sections.find((s) => s.id === hash);
        if (section && section.isVisible) {
          setCurrentView(hash);
          setBreadcrumb([restaurant.name, section.title]);
        }
      } else {
        // Ako nema hash-a, vrati se na overview
        setCurrentView('overview');
        setBreadcrumb([restaurant.name]);
      }
    };

    // Slusaj promene hash-a
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [restaurant.name]);

  const mutation = useMutation({
    mutationFn: async (newStatus: 'active' | 'inactive') => {
      await updateRestaurant(restaurant.id, { status: newStatus });
    },
    onSuccess: () => {
      toast.success('Status uspešno ažuriran');
    },
    onError: (err: any) => {
      console.log(err?.status);
      toast.error('Greška pri ažuriranju statusa');
    },
  });

  const handleStatusChange = (newStatus: 'active' | 'inactive') => {
    setStatus(newStatus);
    mutation.mutate(newStatus);
  };

  const handleLogoUpdate = (newLogoUrl: string) => {
    setCurrentLogo(newLogoUrl);
  };

  const handleBackgroundImageUpdate = (newbackgroundImage: string) => {
    setCurrentBackgroundImage(newbackgroundImage);
  };

  const navigateTo = (view: string, title: string) => {
    setCurrentView(view);
    setBreadcrumb([restaurant.name, title]);
    router.push(`#${view}`, { scroll: false });
  };

  const goBack = () => {
    setCurrentView('overview');
    setBreadcrumb([restaurant.name]);
    router.push(window.location.pathname, { scroll: false });
  };

  const getNavigationUrl = () => {
    return userRole === 'root'
      ? `/restaurants/${restaurant.id}/reviews`
      : `/my-restaurant/reviews`;
  };

  const sections: Section[] = [
    {
      id: 'osnovni',
      title: 'Osnovni podaci',
      icon: <Settings className="w-6 h-6" />,
      description: 'Upravljanje osnovnim informacijama o restoranu',
      color: 'from-primary to-primary/70',
      isVisible: true,
    },
    {
      id: 'sastojci',
      title: 'Sastojci',
      icon: <Package className="w-6 h-6" />,
      description: 'Upravljanje sastojcima',
      color: 'from-primary to-primary/70',
      isVisible: true,
    },
    {
      id: 'proizvodi',
      title: 'Proizvodi i Dodaci',
      icon: <Package className="w-6 h-6" />,
      description: 'Upravljanje proizvodima i dodacima za hranu',
      color: 'from-primary to-primary/70',
      isVisible: true,
    },
    {
      id: 'jelovnik',
      title: 'Jelovnik',
      icon: <UtensilsCrossed className="w-6 h-6" />,
      description: 'Kreiranje i uređivanje jelovnika',
      color: 'from-primary to-primary/70',
      isVisible: true,
    },
    {
      id: 'korisnici',
      title: 'Korisnici',
      icon: <UsersIcon className="w-6 h-6" />,
      description: 'Upravljanje korisnicima i dozvolama',
      color: 'from-primary to-primary/70',
      isVisible: true,
    },
    {
      id: 'rezervacije',
      title: 'Rezervacije',
      icon: <CheckSquare className="w-6 h-6" />,
      description: 'Upravljanje rezervacijama',
      color: 'from-primary to-primary/70',
      isVisible: userRole === 'root',
    },
    {
      id: 'regioni',
      title: 'Stolovi i Regioni',
      icon: <Table className="w-6 h-6" />,
      description: 'Upravljanje stolovima i regionima',
      color: 'from-primary to-primary/70',
      isVisible: true,
    },
    {
      id: 'podesavanja',
      title: 'Podešavanja',
      icon: <Settings className="w-6 h-6" />,
      description: 'Konfigurisanje restorana',
      color: 'from-primary to-primary/70',
      isVisible: true,
    },
  ];

  if (currentView === 'overview') {
    return (
      <div className="container xl:max-w-[1024px]">
        {/* Restaurant Header */}
        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm mb-8 overflow-hidden">
          {/* Background Image Section */}
          <div
            className="h-48 relative cursor-pointer group"
            onClick={() => setIsBackgroundModalOpen(true)}
          >
            {currentBackgroundImage &&
            !restaurant.backgroundImageUrl?.includes('url.com') ? (
              <Image
                src={currentBackgroundImage}
                fill
                alt={`Pozadinska slika ${restaurant.name}`}
                className="object-cover"
              />
            ) : (
              <DefaultBackground />
            )}

            {/* Background image hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="text-white text-center">
                <Camera className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm font-medium">
                  Promenite pozadinsku sliku
                </span>
              </div>
            </div>
          </div>

          {/* Restaurant Info Section */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
              {/* Left section - Logo and Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1">
                {/* Logo */}
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-200 relative group"
                  onClick={() => setIsLogoModalOpen(true)}
                >
                  {currentLogo && !restaurant.logoUrl?.includes('url.com') ? (
                    <Image
                      src={currentLogo}
                      width={80}
                      height={80}
                      alt={`Logo ${restaurant.name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <DefaultLogo />
                  )}

                  {/* Logo hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2 flex-wrap gap-2">
                    {/* Status indicator circle */}
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    ></div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
                      {restaurant.name}
                    </h1>
                  </div>
                  <div className="flex items-start text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-3">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="break-words">
                      {restaurant.location?.city},{' '}
                      {restaurant.location?.address}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words">
                    {restaurant.description}
                  </p>
                </div>
              </div>

              {/* Right section - Actions */}
              <div className="flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-3 sm:gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 lg:border-l lg:pl-6">
                {/* Rating Link */}
                <Link
                  href={getNavigationUrl()}
                  className="duration-200 hover:scale-110 text-blue-400 flex-shrink-0"
                >
                  <StarRating
                    rating={restaurant?.reviewable?.averageRating || 0}
                    label="rating:"
                  />
                </Link>

                {/* Delete button */}
                <DeleteDialog
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#F97316] text-destructive hover:text-destructive-800 transition-colors flex-shrink-0 sm:w-auto"
                    >
                      <Trash className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Obriši</span>
                    </Button>
                  }
                  description="Ova akcija je nepovratna. Restoran će biti trajno obrisan iz sistema."
                  successMessage="Restoran je uspešno obrisan"
                  errorMessage="Greška prilikom brisanja restorana"
                  mutationOptions={{
                    mutationFn: () => deleteRestaurant(restaurant.id),
                    onSuccess: () => {
                      router.replace('/restaurants');
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map(
            (section) =>
              section.isVisible && (
                <div
                  key={section.id}
                  onClick={() => navigateTo(section.id, section.title)}
                  className="group cursor-pointer bg-white dark:bg-background rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-800 hover:border-transparent hover:scale-103"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${section.color} dark:from-gray-900 dark:to-gray-950 rounded-xl flex items-center justify-center mb-4 group-hover:scale-106 transition-transform`}
                  >
                    <div className="text-white">{section.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {section.description}
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    Upravljaj
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )
          )}
        </div>

        {/* Logo Upload Modal */}
        <ImageUploadModal
          isOpen={isLogoModalOpen}
          onClose={() => setIsLogoModalOpen(false)}
          currentImage={currentLogo}
          onImageUpdate={handleLogoUpdate}
          restaurantId={restaurant.id}
          type="logo"
          title="Promena loga"
        />

        {/* Background Image Upload Modal */}
        <ImageUploadModal
          isOpen={isBackgroundModalOpen}
          onClose={() => setIsBackgroundModalOpen(false)}
          currentImage={currentBackgroundImage}
          onImageUpdate={handleBackgroundImageUpdate}
          restaurantId={restaurant.id}
          type="background"
          title="Promena pozadinske slike"
        />
      </div>
    );
  }

  // Individual section view
  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={goBack}
          className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Nazad</span>
        </button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 dark:text-white font-medium">
          {breadcrumb[breadcrumb.length - 1]}
        </span>
      </div>

      {/* Section Content */}
      {currentView !== 'rezervacije' && (
        <div className="bg-white dark:bg-gray-950 rounded-2xl p-2 sm:p-6">
          {currentView === 'osnovni' && (
            <BasicInfoSection
              restaurant={restaurant}
              mutation={mutation}
              handleStatusChange={handleStatusChange}
              status={status}
              router={router}
              role={userRole}
            />
          )}
          {currentView === 'proizvodi' && (
            <ProductsAddonsSection restaurantId={restaurant.id} />
          )}
          {currentView === 'sastojci' && (
            <RestaurantIngredients restaurantId={restaurant.id} />
          )}
          {currentView === 'jelovnik' && (
            <MenuSection restaurant={restaurant} menus={menus} />
          )}
          {currentView === 'korisnici' && (
            <UsersSection restaurantId={restaurant.id} />
          )}
          {currentView === 'regioni' && (
            <RegionsAndTables restaurantId={restaurant.id} />
          )}
          {currentView === 'podesavanja' && (
            <SettingsSection restaurantId={restaurant.id} />
          )}
        </div>
      )}
      {currentView === 'rezervacije' && (
        <ReservationDashboard restaurantId={restaurant.id} />
      )}

      {/* Image Upload Modals */}
      <ImageUploadModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        currentImage={currentLogo}
        onImageUpdate={handleLogoUpdate}
        restaurantId={restaurant.id}
        type="logo"
        title="Promena loga"
      />

      <ImageUploadModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
        currentImage={currentBackgroundImage}
        onImageUpdate={handleBackgroundImageUpdate}
        restaurantId={restaurant.id}
        type="background"
        title="Promena pozadinske slike"
      />
    </div>
  );
};

export default RestaurantProfile;
