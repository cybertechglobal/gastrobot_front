'use client';

import React from 'react';
import UsersTable from './UsersTable';
import { AddUserForm } from './AddUserForm';

export default function Users({ restaurantId }: { restaurantId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Korisnici restorana</h1>

        <AddUserForm restaurantId={restaurantId} />
      </div>

      {/* Klijentski fetch i loading unutar UsersTable */}
      <UsersTable restaurantId={restaurantId} />
    </div>
  );
}
