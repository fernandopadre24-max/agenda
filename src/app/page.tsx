import { AppHeader } from '@/components/AppHeader';
import { getEvents } from '@/lib/data';
import { EventDashboard } from '@/components/EventDashboard';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function HomePage() {
  const events = await getEvents();

  return (
    <div className="flex flex-col min-h-full bg-background">
      <AppHeader />
      <main className="flex-1 p-4 md:p-6">
        <EventDashboard initialEvents={events} />
      </main>
      <Link
        href="/events/new"
        className="absolute bottom-6 right-6 bg-accent text-accent-foreground rounded-full p-4 shadow-lg hover:bg-accent/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Adicionar Novo Evento"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
