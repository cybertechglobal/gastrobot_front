'use client';
import { apiRequest } from '@/lib/client';
import { ApiError } from '@/lib/error';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from "sonner"

export default function Users() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () =>
      apiRequest('v1/restaurants', 'GET', undefined, { isProtected: true }),
  });

  console.log(error);

  useEffect(() => {
    if (error) {
      const message =
        error instanceof ApiError
          ? `Error ${error.status}: ${error.message}`
          : 'Unexpected error';
      toast.error(message);
    }
  }, [error]);

  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No data</p>;

  return (
    <div>
      <h1>Users</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
