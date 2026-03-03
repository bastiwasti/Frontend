'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, MapPin, BarChart3, Activity } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Calendar', icon: Calendar },
  { href: '/locations', label: 'Locations', icon: MapPin },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/status', label: 'Status', icon: Activity },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
            <Icon className="h-4 w-4" />
            <span className="hidden lg:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}