'use server';

import { getArtistas, getContratantes, getEvents } from '@/lib/data';
import { PageHeader } from '@/components/PageHeader';
import { AgendaClientPage } from '@/components/AgendaClientPage';

export default async function AgendaPage() {
  const [events, artistas, contratantes] = await Promise.all([
    getEvents(),
    getArtistas(),
    getContratantes(),
  ]);

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Agenda" />
      <main className="flex-1 p-4 md:p-6 space-y-4">
        <AgendaClientPage
          initialEvents={events}
          initialArtistas={artistas}
          initialContratantes={contratantes}
        />
      </main>
    </div>
  );
}
