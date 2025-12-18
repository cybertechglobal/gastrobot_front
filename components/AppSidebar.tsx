'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'; // Core sidebar components :contentReference[oaicite:0]{index=0}
import { Coffee, List, ClipboardList, MessageSquare, Building } from 'lucide-react';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import LOGO from '@/public/logo.svg';
import LOGO_G from '@/public/logo_g.svg';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

type UserRole = 'root' | 'admin' | 'manager' | 'waiter' | 'default';

// Interface za nav stavke
interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: Record<UserRole, NavItem[]> = {
  root: [
    { title: 'Restorani', href: '/restaurants', icon: Coffee },
    { title: 'Kategorije', href: '/categories', icon: List },
    { title: 'Sastojci', href: '/ingredients', icon: List },
    { title: 'Recenzije', href: '/reviews', icon: MessageSquare },
    { title: 'Gradovi', href: '/cities', icon: Building },
    // { title: 'Podešavanja', href: '/settings', icon: Settings },
  ],
  admin: [
    { title: 'Restoran', href: '/my-restaurant', icon: Coffee },
    { title: 'Porudžbine', href: '/orders', icon: ClipboardList },
    { title: 'Rezervacije', href: '/reservations', icon: ClipboardList },
  ],
  manager: [
    { title: 'Restoran', href: '/my-restaurant', icon: Coffee },
    { title: 'Porudžbine', href: '/orders', icon: ClipboardList },
    { title: 'Rezervacije', href: '/reservations', icon: ClipboardList },
  ],
  waiter: [
    { title: 'Porudžbine', href: '/orders', icon: ClipboardList },
    { title: 'Rezervacije', href: '/reservations', icon: ClipboardList },
  ],
  default: [],
};

function isValidUserRole(role: string): role is UserRole {
  return ['root', 'admin', 'manager', 'waiter', 'default'].includes(role);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const { state } = useSidebar();
  // console.log(session)

  const userRole = session?.user.restaurantUsers[0]?.role || 'default';
  const currentRole: UserRole = isValidUserRole(userRole)
    ? userRole
    : 'default';

  const currentNavItems = navItems[currentRole];
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="bg-slate-950">
      {/* Sticky top header */}
      <SidebarHeader className="px-2 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 py-[18px] bg-transparent hover:bg-transparent"
              >
                {/* <div
                  style={{
                    position: 'relative',
                    width: '45px',
                    height: '45px',
                  }}
                >
                  <Image
                    src={LOGO}
                    alt="logo"
                    fill
                    style={{
                      objectFit: 'cover', // ili 'contain'
                    }}
                  />
                </div> */}
                <Image
                  src={isCollapsed ? LOGO_G : LOGO}
                  width={isCollapsed ? 40 : 150}
                  alt="logo"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Scrollable main content */}
      <SidebarContent>
        <SidebarGroup className="pt-[16px]">
          <SidebarGroupContent>
            <SidebarMenu>
              {currentNavItems.map(({ title, href, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild>
                      <a
                        href={href}
                        className={clsx(
                          'flex items-center gap-4 px-4 py-5 rounded-lg transition-colors',
                          isActive ? 'bg-secondary' : ''
                        )}
                      >
                        <Icon
                          size={20}
                          className={clsx(
                            // neaktivne ikone nasleđuju text-slate-400
                            isActive && 'text-primary'
                          )}
                        />
                        <span
                          className={clsx(
                            isActive ? 'font-medium' : 'text-gray-500'
                          )}
                        >
                          {title}
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="border border-border dark:border-border w-[78%] m-auto"></div>

      {/* Sticky bottom footer */}
      <SidebarFooter>
        <div className="flex flex-col gap-3 px-4 pt-2 pb-8">
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-xs text-slate-500">Version 1.0</p>
          </div>

          {/* <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <ModeToggle />
          </div> */}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
