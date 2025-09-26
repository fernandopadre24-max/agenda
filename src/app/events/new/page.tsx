'use client';

import { EventForm } from '@/components/EventForm';
import { PageHeader } from '@/components/PageHeader';

export default function NewEventPage() {
  
  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Novo Evento" showBackButton={true} />
      <main className="flex-1 p-4 md:p-6">
        <EventForm />
      </main>
    </div>
  );
}
