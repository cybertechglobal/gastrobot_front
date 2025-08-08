import React, { useState } from 'react';
import { FilterDialog } from '../FilterDialog';
import { RestaurantFilters } from '@/types/restaurant';

const RestaurantsFilters = () => {
  const [filters, setFilters] = useState<RestaurantFilters>({
    name: '',
    location: '',
    city: '',
    status: '',
  });

  console.log(filters);

  const handleApply = (filt: typeof filters) => {
    setFilters(filt);
    // ovde ćeš re-filterovati tvoj allRestaurants niz...
  };

  const handleReset = () => {
    setFilters({
      name: '',
      location: '',
      city: '',
      status: '',
    });
    // i obrisati filtere...
  };

  return (
    <>
      <FilterDialog
        cities={[]}
        cuisines={[]}
        onApply={handleApply}
        onReset={handleReset}
      />
    </>
  );
};

export default RestaurantsFilters;
