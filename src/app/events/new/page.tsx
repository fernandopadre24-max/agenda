'use client';

import { EventForm } from '@/components/EventForm';
import { PageHeader } from '@/components/PageHeader';
import { getArtistas, getContratantes, getEvents } from '@/lib/data';
import type { Artista, Contratante, Event } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function NewEventPage() {
  const [data, setData] = useState<{
    artistas: Artista[];
    contratantes: Contratante[];
    pastEvents: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [artistas, contratantes, allEvents] = await Promise.all([
        getArtistas(),
        getContratantes(),
        getEvents(),
      ]);
      const pastEvents = allEvents.map(
        (e: Event) =>
          `Evento para ${e.contratante} com ${e.artista} em ${new Date(
            e.date
          ).toLocaleDateString()} às ${e.hora}.`
      );
      setData({ artistas, contratantes, pastEvents });
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Novo Evento" showBackButton={true} />
      <main className="flex-1 p-4 md:p-6">
        {loading || !data ? (
          <div className="space-y-6">
            <div className="h-48 w-full animate-pulse rounded-md bg-muted"></div>
            <div className="h-64 w-full animate-pulse rounded-md bg-muted"></div>
          </div>
        ) : (
          <EventForm
            artistas={data.artistas}
            contratantes={data.contratantes}
            pastEvents={data.pastEvents}
          />
        )}
      </main>
    </div>
  );
}
