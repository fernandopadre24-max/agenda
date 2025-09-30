'use server';
import { AppHeader } from '@/components/AppHeader';
import { getEvents } from '@/lib/data';
import { DashboardClient } from '@/components/DashboardClient';

export default async function HomePage() {
  const events = await getEvents();
  
  const pastEventsStrings = events.map(
    (e) =>
      `Evento para ${e.contratante} com ${e.artista} em ${new Date(
        e.date
      ).toLocaleDateString()} às ${e.hora}.`
  ) ?? [];

  return (
    <div className="flex flex-col flex-1">
      <AppHeader />
      <main className="flex-1 p-4 md:p-6">
        <DashboardClient 
          initialEvents={events}
        />
      </main>
    </div>
  );
}
