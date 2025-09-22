import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-20 shadow-md">
      <Link href="/">
        <h1 className="text-3xl font-headline font-bold text-center tracking-tight">
          AgendaFácil
        </h1>
      </Link>
    </header>
  );
}
