import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings,
  Users,
  ShoppingCart,
  Bot,
  Loader2,
  XCircle,
} from 'lucide-react';
import {
  fetchRestaurantSettings,
  updateRestaurantSettings,
} from '@/lib/api/restaurants';

interface RestaurantSettings {
  allowReservations: boolean;
  allowOrdering: boolean;
  allowBot: boolean;
  [key: string]: boolean;
}

const RestaurantSettings = ({ restaurantId }: { restaurantId: string }) => {
  const queryClient = useQueryClient();

  // Query for fetching restaurant settings
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: fetchError,
    refetch: retryFetch,
  } = useQuery({
    queryKey: ['restaurantSettings', restaurantId],
    queryFn: () => fetchRestaurantSettings(restaurantId),
    staleTime: 3 * 60 * 1000,
  });

  // Mutation for updating restaurant settings
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: RestaurantSettings) =>
      updateRestaurantSettings(restaurantId, newSettings),
    onSuccess: (updatedSettings, variables) => {
      // Update the cache with the new data
      queryClient.setQueryData(
        ['restaurantSettings', restaurantId],
        updatedSettings
      );

      // Show success toast
      const settingKey = Object.keys(variables).find(
        (key) => variables[key] !== settings?.[key]
      );
      if (settingKey) {
        const settingName = settingKey
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase());
        const isEnabled = variables[settingKey];
        toast.success('Podešavanja su uspešno ažurirana!', {
          description: `${settingName} has been ${
            isEnabled ? 'enabled' : 'disabled'
          }.`,
        });
      }
    },
    onError: (error) => {
      // Show error toast
      toast.error('Neuspešno ažuriranje podešavanja', {
        description: error.message || 'Molimo pokušajte ponovo kasnije.',
      });

      // Optionally invalidate queries to refetch fresh data
      // queryClient.invalidateQueries(['restaurantSettings']);
    },
  });

  const handleSettingChange = async (key: any, value: any) => {
    const newSettings = { ...settings, [key]: value };
    updateSettingsMutation.mutate(newSettings);
  };

  const settingsConfig = [
    {
      key: 'allowReservations',
      title: 'Dozvoliti rezervacije',
      description: 'Omogućiti korisnicima da prave rezervacije stolova online',
      icon: Users,
    },
    {
      key: 'allowOrdering',
      title: 'Dozvoliti online poručivanje',
      description: 'Omogućiti korisnicima da poručuju hranu za preuzimanje',
      icon: ShoppingCart,
    },
    {
      key: 'allowBot',
      title: 'Aktivirati chatbot',
      description: 'Dozvoliti AI asistentu da pomaže korisnicima sa upitima',
      icon: Bot,
    },
  ];

  return (
    <div className="w-full max-w-2xl">
      <div className="pb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Podešavanja restorana</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Konfiguriši funkcije restorana i opcije za interakciju sa
              korisnicima
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Loading state for initial fetch */}
        {isLoadingSettings ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Učitavanje podešavanja...</span>
            </div>
          </div>
        ) : fetchError ? (
          // Error state for fetch failure
          <div className="space-y-4">
            <Alert className="border-destructive/50 text-destructive dark:border-destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {fetchError.message || 'Neuspešno učitavanje podešavanja'}
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <button
                onClick={() => retryFetch()}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                disabled={isLoadingSettings}
              >
                {isLoadingSettings ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Pokušavam ponovo...
                  </span>
                ) : (
                  '                    Pokušaj ponovo'
                )}
              </button>
            </div>
          </div>
        ) : (
          // Settings UI
          <>
            {settingsConfig.map((setting, index) => {
              const IconComponent = setting.icon;

              return (
                <div key={setting.key}>
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-1.5 bg-muted rounded-md mt-0.5">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <Label
                          htmlFor={setting.key}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {setting.title}
                        </Label>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {setting.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {updateSettingsMutation.isPending && (
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      )}
                      <Switch
                        id={setting.key}
                        checked={settings?.[setting.key] || false}
                        onCheckedChange={(checked) =>
                          handleSettingChange(setting.key, checked)
                        }
                        disabled={updateSettingsMutation.isPending}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>

                  {index < settingsConfig.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              );
            })}

            {/* Status indicator */}
            <div className="pt-4">
              <div className="flex items-center justify-center text-xs text-muted-foreground">
                {updateSettingsMutation.isPending ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Ažuriranje podešavanja...
                  </span>
                ) : (
                  <span>Podešavanja se automatski čuvaju</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantSettings;
