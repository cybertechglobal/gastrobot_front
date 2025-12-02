'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ProductForm } from './ProductForm';
import { Product } from '@/types/product';
import { Ingredient } from '@/types/ingredient';
import { Category } from '@/types/category';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  categories: Category[];
  ingredients: Ingredient[] | undefined;
  product?: Product | null;
  mode?: 'create' | 'edit';
}

export function CreateProductDialog({
  open,
  onOpenChange,
  restaurantId,
  categories,
  ingredients,
  product,
  mode = product ? 'edit' : 'create',
}: CreateProductDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const title = mode === 'edit' ? 'Izmeni proizvod' : 'Kreiraj novi proizvod';

  const FormContent = (
    <ProductForm
      categories={categories}
      ingredients={ingredients}
      restaurantId={restaurantId}
      onSubmitSuccess={() => onOpenChange(false)}
      onCancel={() => onOpenChange(false)}
      product={product}
      mode={mode}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {FormContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-8">{FormContent}</div>
      </DrawerContent>
    </Drawer>
  );
}
