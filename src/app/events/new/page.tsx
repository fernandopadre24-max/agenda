'use client';

import { EventForm } from '@/components/EventForm';
import { PageHeader } from '@/components/PageHeader';
import { getArtistas, getContratantes } from '@/lib/data';
import { useEffect, useState } from 'react';
import { Artista, Contratante } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewEventPage() {
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [contratantes, setContratantes] = useState<Contratante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [fetchedArtistas, fetchedContratantes] = await Promise.all([
        getArtistas(),
        getContratantes()
      ]);
      setArtistas(fetchedArtistas);
      setContratantes(fetchedContratantes);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Novo Evento" showBackButton={true} />
      <main className="flex-1 p-4 md:p-6">
        {loading ? (
           <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-10 w-full" />
           </div>
        ) : (
          <EventForm artistas={artistas} contratantes={contratantes} />
        )}
      </main>
    </div>
  );
}
