import { EventForm } from '@/components/EventForm';
import { PageHeader } from '@/components/PageHeader';
import { getArtistas, getContratantes, getEvents } from '@/lib/data';
import type { Event } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function NewEventPage() {
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

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Novo Evento" showBackButton={true} />
      <main className="flex-1 p-4 md:p-6">
        <EventForm
          artistas={artistas}
          contratantes={contratantes}
          pastEvents={pastEvents}
        />
      </main>
    </div>
  );
}
