import React from 'react';
import { AddonsHeader } from './AddonsHeader';
import { AddonsList } from './AddonsList';
import { useAddons } from '@/hooks/query/useAddons';

const Addons = ({ restaurantId }: { restaurantId: string }) => {
  const { addonGroups, isLoading } = useAddons({ restaurantId });

  return (
    <>
      <AddonsHeader
        restaurantId={restaurantId}
        totalAddons={addonGroups?.length || 0}
      />
      <AddonsList
        addonGroups={addonGroups || []}
        restaurantId={restaurantId}
        isLoading={isLoading}
      />
    </>
  );
};

export default Addons;
