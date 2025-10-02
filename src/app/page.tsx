'use server';
import { AppHeader } from '@/components/AppHeader';
import { getEvents, getArtistas, getContratantes } from '@/lib/data';
import { DashboardClient } from '@/components/DashboardClient';

export default async function HomePage() {
  const [events, artistas, contratantes] = await Promise.all([
    getEvents(),
    getArtistas(),
    getContratantes(),
  ]);
  
  return (
    <div className="flex flex-col flex-1">
      <AppHeader />
      <main className="flex-1 p-4 md:p-6">
        <DashboardClient 
          initialEvents={events || []}
          artistas={artistas || []}
          contratantes={contratantes || []}
        />
      </main>
    </div>
  );
}
