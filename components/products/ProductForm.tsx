'use client';

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { toast } from 'sonner';
import { X, Plus, Upload, Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import IngredientModal from '../ingredients/IngredientModal';
import { createProduct, updateProduct } from '@/lib/api/products';
import {
  createProductIngredient,
  deleteProductIngredient,
  updateProductIngredient,
} from '@/lib/api/ingredients';
import { Badge } from '../ui/badge';
import { Product } from '@/types/product';
import { Ingredient } from '@/types/ingredient';
import { Category } from '@/types/category';
import Image from 'next/image';
import { useIngredientsSearch } from '@/hooks/query/useIngredients';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const toNull = <T,>(v: T | undefined | null) => (v === undefined ? null : v);

const productSchema = z.object({
  name: z.string().min(1, 'Naziv proizvoda je obavezan'),
  description: z.string().optional(),
  image: z.any().optional(),
  categoryId: z.string().min(1, 'Kategorija je obavezna'),
  ingredients: z
    .array(
      z.object({
        id: z.string().optional(), // ID za postojeće ingredijente (edit mode)
        ingredientId: z.string().min(1, 'Sastojak je obavezan'),
        unit: z.string().trim().min(1).optional().nullable(),
        quantity: z
          .number()
          .positive('Količina mora biti veća od 0')
          .optional()
          .nullable(),
        _toDelete: z.boolean().optional(), // Flag za brisanje
      })
    )
    .optional(),
});

interface IngredientComboBoxProps {
  ingredients: Ingredient[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  restaurantId: string;
}

interface IngredientComboBoxHandle {
  open: () => void;
  focus: () => void;
}

const IngredientComboBox = forwardRef<
  IngredientComboBoxHandle,
  IngredientComboBoxProps
>(
  (
    {
      ingredients,
      value,
      onValueChange,
      placeholder = 'Pretražite sastojak...',
      disabled = false,
      restaurantId,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    // Fokusiraj search input kad se dropdown otvori
    useEffect(() => {
      if (open) searchInputRef.current?.focus();
    }, [open]);

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
      focus: () => setOpen(true), // fokus će se desiti preko useEffect-a
    }));

    // Debounce search value
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearchValue(searchValue);
      }, 300);

      return () => clearTimeout(timer);
    }, [searchValue]);

    // Query za pretragu sastojaka
    const { data: searchResults, isLoading: isSearching } =
      useIngredientsSearch(restaurantId, {
        search: debouncedSearchValue,
        include: 'global',
        enabledWhen: debouncedSearchValue.length > 0,
      });

    // Kombinuj inicijalne sastojke sa rezultatima pretrage
    const displayedIngredients = useMemo(() => {
      if (debouncedSearchValue.length === 0) {
        return ingredients;
      }

      if (searchResults?.data) {
        return searchResults.data;
      }

      return [];
    }, [ingredients, searchResults, debouncedSearchValue]);

    const selectedIngredient =
      ingredients.find((ing) => ing.id === value) ||
      searchResults?.data?.find((ing: Ingredient) => ing.id === value);

    return (
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedIngredient ? selectedIngredient.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                placeholder="Pretražite sastojak..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              {isSearching && (
                <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
              )}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {displayedIngredients.length === 0 ? (
                <div className="py-6 text-center text-sm">
                  {isSearching
                    ? 'Pretražujem...'
                    : 'Nema pronađenih sastojaka.'}
                </div>
              ) : (
                <div className="p-1">
                  {displayedIngredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className={cn(
                        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                        value === ingredient.id &&
                          'bg-accent text-accent-foreground'
                      )}
                      onClick={() => {
                        onValueChange(ingredient.id);
                        setOpen(false);
                        setSearchValue('');
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === ingredient.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <span>{ingredient.name}</span>
                        {ingredient.restaurantId === null && (
                          <Badge variant="secondary" className="text-xs">
                            Globalni
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

IngredientComboBox.displayName = 'IngredientComboBox';

interface CreateIngredientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIngredientCreated: (ingredient: Ingredient) => void;
  restaurantId: string;
}

function CreateIngredientDialog({
  open,
  onOpenChange,
  restaurantId,
}: CreateIngredientDialogProps) {
  return (
    <IngredientModal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      restaurantId={restaurantId}
      isClient
    />
  );
}

interface ProductFormProps {
  categories: Category[];
  ingredients: Ingredient[] | undefined;
  restaurantId: string;
  onSubmitSuccess: () => void;
  onCancel: () => void;
  product?: Product | null; // Opcioni product za edit mode
  mode?: 'create' | 'edit'; // Eksplicitni mode
  isTab?: boolean;
}

export function ProductForm({
  categories,
  ingredients = [],
  restaurantId,
  onSubmitSuccess,
  onCancel,
  product,
  mode,
  isTab = false,
}: ProductFormProps) {
  const ingredientRefs = useRef<Array<IngredientComboBoxHandle | null>>([]);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.imageUrl || null
  );
  const [availableIngredients, setAvailableIngredients] =
    useState<Ingredient[]>(ingredients);
  const [showCreateIngredient, setShowCreateIngredient] = useState(false);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const qc = useQueryClient();

  const isEditMode = mode === 'edit';

  // Pripremi default vrednosti za form
  const getDefaultValues = () => {
    if (isEditMode && product) {
      return {
        name: product.name,
        description: product.description || '',
        categoryId: product.category?.id,
        ingredients:
          product.productIngredients?.map((ing) => ({
            id: ing.id,
            ingredientId: ing.ingredient?.id,
            name: ing.ingredient?.name || 'Unknown ingredient',
            unit: ing.unit ?? undefined,
            quantity: ing.quantity ?? undefined,
          })) || [],
      };
    }

    return {
      name: '',
      description: '',
      categoryId: '',
      ingredients: [],
    };
  };

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'ingredients',
  });

  useEffect(() => {
    setAvailableIngredients(ingredients);
  }, [ingredients]);

  // Mutation za kreiranje proizvoda
  const createProductMutation = useMutation({
    mutationFn: ({
      restaurantId,
      formData,
    }: {
      restaurantId: string;
      formData: FormData;
    }) => createProduct(restaurantId, formData),
    onError: (error) => {
      toast.error('Kreiranje proizvoda nije uspelo');
      console.error('Product creation error:', error);
    },
  });

  // Mutation za ažuriranje proizvoda
  const updateProductMutation = useMutation({
    mutationFn: ({
      restaurantId,
      productId,
      formData,
    }: {
      restaurantId: string;
      productId: string;
      formData: FormData;
    }) => updateProduct(restaurantId, productId, formData),
    onError: (error) => {
      toast.error('Ažuriranje proizvoda nije uspelo');
      console.error('Product update error:', error);
    },
  });

  // Mutation za kreiranje sastojaka proizvoda
  const createIngredientsMutation = useMutation({
    mutationFn: async (
      ingredients: Array<{
        productId: string;
        ingredientId: string;
        data: {
          unit?: string | null;
          quantity: number | null;
        };
      }>
    ) => {
      const promises = ingredients.map((ingredient) =>
        createProductIngredient(
          restaurantId,
          ingredient.productId,
          ingredient.ingredientId,
          ingredient.data
        )
      );
      return Promise.all(promises);
    },
    onError: (error) => {
      toast.error('Kreiranje sastojaka nije uspelo');
      console.error('Ingredients creation error:', error);
    },
  });

  // Mutation za ažuriranje sastojaka
  const updateIngredientsMutation = useMutation({
    mutationFn: async (
      ingredients: Array<{
        productId: string;
        ingredientId: string;
        data: {
          unit: string | null;
          quantity: number | null;
        };
      }>
    ) => {
      const promises = ingredients.map((ingredient) =>
        updateProductIngredient(
          restaurantId,
          ingredient.productId,
          ingredient.ingredientId,
          ingredient.data
        )
      );
      return Promise.all(promises);
    },
    onError: (error) => {
      toast.error('Ažuriranje sastojaka nije uspelo');
      console.error('Ingredients update error:', error);
    },
  });

  // Mutation za brisanje sastojaka
  const deleteIngredientsMutation = useMutation({
    mutationFn: async (
      ingredients: Array<{
        productId: string;
        ingredientId: string;
      }>
    ) => {
      const promises = ingredients.map((ingredient) =>
        deleteProductIngredient(
          restaurantId,
          ingredient.productId,
          ingredient.ingredientId
        )
      );
      return Promise.all(promises);
    },
    onError: (error) => {
      toast.error('Brisanje sastojaka nije uspelo');
      console.error('Ingredients deletion error:', error);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const addIngredient = () => {
    const newIndex = fields.length;
    append({ ingredientId: '', unit: undefined, quantity: undefined });
    // Sačekaj render pa otvori i fokusiraj dropdown za sastojak
    setTimeout(() => {
      ingredientRefs.current[newIndex]?.open();
    }, 0);
  };

  const removeIngredient = (index: number) => {
    const ingredient = fields[index];

    if (isEditMode && ingredient.id) {
      // U edit mode-u, označi za brisanje umesto direktnog uklanjanja
      update(index, { ...ingredient, _toDelete: true });
    } else {
      // U create mode-u ili za nove ingredijente, direktno ukloni
      remove(index);
    }
  };

  const handleIngredientCreated = (newIngredient: Ingredient) => {
    setAvailableIngredients([...(availableIngredients ?? []), newIngredient]);
  };

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    try {
      // Pripremi FormData za proizvod
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('categoryId', data.categoryId);

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      let productId: string;

      if (isEditMode && product) {
        // Ažuriraj postojeći proizvod
        await updateProductMutation.mutateAsync({
          restaurantId,
          productId: product.id,
          formData,
        });
        productId = product.id;

        // Upravljaj sastojcima u edit mode-u
        if (data.ingredients && data.ingredients.length > 0) {
          const ingredientsToCreate: any[] = [];
          const ingredientsToUpdate: any[] = [];
          const ingredientsToDelete: any[] = [];

          data.ingredients.forEach((ing) => {
            if (ing._toDelete && ing.id) {
              // Sastojak za brisanje
              ingredientsToDelete.push({
                productId,
                ingredientId: ing.ingredientId,
              });
            } else if (ing.id && !ing._toDelete) {
              // Postojeći sastojak za ažuriranje
              ingredientsToUpdate.push({
                productId,
                ingredientId: ing.ingredientId,
                data: {
                  ...(ing.unit && { unit: ing.unit }),
                  quantity: toNull(ing.quantity), // number | null
                },
              });
            } else if (!ing.id && !ing._toDelete && ing.ingredientId) {
              // Novi sastojak za kreiranje
              ingredientsToCreate.push({
                productId,
                ingredientId: ing.ingredientId,
                data: {
                  ...(ing.unit && { unit: ing.unit }),
                  quantity: toNull(ing.quantity), // number | null
                },
              });
            }
          });

          // Izvršava operacije paralelno
          const promises = [];

          if (ingredientsToDelete.length > 0) {
            promises.push(
              deleteIngredientsMutation.mutateAsync(ingredientsToDelete)
            );
          }

          if (ingredientsToUpdate.length > 0) {
            promises.push(
              updateIngredientsMutation.mutateAsync(ingredientsToUpdate)
            );
          }

          if (ingredientsToCreate.length > 0) {
            promises.push(
              createIngredientsMutation.mutateAsync(ingredientsToCreate)
            );
          }

          await Promise.all(promises);
        }
      } else {
        // Kreiraj novi proizvod
        const newProduct = await createProductMutation.mutateAsync({
          restaurantId,
          formData,
        });
        productId = newProduct.id;

        // Kreiraj sastojke za novi proizvod
        if (data.ingredients && data.ingredients.length > 0) {
          const validIngredients = data.ingredients
            .filter((ing) => !ing._toDelete && ing.ingredientId)
            .map((ing) => ({
              productId,
              ingredientId: ing.ingredientId,
              data: {
                ...(ing.unit && { unit: ing.unit }),
                quantity: toNull(ing.quantity), // number | null
              },
            }));

          if (validIngredients.length > 0) {
            await createIngredientsMutation.mutateAsync(validIngredients);
          }
        }
      }

      // Uspešno završeno
      toast.success(
        isEditMode ? 'Proizvod uspešno ažuriran' : 'Proizvod uspešno kreiran'
      );

      if (!isEditMode) {
        form.reset();
        setSelectedImage(null);
        setImagePreview(null);
      }

      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product', productId] });
      onSubmitSuccess();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const isLoading =
    createProductMutation.isPending ||
    updateProductMutation.isPending ||
    createIngredientsMutation.isPending ||
    updateIngredientsMutation.isPending ||
    deleteIngredientsMutation.isPending;

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Header */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {isEditMode
              ? 'Izmeni detalje proizvoda i sastojke'
              : 'Dodaj novi proizvod u menu'}
          </p>
        </div>

        {/* Naziv proizvoda */}
        <div className="space-y-2">
          <Label htmlFor="name">Naziv proizvoda</Label>
          <Input
            id="name"
            placeholder="Unesite naziv proizvoda"
            {...form.register('name')}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Kategorija */}
        <div className="space-y-2">
          <Label htmlFor="categoryId">Kategorija</Label>
          <Popover
            open={categoryPopoverOpen}
            onOpenChange={setCategoryPopoverOpen}
            modal={true}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {form.watch('categoryId')
                  ? categories
                      .find((cat) => cat.id === form.watch('categoryId'))
                      ?.name.toUpperCase()
                  : 'Izaberite kategoriju'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Pretražite kategoriju..." />
                <CommandEmpty>Nema pronađenih kategorija.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => {
                        form.setValue('categoryId', category.id);
                        form.clearErrors('categoryId');
                        setCategoryPopoverOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          form.watch('categoryId') === category.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {category.name.toUpperCase()}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {form.formState.errors.categoryId && (
            <p className="text-sm text-destructive">
              {form.formState.errors.categoryId.message}
            </p>
          )}
        </div>

        {/* Opis */}
        <div className="space-y-2">
          <Label htmlFor="description">Opis</Label>
          <Textarea
            id="description"
            placeholder="Unesite opis proizvoda"
            {...form.register('description')}
          />
        </div>

        {/* Slika */}
        <div className="space-y-2">
          <Label>Slika proizvoda</Label>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('image-upload')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {imagePreview ? 'Promeni sliku' : 'Izaberi sliku'}
            </Button>
            {imagePreview && (
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="Pregled"
                  width={64}
                  height={64}
                  className="object-cover rounded"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sastojci */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Sastojci</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateIngredient(true)}
              >
                Kreiraj novi
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredient}
              >
                <Plus className="h-4 w-4 mr-1" />
                Dodaj sastojak
              </Button>
            </div>
          </div>

          {fields.filter((field) => !field._toDelete).length === 0 && (
            <div className="text-center py-8 border-1 border-gray-600 rounded-lg">
              <p className="text-gray-500">
                Nema dodatih sastojaka. Kliknite &quot;Dodaj sastojak&quot; da
                biste dodali prvi.
              </p>
            </div>
          )}

          {fields.map((field, index) => {
            if (field._toDelete) return null;

            return (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 md:p-2 rounded-lg border md:border-0"
              >
                {/* Sastojak - na mobilnom full width, na desktop 5 kolona */}
                <div className="md:col-span-5 space-y-1">
                  <Label className="text-sm font-medium">Sastojak</Label>
                  <IngredientComboBox
                    ref={(el: IngredientComboBoxHandle | null) => {
                      ingredientRefs.current[index] = el;
                    }}
                    ingredients={availableIngredients}
                    value={form.watch(`ingredients.${index}.ingredientId`)}
                    onValueChange={(value) =>
                      form.setValue(`ingredients.${index}.ingredientId`, value)
                    }
                    placeholder="Izaberite sastojak..."
                    restaurantId={restaurantId}
                  />
                  {form.formState.errors.ingredients?.[index]?.ingredientId && (
                    <p className="text-xs text-destructive mt-1">
                      {
                        form.formState.errors.ingredients[index].ingredientId
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* Količina i Jedinica - na mobilnom u redu, na desktop zasebno */}
                <div className="grid grid-cols-2 gap-3 md:col-span-6 md:grid-cols-6">
                  {/* Količina */}
                  <div className="md:col-span-3 space-y-1">
                    <Label className="text-sm font-medium">Količina</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...form.register(`ingredients.${index}.quantity`, {
                        setValueAs: (v) => {
                          if (v === '' || v === null || v === undefined)
                            return undefined;
                          const n = Number(v);
                          return Number.isFinite(n) ? n : undefined;
                        },
                      })}
                      onChange={(e) => {
                        const raw = e.target.value;
                        form.setValue(
                          `ingredients.${index}.quantity`,
                          raw === '' ? undefined : Number(raw),
                          { shouldValidate: true }
                        );
                      }}
                      placeholder="0"
                    />
                    {form.formState.errors.ingredients?.[index]?.quantity && (
                      <p className="text-xs text-destructive mt-1">
                        {
                          form.formState.errors.ingredients[index].quantity
                            .message
                        }
                      </p>
                    )}
                  </div>

                  {/* Jedinica */}
                  <div className="md:col-span-3 space-y-1">
                    <Label className="text-sm font-medium">Jedinica</Label>
                    <Select
                      value={form.watch(`ingredients.${index}.unit`) || 'none'}
                      onValueChange={(value) => {
                        form.setValue(
                          `ingredients.${index}.unit`,
                          value === 'none' ? undefined : value,
                          { shouldValidate: true }
                        );
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Izaberi jedinicu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Bez jedinice</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">gram</SelectItem>
                        <SelectItem value="l">litra</SelectItem>
                        <SelectItem value="kom">komada</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.ingredients?.[index]?.unit && (
                      <p className="text-xs text-destructive mt-1">
                        {form.formState.errors.ingredients[index].unit.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ukloni button - na mobilnom full width, na desktop 1 kolona */}
                <div className="md:col-span-1 md:flex md:items-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                    className="w-full"
                  >
                    <X className="h-4 w-4 md:mx-auto" />
                    <span className="md:hidden ml-2">Ukloni</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dugmad */}
        <div className="flex gap-2 pt-4">
          {!isTab && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Otkaži
            </Button>
          )}
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading
              ? isEditMode
                ? 'Ažuriranje...'
                : 'Kreiranje...'
              : isEditMode
              ? 'Ažuriraj proizvod'
              : 'Kreiraj proizvod'}
          </Button>
        </div>
      </form>

      <CreateIngredientDialog
        open={showCreateIngredient}
        onOpenChange={setShowCreateIngredient}
        onIngredientCreated={handleIngredientCreated}
        restaurantId={restaurantId}
      />
    </>
  );
}
