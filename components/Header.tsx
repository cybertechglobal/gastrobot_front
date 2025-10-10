'use client';

import React, { useState } from 'react';
import { SidebarTrigger } from './ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSession } from 'next-auth/react';
import { getUserInitials } from '@/lib/utils/utils';
import { NotificationBell } from './notifications/NotificationBell';
import { useSignout } from '@/hooks/useSignout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: session, status } = useSession();
  const { signout } = useSignout();

  const handleLogout = async () => {
    await signout({ callbackUrl: '/login' });
  };

  return (
    // <header className="flex h-[68px] items-center justify-between px-4">
    <header className="sticky top-0 z-50 flex h-[68px] items-center justify-between px-4 bg-background border-b">
      {/* <header
      style={{ position: 'fixed', zIndex: '10', width: 'calc(100% - 65px)' }}
      className="absolute top-0 z-50 flex h-[68px] items-center justify-between px-4 bg-background/95 backdrop-blur-sm border-b"
    > */}
      <SidebarTrigger />

      {status !== 'loading' ? (
        <div className=" items-center gap-2 flex">
          {session?.user ? (
            <div className="flex items-center gap-3 px-4 py-6 cursor-pointer">
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  {/* <div className="relative cursor-pointer">
                    <div
                      className={
                        'flex w-[64px] h-[44px] items-center justify-center gap-1 rounded-full border-1 transition-all duration-200 border-primary bg-transparent'
                      }
                    >
                      <User className={`w-[17px] h-[21px] text-primary`} />
                      <ChevronDown className={`w-4 h-4 text-primary`} />
                    </div>
                  </div> */}
                  <div className='flex items-center gap-3'>
                    <div className="hidden sm:flex">
                      <p className="text-sm">
                        {session.user.firstname} {session.user.lastname}
                      </p>
                    </div>
                    <Avatar>
                      <AvatarImage
                        src={session.user.profileImageUrl}
                        alt="user image"
                      />
                      <AvatarFallback>
                        {getUserInitials(
                          session.user.firstname,
                          session.user.lastname
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-72 bg-white border border-gray-200 shadow-lg rounded-lg p-0 overflow-hidden"
                  sideOffset={8}
                >
                  {/* User Info Header */}
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      {session.user.firstname} {session.user.lastname}
                    </div>
                    <div className="text-sm text-gray-600">
                      {session.user.email}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <DropdownMenuItem
                      className="px-6 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer focus:bg-gray-50 transition-colors duration-150"
                    >
                      <span className="text-base">Profil</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="px-6 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer focus:bg-gray-50 transition-colors duration-150">
                      <span className="text-base">Korisnička podrška</span>
                    </DropdownMenuItem>
                  </div>

                  {/* Logout Button */}
                  <div className="p-4 pt-2">
                    <Button
                      onClick={handleLogout}
                      className="w-full font-medium py-3 px-4 rounded-lg transition-colors duration-150 text-base"
                    >
                      Odjavi se
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <NotificationBell />
            </div>
          ) : null}
        </div>
      ) : (
        // <div className="w-[114px] h-[68px] hidden lg:block"></div>
        <div className="items-center gap-2 flex">
          <div className="flex items-center gap-3 px-4 py-6">
            {/* Name skeleton - hidden on small screens */}
            <div className="hidden sm:flex">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-24"></div>
            </div>
            {/* Avatar skeleton */}
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
