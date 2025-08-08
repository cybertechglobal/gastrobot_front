'use client';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';
import { Eye, Pencil } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { MenuDialogForm } from './MenuDialogForm';
import { Menu } from '@/types/menu';

const MenuList = ({
  menus,
  restaurantId,
}: {
  menus: Menu[];
  restaurantId: string;
}) => {
  const pathname = usePathname();
  console.log(pathname);
  return menus.length ? (
    <div className="space-y-4">
      {menus.map((menu: Menu) => (
        <div
          key={menu.id}
          className="flex items-center justify-between p-3 rounded-lg border"
        >
          <div className="flex items-center space-x-3">
            <span className="font-medium min-w-[100px]">{menu.name}</span>
          </div>

          <div>
            <Link href={`${pathname}/menu/${menu.id}`}>
              <Button variant="link" size="icon" className="cursor-pointer">
                <Eye size={16} />
              </Button>
            </Link>

            <MenuDialogForm
              restaurantId={restaurantId}
              key={menu.id}
              menu={menu}
              trigger={
                <Button variant="ghost" size="icon">
                  <Pencil size={16} />
                </Button>
              }
            />
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p>nema menua</p>
  );
};

export default MenuList;
