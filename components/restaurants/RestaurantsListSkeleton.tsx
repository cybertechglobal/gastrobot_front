import { Skeleton } from '@/components/ui/skeleton';

export function RestaurantsListSkeleton() {
  return (
    <div className="space-y-6 mt-6">
      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-muted/50 border-b border-border text-sm font-medium">
          <div className="col-span-1">
            <Skeleton className="h-4 w-12" /> {/* Logo */}
          </div>
          <div className="col-span-3">
            <Skeleton className="h-4 w-24" /> {/* Ime restorana */}
          </div>
          <div className="col-span-3">
            <Skeleton className="h-4 w-16" /> {/* Lokacija */}
          </div>
          <div className="col-span-2">
            <Skeleton className="h-4 w-12" /> {/* Status */}
          </div>
          <div className="col-span-2">
            <Skeleton className="h-4 w-24" /> {/* Datum kreiranja */}
          </div>
          <div className="col-span-1">{/* Actions column - empty */}</div>
        </div>

        {/* Table Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors"
          >
            {/* Logo */}
            <div className="col-span-1 flex items-center">
              <Skeleton className="w-8 h-8 rounded" />
            </div>

            {/* Restaurant Name */}
            <div className="col-span-3 flex items-center">
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Location */}
            <div className="col-span-3 flex items-center">
              <Skeleton className="h-4 w-40" />
            </div>

            {/* Status */}
            <div className="col-span-2 flex items-center">
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            {/* Creation Date */}
            <div className="col-span-2 flex items-center">
              <Skeleton className="h-4 w-20" />
            </div>

            {/* Actions */}
            <div className="col-span-1 flex items-center justify-end gap-2">
              <Skeleton className="w-8 h-8 rounded" /> {/* View button */}
              <Skeleton className="w-8 h-8 rounded" /> {/* Edit button */}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-6">
        <Skeleton className="h-4 w-48" /> {/* Page info */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" /> {/* Previous */}
          <Skeleton className="h-9 w-8" /> {/* Page 1 */}
          <Skeleton className="h-9 w-8" /> {/* Page 2 */}
          <Skeleton className="h-9 w-8" /> {/* Page 3 */}
          <Skeleton className="h-9 w-20" /> {/* Next */}
        </div>
      </div>
    </div>
  );
}
