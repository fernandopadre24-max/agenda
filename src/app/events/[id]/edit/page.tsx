'use client';

import { EventForm } from '@/components/EventForm';
import { getEventById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Event } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/PageHeader';

export default function EditEventPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      const fetchedEvent = await getEventById(params.id);
      if (!fetchedEvent) {
        notFound();
      }
      setEvent(fetchedEvent);
      setLoading(false);
    }
    fetchEvent();
  }, [params.id]);


  if (loading || !event) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <header className="bg-background border-b border-border p-2.5 flex items-center gap-2 sticky top-0 z-20">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-32" />
        </header>
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
        <EventForm event={event} />
      </main>
    </div>
  );
}
