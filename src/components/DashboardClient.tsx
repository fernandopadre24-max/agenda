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
  artistas,
  contratantes,
}: {
  initialEvents: Event[];
  artistas: Artista[];
  contratantes: Contratante[];
}) {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const router = useRouter();

  const handleSaveSuccess = () => {
    setIsCreateSheetOpen(false);
    router.refresh();
  };

  const handleOpenCreate = () => {
    setIsCreateSheetOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> Novo Evento
        </Button>
      </div>

      <EventDashboard
        initialEvents={initialEvents}
      />
      
      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent>
          <EventForm
              onSave={handleSaveSuccess}
              onCancel={() => setIsCreateSheetOpen(false)}
              artistas={artistas}
              contratantes={contratantes}
            />
        </SheetContent>
      </Sheet>
    </div>
  );
}
