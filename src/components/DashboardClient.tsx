'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EventDashboard } from './EventDashboard';
import { Sheet, SheetContent } from './ui/sheet';
import { EventForm } from './EventForm';
import { type Event, type Artista, type Contratante } from '@/lib/types';

export function DashboardClient({
  initialEvents,
  initialArtistas,
  initialContratantes,
}: {
  initialEvents: Event[];
  initialArtistas: Artista[];
  initialContratantes: Contratante[];
}) {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const router = useRouter();

  const handleSaveSuccess = () => {
    setIsCreateSheetOpen(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Evento
        </Button>
      </div>

      <EventDashboard
        initialEvents={initialEvents}
        initialArtistas={initialArtistas}
        initialContratantes={initialContratantes}
      />
      
      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent className="p-0">
          <EventForm
              onSave={handleSaveSuccess}
              onCancel={() => setIsCreateSheetOpen(false)}
            />
        </SheetContent>
      </Sheet>
    </div>
  );
}
