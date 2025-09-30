'use client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PageHeader({ title, showBackButton = false }: { title: string, showBackButton?: boolean }) {
  const router = useRouter();
  
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b border-border/50 p-3 flex items-center gap-2 sticky top-0 z-20">
      {showBackButton && (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
        >
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Voltar</span>
        </Button>
      )}
      <h1 className="text-xl font-headline font-semibold">{title}</h1>
    </header>
  );
}
