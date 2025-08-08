'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Loader2, ChefHat } from 'lucide-react';
import { toast } from 'sonner';
import { ProductForm } from '../products/ProductForm';
import { fetchProducts } from '@/lib/api/products';
import { createMenuItem } from '@/lib/api/menu';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchCategories } from '@/lib/api/category';
import { fetchRestaurantIngredients } from '@/lib/api/ingredients';
import { Category } from '@/types/category';
import Image from 'next/image';

const existingItemSchema = z.object({
  itemId: z.string().min(1, 'Molimo izaberite stavku'),
  price: z.string().min(1, 'Cena je obavezna'),
});

interface AddProductDialogProps {
  restaurantId: string;
  menuId: string;
  preselectedCategory?: Category | null;
  trigger?: React.ReactNode;
}

export function AddProductDialog({
  restaurantId,
  menuId,
  preselectedCategory,
  trigger = <Button>Dodaj proizvod</Button>,
}: AddProductDialogProps) {
  const [activeTab, setActiveTab] = useState('existing');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 600);
  const [dialogOpen, setDialogOpen] = useState(false);

  const router = useRouter();

  // TanStack Query za fetchovanje produkata
  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: [
      'products',
      restaurantId,
      {
        name: debouncedSearch,
        ...(preselectedCategory && { categoryId: preselectedCategory.id }),
      },
    ],
    queryFn: () =>
      fetchProducts(restaurantId, {
        params: {
          name: debouncedSearch,
          ...(preselectedCategory && { categoryId: preselectedCategory.id }),
        },
      }),
    enabled: dialogOpen && activeTab === 'existing',
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: ingredients } = useQuery({
    queryKey: ['ingredients', restaurantId, { include: 'global' }],
    queryFn: () =>
      fetchRestaurantIngredients(restaurantId, {
        params: { include: 'global' },
      }),
  });

  const existingForm = useForm<z.infer<typeof existingItemSchema>>({
    resolver: zodResolver(existingItemSchema),
    defaultValues: {
      itemId: '',
      price: '',
    },
  });

  const products = productsResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: ({
      restaurantId,
      menuId,
      data,
    }: {
      restaurantId: string;
      menuId: string;
      data: any;
    }) => createMenuItem(restaurantId, menuId, data),
    onSuccess: () => {
      toast.success('Stavka je uspešno dodata u menu!');
      setDialogOpen(false);

      router.refresh();
    },
    onError: (error: Error) => {
      console.error('Failed to create menu item:', error);
      toast.error(error.message || 'Greška pri dodavanju stavke.');
    },
  });

  const onExistingSubmit = async (data: z.infer<typeof existingItemSchema>) => {
    createMutation.mutate({
      restaurantId,
      menuId,
      data: { productId: data.itemId, price: parseFloat(data.price) },
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj proizvod u meni</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Koristi postojeću stavku</TabsTrigger>
            <TabsTrigger value="create">Kreiraj novu stavku</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži stavke..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>

            <form
              onSubmit={existingForm.handleSubmit(onExistingSubmit)}
              className="space-y-4"
            >
              <div className="grid gap-1 max-h-60 overflow-y-auto">
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Učitavanje proizvoda...</span>
                  </div>
                ) : productsError ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-destructive">
                      Greška pri učitavanju proizvoda
                    </p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">
                      Nema pronađenih proizvoda
                    </p>
                  </div>
                ) : (
                  products.map((product) => (
                    <Card
                      key={product.id}
                      className={`cursor-pointer transition-colors py-0 m-1 ${
                        existingForm.watch('itemId') === product.id
                          ? 'ring-1 ring-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() =>
                        existingForm.setValue('itemId', product.id)
                      }
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-4">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gradient-to-br rounded from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                              <ChefHat className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold">{product.name}</h4>
                            {product.description && (
                              <p className="text-xs text-muted-foreground">
                                {product.description}
                              </p>
                            )}
                            <span className="text-xs text-blue-600 font-medium">
                              {product.category.name}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Cena (RSD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...existingForm.register('price')}
                />
                {existingForm.formState.errors.price && (
                  <p className="text-sm text-destructive">
                    {existingForm.formState.errors.price.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  Otkaži
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending ? 'Dodavanje...' : 'Dodaj u meni'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <ProductForm
              categories={categories || []}
              ingredients={ingredients?.data}
              restaurantId={restaurantId}
              onSubmitSuccess={() => console.log('Form submitted')}
              onCancel={() => console.log('Form cancelled')}
              isTab
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
