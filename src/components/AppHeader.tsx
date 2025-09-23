import Link from 'next/link';
import { DollarSign, Home, Mic, Users } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AppHeader() {
  return (
    <header className="bg-background border-b border-border p-4 sticky top-0 z-20 flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Home />
            <span className="sr-only">Menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              <span>Início</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/contratantes">
              <Users className="mr-2 h-4 w-4" />
              <span>Contratantes</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/artistas">
              <Mic className="mr-2 h-4 w-4" />
              <span>Artistas</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
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
