import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const loading = () => {
  return (
    <div className="p-6 space-y-6">
      {/* header + button */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>

      {/* table card */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr className="bg-muted">
                <th className="p-3 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="p-3 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="p-3 text-right">
                  <Skeleton className="h-4 w-20" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                  <td className="p-3 text-right">
                    <Skeleton className="h-5 w-16" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default loading;
