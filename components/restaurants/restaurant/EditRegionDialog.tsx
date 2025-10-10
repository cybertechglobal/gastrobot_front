// components/EditRegionDialog.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RegionFormData {
  title: string;
  area: 'inside' | 'outside' | undefined;
}

interface EditRegionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  regionTitle: string;
  regionArea?: 'inside' | 'outside';
  onUpdate: (data: RegionFormData) => void;
  isUpdating: boolean;
}

export const EditRegionDialog: React.FC<EditRegionDialogProps> = ({
  isOpen,
  onClose,
  regionTitle,
  regionArea,
  onUpdate,
  isUpdating,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<RegionFormData>({
    mode: 'onChange',
    defaultValues: {
      title: regionTitle,
      area: regionArea,
    },
  });

  const watchedArea = watch('area');

  // Reset form when dialog opens/closes or initial values change
  useEffect(() => {
    if (isOpen) {
      reset({
        title: regionTitle,
        area: regionArea,
      });
    }
  }, [isOpen, regionTitle, regionArea, reset]);

  const onSubmit = (data: RegionFormData) => {
    onUpdate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            Izmeni region
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">
              Naziv regiona
            </Label>
            <Input
              id="title"
              placeholder="npr. Bašta, Terasa..."
              {...register('title', {
                required: 'Naziv regiona je obavezan',
                validate: (value) =>
                  value.trim().length > 0 || 'Naziv ne može biti prazan',
              })}
              className="border-gray-300 dark:border-gray-600 mt-1 text-gray-900 dark:text-white"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="area"
              className="text-gray-700 dark:text-gray-300 mb-1"
            >
              Izaberi prostor
            </Label>
            <Select
              value={watchedArea}
              onValueChange={(value) =>
                setValue('area', value as 'inside' | 'outside', {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Izaberi prostor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inside">Unutra</SelectItem>
                <SelectItem value="outside">Napolje</SelectItem>
              </SelectContent>
            </Select>
            {errors.area && (
              <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={isUpdating || !isValid}
            >
              {isUpdating ? 'Ažuriranje...' : 'Ažuriraj'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
            >
              Otkaži
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
