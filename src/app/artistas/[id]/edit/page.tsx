'use client';

import { ArtistaForm } from '@/components/ArtistaForm';
import { getArtistaById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Artista } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/PageHeader';

export default function EditArtistaPage({ params }: { params: { id: string } }) {
  const [artista, setArtista] = useState<Artista | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtista() {
      setLoading(true);
      const fetchedArtista = await getArtistaById(params.id);
      if (!fetchedArtista) {
        notFound();
      }
      setArtista(fetchedArtista);
      setLoading(false);
    }
    fetchArtista();
  }, [params.id]);


  if (loading || !artista) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <PageHeader title="Editar Artista" showBackButton={true} />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-10 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Editar Artista" showBackButton={true}/>
      <main className="flex-1 p-4 md:p-6">
        <ArtistaForm artista={artista} />
      </main>
    </div>
  );
}
