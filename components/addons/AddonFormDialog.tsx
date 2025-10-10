'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  createAddonGroup,
  createAddonOption,
  updateAddonGroup,
  updateAddonOption,
} from '@/lib/api/addon';
import { AddonGroup } from '@/types/addon';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const addonOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Ime opcije je obavezno'),
  description: z.string().optional(),
  price: z.string().min(1, 'Cena je obavezna'),
  isAvailable: z.boolean().default(true),
  _isNew: z.boolean().optional(),
});

const addonGroupSchema = z.object({
  name: z.string().min(1, 'Ime grupe je obavezno'),
  description: z.string().optional(),
  minSelection: z.string().min(1, 'Minimalan broj je obavezan'),
  maxSelection: z.string().min(1, 'Maksimalan broj je obavezan'),
  addonOptions: z.array(addonOptionSchema).min(1, 'Dodajte bar jednu opciju'),
});

type AddonGroupFormData = z.infer<typeof addonGroupSchema>;

interface AddonGroupFormDialogProps {
  restaurantId: string;
  addonGroup?: AddonGroup;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddonGroupFormDialog({
  restaurantId,
  addonGroup,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddonGroupFormDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled =
    controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const queryClient = useQueryClient();
  const isEdit = !!addonGroup;

  const resolver: Resolver<AddonGroupFormData> = zodResolver(
    addonGroupSchema
  ) as unknown as Resolver<AddonGroupFormData>;

  const form = useForm<AddonGroupFormData>({
    resolver,
    defaultValues: {
      name: '',
      description: '',
      minSelection: '0',
      maxSelection: '1',
      addonOptions: [
        {
          name: '',
          description: '',
          price: '',
          isAvailable: true,
          _isNew: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'addonOptions',
  });

  useEffect(() => {
    if (addonGroup && open) {
      form.reset({
        name: addonGroup.name,
        description: addonGroup.description || '',
        minSelection: addonGroup.minSelection.toString(),
        maxSelection: addonGroup.maxSelection.toString(),
        addonOptions: Array.isArray(addonGroup.addonOptions)
          ? addonGroup.addonOptions.map((option) => ({
              id: option.id,
              name: option.name,
              description: option.description || '',
              price: option.price.toString(),
              isAvailable: option.isAvailable,
              _isNew: false,
            }))
          : [
              {
                name: '',
                description: '',
                price: '',
                isAvailable: true,
                _isNew: true,
              },
            ],
      });
    } else if (!addonGroup && open) {
      form.reset({
        name: '',
        description: '',
        minSelection: '0',
        maxSelection: '1',
        addonOptions: [
          {
            name: '',
            description: '',
            price: '',
            isAvailable: true,
            _isNew: true,
          },
        ],
      });
    }
  }, [addonGroup, open, form]);

  const mutation = useMutation({
    mutationFn: async (data: AddonGroupFormData) => {
      if (isEdit && addonGroup) {
        const groupPayload = {
          name: data.name,
          description: data.description || '',
          minSelection: parseInt(data.minSelection),
          maxSelection: parseInt(data.maxSelection),
        };

        const updatedGroup = await updateAddonGroup(
          addonGroup.id,
          groupPayload
        );

        const updatePromises = data.addonOptions.map((option) => {
          const optionPayload = {
            name: option.name,
            description: option.description || '',
            price: parseFloat(option.price),
            isAvailable: option.isAvailable,
          };

          if (option._isNew) {
            return createAddonOption(addonGroup.id, optionPayload);
          } else if (option.id) {
            return updateAddonOption(option.id, optionPayload);
          }
          return Promise.resolve();
        });

        await Promise.all(updatePromises);

        return updatedGroup;
      } else {
        const groupPayload = {
          name: data.name,
          description: data.description || '',
          minSelection: parseInt(data.minSelection),
          maxSelection: parseInt(data.maxSelection),
        };

        const createdGroup = await createAddonGroup(restaurantId, groupPayload);

        const optionPromises = data.addonOptions.map((option) => {
          const optionPayload = {
            name: option.name,
            description: option.description || '',
            price: parseFloat(option.price),
            isAvailable: option.isAvailable,
          };
          return createAddonOption(createdGroup.id, optionPayload);
        });

        await Promise.all(optionPromises);

        return createdGroup;
      }
    },
    onSuccess: () => {
      toast.success(
        isEdit
          ? 'Grupa dodataka je uspešno ažurirana'
          : 'Grupa dodataka je uspešno kreirana'
      );
      queryClient.invalidateQueries({
        queryKey: ['addonGroups', restaurantId],
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error('Failed to save addon group:', error);
      toast.error(error.message || 'Greška pri čuvanju grupe dodataka');
    },
  });

  const onSubmit = (data: AddonGroupFormData) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    if (!mutation.isPending) {
      setOpen(false);
      form.reset();
    }
  };

  const addOption = () => {
    append({
      name: '',
      description: '',
      price: '',
      isAvailable: true,
      _isNew: true,
    });
  };

  const title = isEdit ? 'Uredi grupu dodataka' : 'Kreiraj novu grupu dodataka';

  // Zajednički sadržaj forme
  const FormContent = (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Naziv grupe *</Label>
          <Input
            id="name"
            placeholder="npr. Prelivi, Dodaci, Veličina..."
            {...form.register('name')}
            disabled={mutation.isPending}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Opis (opciono)</Label>
          <Textarea
            id="description"
            placeholder="Kratak opis grupe dodataka..."
            {...form.register('description')}
            disabled={mutation.isPending}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minSelection">Minimalan izbor *</Label>
            <Input
              id="minSelection"
              type="number"
              min="0"
              placeholder="0"
              {...form.register('minSelection')}
              disabled={mutation.isPending}
            />
            {form.formState.errors.minSelection && (
              <p className="text-sm text-destructive">
                {form.formState.errors.minSelection.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxSelection">Maksimalan izbor *</Label>
            <Input
              id="maxSelection"
              type="number"
              min="1"
              placeholder="1"
              {...form.register('maxSelection')}
              disabled={mutation.isPending}
            />
            {form.formState.errors.maxSelection && (
              <p className="text-sm text-destructive">
                {form.formState.errors.maxSelection.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Addon Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Opcije *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            disabled={mutation.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj opciju
          </Button>
        </div>

        {form.formState.errors.addonOptions && (
          <p className="text-sm text-destructive">
            {form.formState.errors.addonOptions.message}
          </p>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {fields.map((field, index) => (
            <Card key={field.id} className="relative">
              <CardContent className="p-4 space-y-3">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => remove(index)}
                    disabled={mutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}

                <div className="space-y-2 pr-8">
                  <Label>Naziv opcije *</Label>
                  <Input
                    placeholder="npr. Čokoladni preliv, Velika..."
                    {...form.register(`addonOptions.${index}.name`)}
                    disabled={mutation.isPending}
                  />
                  {form.formState.errors.addonOptions?.[index]?.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.addonOptions[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Opis (opciono)</Label>
                  <Input
                    placeholder="Dodatne informacije..."
                    {...form.register(`addonOptions.${index}.description`)}
                    disabled={mutation.isPending}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Cena (RSD) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...form.register(`addonOptions.${index}.price`)}
                      disabled={mutation.isPending}
                    />
                    {form.formState.errors.addonOptions?.[index]?.price && (
                      <p className="text-sm text-destructive">
                        {
                          form.formState.errors.addonOptions[index]?.price
                            ?.message
                        }
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Dostupnost</Label>
                    <div className="flex items-center space-x-2 h-10">
                      <Checkbox
                        id={`available-${index}`}
                        checked={form.watch(
                          `addonOptions.${index}.isAvailable`
                        )}
                        onCheckedChange={(checked) =>
                          form.setValue(
                            `addonOptions.${index}.isAvailable`,
                            checked as boolean
                          )
                        }
                        disabled={mutation.isPending}
                      />
                      <Label
                        htmlFor={`available-${index}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        Dostupno
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Actions - samo na desktop */}
      {isDesktop && (
        <div className="flex gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={mutation.isPending}
            className="flex-1"
          >
            Otkaži
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={mutation.isPending}
            className="flex-1"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEdit ? 'Ažurira se...' : 'Kreira se...'}
              </>
            ) : isEdit ? (
              'Ažuriraj'
            ) : (
              'Kreiraj'
            )}
          </Button>
        </div>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {FormContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="h-[96vh] max-h-[96vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 mb-2">{FormContent}</div>
        <DrawerFooter className="pt-2">
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEdit ? 'Ažurira se...' : 'Kreira se...'}
              </>
            ) : isEdit ? (
              'Ažuriraj'
            ) : (
              'Kreiraj'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Otkaži
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
