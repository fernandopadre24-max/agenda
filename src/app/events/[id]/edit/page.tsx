'use server';

import { EventForm } from '@/components/EventForm';
import { getArtistas, getContratantes, getEventById, getEvents } from '@/lib/data';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import type { Event } from '@/lib/types';
import { updateEventAction } from '@/lib/actions';

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const [event, artistas, contratantes, allEvents] = await Promise.all([
    getEventById(params.id),
    getArtistas(),
    getContratantes(),
    getEvents(),
  ]);

  if (!event) {
    notFound();
  }

  const pastEvents = allEvents.map(
    (e: Event) =>
      `Evento para ${e.contratante} com ${e.artista} em ${new Date(
        e.date
      ).toLocaleDateString()} às ${e.hora}.`
  );


  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Editar Evento" showBackButton={true}/>
      <main className="flex-1 p-4 md:p-6">
        <EventForm 
          event={event} 
          artistas={artistas}
          contratantes={contratantes}
          pastEvents={pastEvents}
          action={updateEventAction}
        />
      </main>
    </div>
  );
}
