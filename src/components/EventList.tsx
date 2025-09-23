import { EventCard } from './EventCard';
import type { Event } from '@/lib/types';
import { CalendarX } from 'lucide-react';

export function EventList({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CalendarX className="mx-auto h-12 w-12" />
        <p className="mt-4">Nenhum evento encontrado para os filtros selecionados.</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
