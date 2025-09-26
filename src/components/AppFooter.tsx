'use client';

import Link from 'next/link';
import { Home, Users, Mic, DollarSign, CalendarDays } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Início' },
  { href: '/agenda', icon: CalendarDays, label: 'Agenda' },
  { href: '/contratantes', icon: Users, label: 'Contratantes' },
  { href: '/artistas', icon: Mic, label: 'Artistas' },
  { href: '/financeiro', icon: DollarSign, label: 'Financeiro' },
];

export function AppFooter() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-30 max-w-lg mx-auto">
      <nav className="h-full">
        <ul className="flex justify-around items-center h-full">
          {navItems.map(({ href, icon: Icon, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 text-xs transition-colors w-16',
                  pathname === href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
