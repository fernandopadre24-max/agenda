'use client';
import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="bg-background border-b border-border p-4 sticky top-0 z-20 flex items-center justify-center">
      <Link href="/" className="flex-1 text-center">
        <h1 className="text-3xl font-headline font-bold tracking-tight text-primary">
          AgendaFácil
        </h1>
      </Link>
    </header>
  );
}
