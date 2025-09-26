'use client';

import { ContratanteForm } from '@/components/ContratanteForm';
import { getContratanteById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Contratante } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/PageHeader';

export default function EditContratantePage({ params }: { params: { id: string } }) {
  const [contratante, setContratante] = useState<Contratante | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContratante() {
      setLoading(true);
      const fetchedContratante = await getContratanteById(params.id);
      if (!fetchedContratante) {
        notFound();
      }
      setContratante(fetchedContratante);
      setLoading(false);
    }
    fetchContratante();
  }, [params.id]);


  if (loading || !contratante) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <PageHeader title="Editar Contratante" showBackButton={true} />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-10 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Editar Contratante" showBackButton={true}/>
      <main className="flex-1 p-4 md:p-6">
        <ContratanteForm contratante={contratante} />
      </main>
    </div>
  );
}
