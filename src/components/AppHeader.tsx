import Link from 'next/link';
import { DollarSign } from 'lucide-react';
import { Button } from './ui/button';

export function AppHeader() {
  return (
    <header className="bg-background border-b border-border p-4 sticky top-0 z-20 flex items-center justify-between">
      <div className="flex-1">
        {/* Espaço reservado para manter o título centralizado */}
      </div>
      <Link href="/" className="flex-1 text-center">
        <h1 className="text-3xl font-headline font-bold tracking-tight text-primary">
          AgendaFácil
        </h1>
      </Link>
      <div className="flex-1 flex justify-end">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/financeiro">
            <DollarSign />
            <span className="sr-only">Financeiro</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
