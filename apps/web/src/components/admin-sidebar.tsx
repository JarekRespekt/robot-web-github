'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight,
  Menu as MenuIcon,
  Settings,
  Truck,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
  onMenuClick?: () => void;
  isMenuOpen?: boolean;
}

export function AdminSidebar({ onMenuClick, isMenuOpen = false }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      id: 'menu',
      label: 'Меню',
      icon: MenuIcon,
      onClick: onMenuClick,
      isActive: pathname.startsWith('/menu'),
      expandable: true,
    },
    {
      id: 'settings-location',
      label: 'Налаштування закладу',
      icon: MapPin,
      href: '/settings/locations',
      isActive: pathname === '/settings/locations',
    },
    {
      id: 'settings-delivery',
      label: 'Налаштування доставки',
      icon: Truck,
      href: '/settings/delivery',
      isActive: pathname === '/settings/delivery',
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-border h-full">
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          
          if (item.href) {
            return (
              <Button
                key={item.id}
                asChild
                variant={item.isActive ? "secondary" : "ghost"}
                className={`w-full justify-start cursor-pointer ${
                  item.isActive ? 'bg-surface text-ink' : ''
                }`}
              >
                <Link href={item.href}>
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              </Button>
            );
          }

          return (
            <Button
              key={item.id}
              variant={item.isActive ? "secondary" : "ghost"}
              className={`w-full justify-between cursor-pointer ${
                item.isActive ? 'bg-surface text-ink' : ''
              }`}
              onClick={item.onClick}
            >
              <div className="flex items-center">
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </div>
              {item.expandable && (
                <ChevronRight 
                  className={`h-4 w-4 transition-transform ${
                    isMenuOpen ? 'rotate-90' : ''
                  }`} 
                />
              )}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}