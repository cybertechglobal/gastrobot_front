'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MoreHorizontal,
  Trash2,
  Users,
  Mail,
  AlertCircle,
  Search,
  Calendar,
  Edit,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { deleteUser, fetchRestaurantUsers } from '@/lib/api/users';
import { EditUserForm } from './EditUserForm';
import { DeleteDialog } from '../DeleteDialog';
import { getUserInitials } from '@/lib/utils';
import { RestaurantUser } from '@/types/user';

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Role badge styling
const getRoleBadgeVariant = (role: RestaurantUser['role']) => {
  switch (role) {
    case 'manager':
      return 'default';
    case 'kitchen':
      return 'secondary';
    case 'waiter':
      return 'outline';
    case 'admin':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getRoleDisplayName = (role: RestaurantUser['role']) => {
  const roleNames = {
    waiter: 'Konobar',
    manager: 'Manager',
    kitchen: 'Kuvar',
    admin: 'Administrator',
  };
  return roleNames[role] || role;
};

// Loading skeleton component for cards
const UsersCardsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="p-4">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-[140px]" />
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-6 w-[80px]" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="mt-4 pt-4 border-t">
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </Card>
    ))}
  </div>
);

// User card component
const UserCard = ({
  user,
  onEdit,
  onDelete,
}: {
  user: RestaurantUser;
  onEdit: (user: any, e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: (user: any) => void;
}) => (
  <Card className="hover:shadow-md transition-shadow duration-200">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-lg">
              {getUserInitials(user.user.firstname, user.user.lastname)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {user.user.firstname} {user.user.lastname}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Mail className="h-4 w-4 mr-1" />
              <span className="truncate">{user.user.email}</span>
            </div>
            <div className="mt-3">
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {getRoleDisplayName(user.role)}
              </Badge>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Otvori meni</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Akcije</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => onEdit(user, e)}
              className="cursor-pointer text-sm"
            >
              <Edit className="h-3 w-3 mr-2" />
              Uredi
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive cursor-pointer text-sm"
              onClick={() => onDelete(user)}
            >
              <Trash2 className="h-3 w-3 mr-2" />
              Obrisi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span>
            Kreiran: {new Date(user.user.createdAt).toLocaleDateString('sr-RS')}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const UsersTable = ({ restaurantId }: { restaurantId: string }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteUserDialog, setDeleteUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<string>('all');
  const queryClient = useQueryClient();

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch users query with search params
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['restaurant-users', debouncedSearchTerm, selectedRole],
    queryFn: () =>
      fetchRestaurantUsers(restaurantId, {
        isProtected: true,
        params: {
          name: debouncedSearchTerm,
          role: selectedRole !== 'all' ? selectedRole : '',
        },
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const users = data?.data || [];

  const handleEditUser = (user: any, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setDeleteUser(true);
  };

  // const onClose = () => {
  //   setDeleteUser(false);
  //   setEditOpen(false);
  //   setSelectedUser(null);
  // };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Greška pri učitavanju korisnika. Molimo pokušajte ponovo.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} className="mt-4">
          Pokušaj ponovo
        </Button>
      </div>
    );
  }

  console.log(selectedUser?.user?.id);

  return (
    <>
      <div className="container mx-auto py-8 space-y-8">
        {/* Stats Cards */}
        {data && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ukupno korisnika
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Konobari</CardTitle>
                <Badge variant="outline">Konobar</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.role === 'waiter').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kuvari</CardTitle>
                <Badge variant="secondary">Kuvar</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.role === 'kitchen').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Manageri</CardTitle>
                <Badge>Manager</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.role === 'manager').length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <Input
              placeholder="Pretraži po imenu ili email-u..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 dark:border-0 dark:bg-[#1C1E24]"
            />
          </div>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[180px] dark:border-0 dark:bg-[#1C1E24]">
              <SelectValue placeholder="Filtriraj po roli" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve role</SelectItem>
              <SelectItem value="waiter">Konobar</SelectItem>
              {/* <SelectItem value="kuvar">Kuvar</SelectItem> */}
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || selectedRole !== 'all') && (
            <Button variant="outline" onClick={clearFilters}>
              Očisti filtere
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {(debouncedSearchTerm || selectedRole !== 'all') && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">
              Aktivni filteri:
            </span>
            {debouncedSearchTerm && (
              <Badge variant="secondary">
                Pretraga: &quot;{debouncedSearchTerm}&quot;
              </Badge>
            )}
            {selectedRole !== 'all' && (
              <Badge variant="secondary">
                Rola:{' '}
                {getRoleDisplayName(selectedRole as RestaurantUser['role'])}
              </Badge>
            )}
          </div>
        )}

        {/* Users Cards */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Lista korisnika
              {data && (
                <span className="text-muted-foreground font-normal ml-2">
                  ({users.length}{' '}
                  {users.length === 1 ? 'korisnik' : 'korisnika'})
                </span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <UsersCardsSkeleton />
          ) : users.length === 0 ? (
            <Card className="p-8">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nema korisnika</h3>
                <p className="text-muted-foreground mb-4">
                  {debouncedSearchTerm || selectedRole !== 'all'
                    ? 'Nema korisnika koji odgovaraju vašim filterima.'
                    : 'Još uvek nema dodanih korisnika u ovaj restoran.'}
                </p>
                {(debouncedSearchTerm || selectedRole !== 'all') && (
                  <Button variant="outline" onClick={clearFilters}>
                    Očisti filtere
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <UserCard
                  key={user.user.id}
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <EditUserForm
        userId={selectedUser?.user?.id}
        initialData={{ role: selectedUser?.role, ...selectedUser?.user }}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteDialog
        trigger={<></>}
        open={deleteUserDialog}
        onOpenChange={setDeleteUser}
        description={`Da li ste sigurni da želite da uklonite ${selectedUser?.user?.firstname}? Ova radnja je nepovratna. User će takođe biti uklonjen iz svih jelovnika.`}
        successMessage="User je uspešno uklonjen"
        errorMessage="Greška prilikom brisanja usera"
        mutationOptions={{
          mutationFn: () => deleteUser(selectedUser?.user?.id),
          onSuccess: () => {
            // router.refresh();
            queryClient.invalidateQueries({ queryKey: ['restaurant-users'] });
          },
        }}
      />
    </>
  );
};

export default UsersTable;
