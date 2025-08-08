import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function IngredientsListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Results info skeleton */}
      <Skeleton className="h-4 w-48 " />

      {/* Table skeleton */}
      <div className="rounded-md border border-gray-700 bg-muted/50">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead>
                <Skeleton className="h-4 w-24 " />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-28 " />
              </TableHead>
              <TableHead className="text-right">
                <Skeleton className="h-4 w-16  ml-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i} className="border-gray-700">
                <TableCell>
                  <Skeleton className="h-4 w-32 " />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 " />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8  ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
