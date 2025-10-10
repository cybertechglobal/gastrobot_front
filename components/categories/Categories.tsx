'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash } from 'lucide-react';
import { CategoryDialogForm } from './CategoryDialogForm';
import { DeleteDialog } from '../DeleteDialog';
import { deleteCategory } from '@/lib/api/category';
import { useRouter } from 'next/navigation';
import { Category } from '@/types/category';

interface CategoriesProps {
  categories: Category[];
}

const Categories = ({ categories }: CategoriesProps) => {
  const router = useRouter();

  return (
    <>
      <header className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-3xl font-semibold">Kategorije</h1>
        <CategoryDialogForm
          trigger={<Button variant="default">+ Dodaj kategoriju</Button>}
        />
      </header>

      {categories.length ? (
        <Table className="min-w-full rounded-[8px] overflow-hidden">
          <TableHeader>
            <TableRow className="bg-primary/10 text-slate-400">
              <TableHead className="px-4">Naziv</TableHead>
              <TableHead className="px-4">Tip</TableHead>
              <TableHead className="px-4 w-[10px] text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow
                key={category.id}
                className="dark:bg-[#17181E] bg-[#fdfdfd] border-b "
              >
                <TableCell className="py-3 px-4 dark:text-gray-200 text-gray-900">
                  {category.name.toUpperCase()}
                </TableCell>

                <TableCell className="py-3 px-4">
                  <Badge
                    className={
                      category.type === 'food'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                    }
                  >
                    {category.type}
                  </Badge>
                </TableCell>

                <TableCell className="py-2 px-3 w-[10px]">
                  <div className="flex items-center justify-end space-x-1">
                    <CategoryDialogForm
                      key={category.id}
                      category={category}
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Edit size={16} />
                        </Button>
                      }
                    />

                    <DeleteDialog
                      trigger={
                        <Button
                          className="text-destructive hover:text-destructive-900"
                          variant="ghost"
                          size="icon"
                        >
                          <Trash size={16} />
                        </Button>
                      }
                      description="Ova akcija je nepovratna. Kategorija će biti trajno obrisan iz sistema."
                      successMessage="Kategorija je uspešno obrisana"
                      errorMessage="Greška prilikom brisanja kategorije"
                      mutationOptions={{
                        mutationFn: () => deleteCategory(category.id),
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
      ) : (
        <p>Nema kategorija</p>
      )}
    </>
  );
};

export default Categories;
