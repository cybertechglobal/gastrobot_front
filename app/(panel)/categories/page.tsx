// app/restaurants/page.tsx

import Categories from '@/components/categories/Categories';
import { fetchCategories } from '@/lib/api/category';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kategorije hrane | Gastrobot Panel',
  description: 'Panel za upravljanje restoranima',
};

async function CategoryData() {
  try {
    const data = await fetchCategories();

    return <Categories categories={data} />;
  } catch (error) {
    console.error('Error fetching:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Failed to load categories. Please try again.
        </p>
      </div>
    );
  }
}

export default async function CategoriesPage() {
  return (
    <div className="p-6 md:p-8">
      <CategoryData />
    </div>
  );
}
