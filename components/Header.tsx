'use client';

import React from 'react';
import { SidebarTrigger } from './ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { signOut, useSession } from 'next-auth/react';
import { getUserInitials } from '@/lib/utils';

const Header = () => {
  const { data: session, status } = useSession();

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
            <div
              className="flex items-center gap-3 px-4 py-6 cursor-pointer"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
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
