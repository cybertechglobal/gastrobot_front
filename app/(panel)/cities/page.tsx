import Cities from '@/components/cities/Cities';
import { fetchCities } from '@/lib/api/locations';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gradovi | Gastrobot Panel',
  description: 'Panel za upravljanje gradovima',
};

async function CityData() {
  try {
    const data = await fetchCities();

    return <Cities cities={data} />;
  } catch (error) {
    console.error('Error fetching cities:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Failed to load cities. Please try again.
        </p>
      </div>
    );
  }
}

export default async function CitiesPage() {
  return (
    <div className="p-6 md:p-8">
      <CityData />
    </div>
  );
}
