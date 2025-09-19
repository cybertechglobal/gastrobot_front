// components/skeletons/LoadingSkeletons.tsx
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const RegionCardSkeleton = () => (
  <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24 animate-pulse"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-28 animate-pulse"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const RegionsListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <RegionCardSkeleton key={index} />
    ))}
  </div>
);

export const StatsCardSkeleton = () => (
  <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
        </div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

export const TableCardSkeleton = () => (
  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
    <div className="flex items-center justify-between mb-2">
      <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-12 animate-pulse"></div>
    </div>
    <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
  </div>
);

export const TablesGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <TableCardSkeleton key={index} />
    ))}
  </div>
);

export const RegionDetailsSkeleton = () => (
  <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
    <CardHeader className="border-b border-gray-200 dark:border-gray-800">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
    </CardHeader>
    <CardContent className="p-4 space-y-6">
      {/* Stolovi section */}
      <div>
        <div className="flex items-center justify-between mb-3 mx-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16 animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-12 animate-pulse"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Konobari section */}
      <div>
        <div className="flex items-center justify-between mb-3 mx-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);
