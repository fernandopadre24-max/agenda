
import { EventForm } from '@/components/EventForm';
import { PageHeader } from '@/components/PageHeader';
import { getArtistas, getContratantes } from '@/lib/data';


export default async function NewEventPage() {
  const artistas = await getArtistas();
  const contratantes = await getContratantes();
  
  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Novo Evento" showBackButton={true} />
      <main className="flex-1 p-4 md:p-6">
        <EventForm artistas={artistas} contratantes={contratantes} />
      </main>
    </div>
  );
}
