'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash, Plus } from 'lucide-react';
import { MenuDialogForm } from './MenuDialogForm'; // Zameni import
import { DeleteDialog } from '../DeleteDialog';
import { deleteMenu } from '@/lib/api/menu';
import { useRouter } from 'next/navigation';
import { AddProductDialog } from './AddProductDialog';
import { Menu } from '@/types/menu';

interface MenuHeaderProps {
  menu: Menu;
  restaurantId: string;
  menuId: string;
}

export function MenuHeader({ menu, restaurantId, menuId }: MenuHeaderProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const totalItems =
    menu?.categories?.reduce(
      (sum, category) => sum + category.menuItems.length,
      0
    ) || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">{menu.name}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {totalItems} proizvod(a)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AddProductDialog
              restaurantId={restaurantId}
              menuId={menuId}
              trigger={
                <Button className="shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj proizvod
                </Button>
              }
            />
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Izmeni Menu
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Obrisi Menu
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Koristi MenuDialogForm sa external control */}
      {editOpen && (
        <MenuDialogForm
          restaurantId={restaurantId}
          menu={menu}
          trigger={<></>}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={() => {
            // Optional additional logic
            setEditOpen(false);
          }}
        />
      )}

      <DeleteDialog
        trigger={<></>}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        description="Ova akcija je nepovratna. Menu će biti trajno obrisan iz sistema."
        successMessage="Menu je uspešno obrisan"
        errorMessage="Greška prilikom brisanja menu-a"
        mutationOptions={{
          mutationFn: () => deleteMenu(restaurantId, menu.id),
          onSuccess: () => {
            router.replace(`/restaurants/${restaurantId}`);
          },
        }}
      />
    </Card>
  );
}
