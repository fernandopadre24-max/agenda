'use client';

import { EventForm } from '@/components/EventForm';
import { getArtistas, getContratantes, getEventById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Event, Artista, Contratante } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/PageHeader';

export default function EditEventPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [contratantes, setContratantes] = useState<Contratante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [fetchedEvent, fetchedArtistas, fetchedContratantes] = await Promise.all([
        getEventById(params.id),
        getArtistas(),
        getContratantes()
      ]);

      if (!fetchedEvent) {
        notFound();
      }
      setEvent(fetchedEvent);
      setArtistas(fetchedArtistas);
      setContratantes(fetchedContratantes);
      setLoading(false);
    }
    fetchData();
  }, [params.id]);


  if (loading || !event) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <PageHeader title="Editar Evento" showBackButton={true} />
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
      <PageHeader title="Editar Evento" showBackButton={true}/>
      <main className="flex-1 p-4 md:p-6">
        <EventForm event={event} artistas={artistas} contratantes={contratantes} />
      </main>
    </div>
  );
}
