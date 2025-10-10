'use client';
import { Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddonGroupFormDialog } from './AddonFormDialog';
import { useState } from 'react';

interface AddonsHeaderProps {
  restaurantId: string;
  totalAddons: number;
}

export function AddonsHeader({ restaurantId, totalAddons }: AddonsHeaderProps) {
  const [createAddonOpen, setCreateAddonOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">
              Grupe dodataka
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Upravljajte grupama dodataka koje se mogu dodeliti proizvodima.{' '}
            <span className="font-medium">Ukupno: {totalAddons}</span>
          </p>
        </div>

        <Button onClick={() => setCreateAddonOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova grupa dodataka
        </Button>
      </div>
      <AddonGroupFormDialog
        restaurantId={restaurantId}
        open={createAddonOpen}
        onOpenChange={(open) => {
          setCreateAddonOpen(open);
        }}
      />
    </>
  );
}
