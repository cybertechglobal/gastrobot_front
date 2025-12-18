import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const loading = () => {
  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header with title and button */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Search input */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />

        {/* Table */}
        <div className="rounded-md border">
          <div className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left">
                    <Skeleton className="h-4 w-24" />
                  </th>
                  <th className="p-4 text-left">
                    <Skeleton className="h-4 w-28" />
                  </th>
                  <th className="p-4 text-right">
                    <Skeleton className="h-4 w-16" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4">
                      <Skeleton className="h-5 w-full max-w-[200px]" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-full max-w-[120px]" />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default loading;
