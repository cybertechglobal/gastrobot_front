'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';
import { Product } from '@/types/product';
import { Ingredient } from '@/types/ingredient';
import { Category } from '@/types/category';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? `Izmeni proizvod` : `Kreiraj novi proizvod`}
          </DialogTitle>
        </DialogHeader>
        <ProductForm
          categories={categories}
          ingredients={ingredients}
          restaurantId={restaurantId}
          onSubmitSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
          product={product}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
}
