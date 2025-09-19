// utils/regionUtils.ts
import { Region } from '@/types/region';
import { Table } from '@/types/table';
import { UserDetail } from '@/types/user';

export const getUserInitials = (user: UserDetail): string => {
  return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
};

export const getUserFullName = (user: UserDetail): string => {
  return `${user.firstname} ${user.lastname}`;
};

export const getUnassignedTables = (tables: Table[]): Table[] => {
  return tables.filter((table) => !table.regionId || table.regionId === '');
};

export const getTableRegion = (
  tableId: string,
  regions: Region[]
): Region | undefined => {
  return regions.find((region) =>
    region.tables ? region.tables.some((table) => table.id === tableId) : false
  );
};

export const isUserAssignedToRegion = (
  userId: string,
  region: Region
): boolean => {
  return region.users ? region.users.some((u) => u.id === userId) : false;
};

export const getUnassignedTablesCount = (tables: Table[]): number => {
  return getUnassignedTables(tables).length;
};
