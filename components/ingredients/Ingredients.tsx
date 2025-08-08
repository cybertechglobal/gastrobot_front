'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import IngredientModal from './IngredientModal';
import { DeleteDialog } from '../DeleteDialog';
import { deleteIngredient } from '@/lib/api/ingredients';
import { srLatn } from 'date-fns/locale';
import { format } from 'date-fns';
import IngredientsPagination from './Pagination';
import { Ingredient } from '@/types/ingredient';

interface IngredientsProps {
  allIngredients: Ingredient[];
  initialFilters: { name: string };
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
}

export default function Ingredients({
  allIngredients,
  totalCount,
  currentPage,
  itemsPerPage,
}: IngredientsProps) {
  const router = useRouter();
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  const handleEditSuccess = () => {
    setEditingIngredient(null);
  };

  return (
    <>
      {/* Results Info */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Prikazano {startItem}-{endItem} od {totalCount} sastojka
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Stranica {currentPage} od {Math.ceil(totalCount / itemsPerPage)}
        </p>
      </div>

      {/* Table */}

      <Table className="min-w-full rounded-[8px] overflow-hidden">
        <TableHeader>
          <TableRow className="dark:bg-[#1C1E24] bg-[#efefef] text-slate-400">
            <TableHead>Ime sastojka</TableHead>
            <TableHead>Datum kreiranja</TableHead>
            <TableHead className="w-[10px]">Akcije</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allIngredients.map((ingredient) => (
            <TableRow
              key={ingredient.id}
              className="dark:bg-[#17181E] bg-[#fdfdfd] border-b border-[#1C1E24]"
            >
              {/* Name */}
              <TableCell className="dark:text-gray-200 text-gray-900 py-3 px-4">
                {ingredient.name}
              </TableCell>

              {/* Created Date */}
              <TableCell className="dark:text-gray-200 text-gray-900 py-3 px-4">
                {format(ingredient.createdAt, 'dd. MMMM yyyy', {
                  locale: srLatn,
                })}
              </TableCell>

              <TableCell className="dark:text-gray-200 text-gray-900 py-3 px-4 w-[10px]">
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingIngredient(ingredient)}
                  >
                    <Pencil size={16} />
                  </Button>

                  <DeleteDialog
                    trigger={
                      <Button
                        variant="ghost"
                        className="text-destructive hover:text-destructive-900"
                        size="icon"
                      >
                        <Trash size={16} />
                      </Button>
                    }
                    description="Ova akcija je nepovratna. Sastojak će biti trajno obrisan iz sistema."
                    successMessage="Sastojak je uspešno obrisan"
                    errorMessage="Greška prilikom brisanja sastojka"
                    mutationOptions={{
                      mutationFn: () => deleteIngredient(ingredient.id),
                      onSuccess: () => {
                        router.refresh();
                      },
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Info and Controls */}
      <IngredientsPagination
        currentPage={currentPage}
        totalCount={totalCount}
        itemsPerPage={itemsPerPage}
      />

      {/* Edit Modal */}
      <IngredientModal
        ingredient={editingIngredient}
        isOpen={!!editingIngredient}
        onClose={handleEditSuccess}
      />
    </>
  );
}
