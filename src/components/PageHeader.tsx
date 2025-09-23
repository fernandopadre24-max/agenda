'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function PageHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <header className="bg-background border-b border-border p-2.5 flex items-center gap-2 sticky top-0 z-20">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="hover:bg-secondary"
      >
        <ArrowLeft className="h-6 w-6" />
        <span className="sr-only">Voltar</span>
      </Button>
      <h1 className="text-xl font-headline font-semibold">{title}</h1>
    </header>
  );
}
