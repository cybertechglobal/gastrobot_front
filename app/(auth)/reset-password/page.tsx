// app/reset-password/page.tsx
'use client';

import { ResetPasswordForm } from '@/components/ResetPasswordForm';
import { Suspense } from 'react';

// Loading component for Suspense fallback
function ResetPasswordLoading() {
  return (
    <div className="w-full max-w-md p-8 space-y-6">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}