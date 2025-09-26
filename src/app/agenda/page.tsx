'use server';

import { getEvents } from '@/lib/data';
import { PageHeader } from '@/components/PageHeader';
import { AgendaClientPage } from '@/components/AgendaClientPage';

export default async function AgendaPage() {
  const events = await getEvents();

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Agenda" />
      <main className="flex-1 p-4 md:p-6 space-y-4">
        <AgendaClientPage initialEvents={events} />
      </main>
    </div>
  );
}
