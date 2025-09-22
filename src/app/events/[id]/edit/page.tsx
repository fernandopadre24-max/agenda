import { EventForm } from '@/components/EventForm';
import { PageHeader } from '@/components/PageHeader';
import { getEventById } from '@/lib/data';
import { notFound } from 'next/navigation';

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Editar Evento" />
      <main className="flex-1 p-4 md:p-6">
        <EventForm event={event} />
      </main>
    </div>
  );
}
