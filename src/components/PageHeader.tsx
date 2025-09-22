'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function PageHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <header className="bg-primary text-primary-foreground p-2.5 flex items-center gap-2 sticky top-0 z-20 shadow-md">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="hover:bg-white/20"
      >
        <ArrowLeft className="h-6 w-6" />
        <span className="sr-only">Voltar</span>
      </Button>
      <h1 className="text-xl font-headline font-semibold">{title}</h1>
    </header>
  );
}
