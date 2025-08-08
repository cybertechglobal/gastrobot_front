import { Ingredient } from "@/types/ingredient";

interface IngredientCardProps {
  ingredient: Ingredient;
  onEdit: () => void;
  onDelete: () => void;
}

export default function IngredientCard({
  ingredient,
  onEdit,
  onDelete,
}: IngredientCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">{ingredient.name}</h3>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          Uredi
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Обриши
        </button>
      </div>
    </div>
  );
}
