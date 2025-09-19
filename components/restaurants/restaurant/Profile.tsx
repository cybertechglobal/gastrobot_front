// app/restaurants/[id]/page.tsx
'use client';

import { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  MapPin,
  Pencil,
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
import Products from '@/components/products/Products';
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

const fullWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

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
  <div className="space-y-6">
    <div className="flex gap-5 mb-5 items-center">
      <h2 className="text-xl font-bold">Osnovni Podaci</h2>
      <EditRestaurantDialog
        restaurant={restaurant}
        button={
          <Button variant="ghost" className="cursor-pointer">
            <Pencil size={16} />
            Izmeni
          </Button>
        }
      />
    </div>

    {/* Status Controls */}
    {role === 'root' && (
      <div className="flex items-center space-x-4 mb-6">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-48 bg-slate-800 border border-slate-700 text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 text-slate-100">
            <SelectItem value="active">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2" />
              Aktivan
            </SelectItem>
            <SelectItem value="inactive">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2" />
              Neaktivan
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="space-y-1">
        <Label>Ime</Label>
        <p>{restaurant.name}</p>
      </div>
      <div className="space-y-1">
        <Label>Lokacija</Label>
        <p>
          {restaurant.location?.city}, {restaurant.location?.address}
        </p>
      </div>
      <div className="space-y-1">
        <Label>Kontakt info</Label>
        <p>{restaurant.phoneNumber || '/'}</p>
      </div>
      <div className="space-y-1">
        <Label>E-mail</Label>
        <p>{restaurant.email || '/'}</p>
      </div>
      <div className="space-y-1">
        <Label className="mb-2">Radno vreme</Label>
        <ul className="ml-0 list-none">
          {fullWeek.map((day) => (
            <li key={day} className="text-sm mb-1 flex justify-between">
              <span className="capitalize font-bold">{day}:</span>
              <span className="text-gray-700 dark:text-primary">
                {(restaurant.workingHours && restaurant.workingHours[day]) ||
                  'Closed'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

// Products Section Component
const ProductsSection = ({ restaurantId }: { restaurantId: string }) => (
  <Products restaurantId={restaurantId} />
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

  console.log(restaurant)

  const { data: session } = useSession();

  const userRole = session?.user.restaurantUsers[0]?.role || undefined;

  // Status dropdown state
  const [status, setStatus] = useState<'active' | 'inactive'>(
    restaurant.status
  );

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
  };

  const goBack = () => {
    setCurrentView('overview');
    setBreadcrumb([restaurant.name]);
  };

  const sections: Section[] = [
    {
      id: 'osnovni',
      title: 'Osnovni podaci',
      icon: <Settings className="w-6 h-6" />,
      description: 'Upravljanje osnovnim informacijama o restoranu',
      color: 'from-blue-500 to-blue-600',
      isVisible: true,
    },
    {
      id: 'sastojci',
      title: 'Sastojci',
      icon: <Package className="w-6 h-6" />,
      description: 'Upravljanje sastojcima',
      color: 'from-green-500 to-green-600',
      isVisible: true,
    },
    {
      id: 'proizvodi',
      title: 'Proizvodi',
      icon: <Package className="w-6 h-6" />,
      description: 'Upravljanje proizvodima i inventarom',
      color: 'from-green-500 to-green-600',
      isVisible: true,
    },
    {
      id: 'jelovnik',
      title: 'Jelovnik',
      icon: <UtensilsCrossed className="w-6 h-6" />,
      description: 'Kreiranje i uređivanje jelovnika',
      color: 'from-orange-500 to-orange-600',
      isVisible: true,
    },
    {
      id: 'korisnici',
      title: 'Korisnici',
      icon: <UsersIcon className="w-6 h-6" />,
      description: 'Upravljanje korisnicima i dozvolama',
      color: 'from-purple-500 to-purple-600',
      isVisible: true,
    },
    {
      id: 'rezervacije',
      title: 'Rezervacije',
      icon: <CheckSquare className="w-6 h-6" />,
      description: 'Upravljanje rezervacijama',
      color: 'from-purple-500 to-purple-600',
      isVisible: userRole === 'root',
    },
    {
      id: 'regioni',
      title: 'Stolovi i Regioni',
      icon: <Table className="w-6 h-6" />,
      description: 'Upravljanje stolovima i regionima',
      color: 'from-purple-500 to-purple-600',
      isVisible: true,
    },
    {
      id: 'podesavanja',
      title: 'Podešavanja',
      icon: <Settings className="w-6 h-6" />,
      description: 'Konfigurisanje restorana',
      color: 'from-gray-500 to-gray-600',
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
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-200 relative group"
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
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    {/* Status indicator circle */}
                    <div
                      className={`w-3 h-3 rounded-full mr-3 ${
                        status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    ></div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {restaurant.name}
                    </h1>
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3">
                    <MapPin className="w-5 h-5 mr-2" />
                    {restaurant.location?.city}, {restaurant.location?.address}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {restaurant.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Delete button */}
                <DeleteDialog
                  trigger={
                    <Button
                      variant="outline"
                      className="border-[#F97316] text-destructive hover:text-destructive-800 transition-colors"
                    >
                      <Trash />
                      Obriši
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
                  className="group cursor-pointer bg-white dark:bg-background rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-800 hover:border-transparent hover:scale-105"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${section.color} dark:from-gray-900 dark:to-gray-950 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
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
        <div className="bg-white dark:bg-gray-950 rounded-2xl p-6">
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
            <ProductsSection restaurantId={restaurant.id} />
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
