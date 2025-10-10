'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Eye, Edit } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { srLatn } from 'date-fns/locale';
import { EditRestaurantDialog } from './restaurant/EditRestaurantDialog';
import EmptyRestaurantsState from './EmptyRestaurantsState';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Restaurant } from '@/types/restaurant';

interface RestaurantsProps {
  allRestaurants: Restaurant[];
  initialFilters: any;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
}

const DefaultLogo = () => (
  <div className="w-full h-full bg-gray-100 dark:bg-transparent flex items-center justify-center">
    <svg
      className="w-8 h-8 text-gray-400 dark:text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0V9a1 1 0 011-1h4a1 1 0 011 1v13.4"
      />
    </svg>
  </div>
);

export default function Restaurants({
  allRestaurants,
  initialFilters,
  totalCount,
  currentPage,
  itemsPerPage,
}: RestaurantsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const hasActiveFilters = Object.values(initialFilters).some(
    (value) => value !== '' && value !== 'all'
  );

  const handlePageChange = (page: number | string) => {
    const params = new URLSearchParams(searchParams);

    if (page === 1) {
      params.delete('page'); // Uklanja page parametar za prvu stranicu
    } else {
      params.set('page', page.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(url);
  };

  // Funkcija za navigaciju na restoran stranicu
  const handleRowClick = (restaurantId: string) => {
    router.push(`restaurants/${restaurantId}`);
  };

  // Sprečava propagaciju kada se klikne na akcije
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Funkcija za izračunavanje opsega prikazanih stavki
  const getItemRange = () => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalCount);
    return { start, end };
  };

  const { start, end } = getItemRange();

  // Generiraj stranice za prikaz
  const getVisiblePages = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Ako ima 7 ili manje stranica, prikaži sve
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Složenija logika za više stranica
      pages.push(1);

      if (currentPage > 4) {
        pages.push('ellipsis1');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 3) {
        pages.push('ellipsis2');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <>
      {allRestaurants.length ? (
        <>
          {/* Informacije o paginaciji */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Prikazano {start}-{end} od {totalCount} restorana
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Stranica {currentPage} od {totalPages}
            </p>
          </div>

          <Table className="min-w-full rounded-[8px] overflow-hidden">
            <TableHeader>
              <TableRow className="bg-primary/10 text-slate-400">
                <TableHead className="px-4">Logo</TableHead>
                <TableHead className="px-4">Ime restorana</TableHead>
                <TableHead className="px-4">Lokacija</TableHead>
                <TableHead className="px-4 text-center">Status</TableHead>
                <TableHead className="px-4 hidden md:table-cell">
                  Datum kreiranja
                </TableHead>
                <TableHead className="w-[10px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {allRestaurants.map((r) => (
                <TableRow
                  key={r.id}
                  onClick={() => handleRowClick(r.id)}
                  className="dark:bg-[#17181E] bg-[#fdfdfd] border-b  
                           cursor-pointer transition-all duration-200 ease-in-out
                           hover:bg-gray-50 hover:dark:bg-[#1A1B21] 
                           hover:shadow-sm hover:scale-[1.01]
                           active:scale-[0.99]"
                >
                  <TableCell className="w-[60px] py-3 px-4">
                    {r.logoUrl &&
                    !(
                      r.logoUrl.includes('url.com') ||
                      r.logoUrl.includes('localhost')
                    ) ? (
                      <Image
                        src={r.logoUrl}
                        alt={`Logo ${r.name}`}
                        width={40}
                        height={40}
                        className="rounded object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <DefaultLogo />
                    )}
                  </TableCell>
                  <TableCell className="dark:text-gray-200 text-gray-900 py-3 px-4 font-medium">
                    {r.name}
                  </TableCell>
                  <TableCell className="dark:text-gray-200 text-gray-900 py-3 px-4">
                    {r.location?.city}, {r.location?.address}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center">
                    <Badge
                      variant={r.status === 'active' ? 'default' : 'secondary'}
                      className={
                        r.status === 'active'
                          ? 'bg-primary/20 text-primary/90'
                          : ''
                      }
                    >
                      {r.status === 'active' ? 'Aktivan' : 'Neaktivan'}
                    </Badge>
                  </TableCell>
                  <TableCell className="dark:text-gray-200 text-gray-900 py-3 px-4 hidden md:table-cell">
                    {format(r.createdAt, 'dd. MMMM yyyy', { locale: srLatn })}
                  </TableCell>
                  <TableCell
                    className="dark:text-gray-200 text-gray-900 py-3 px-4 w-[10px]"
                    onClick={handleActionClick}
                  >
                    <div className="flex items-center gap-1">
                      <Link
                        href={`restaurants/${r.id}`}
                        onClick={handleActionClick}
                      >
                        <Button
                          variant="link"
                          size="icon"
                          className="hidden md:flex cursor-pointer hover:bg-gray-100 hover:dark:bg-gray-800 
                                   transition-colors duration-200"
                        >
                          <Eye size={16} />
                        </Button>
                      </Link>
                      <div onClick={handleActionClick}>
                        <EditRestaurantDialog
                          restaurant={r}
                          button={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-gray-100 hover:dark:bg-gray-800 
                                       transition-colors duration-200"
                            >
                              <Edit size={16} />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* shadcn/ui Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        handlePageChange(currentPage - 1);
                      }
                    }}
                    className={
                      currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }
                  />
                </PaginationItem>

                {getVisiblePages().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === 'ellipsis1' || page === 'ellipsis2' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) {
                        handlePageChange(currentPage + 1);
                      }
                    }}
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <EmptyRestaurantsState
          hasFilters={hasActiveFilters}
          // onClearFilters={() => {
          //   router.push('/restaurants');
          // }}
          onAddRestaurant={() => {
            router.push('/restaurants/new');
          }}
        />
      )}
    </>
  );
}
