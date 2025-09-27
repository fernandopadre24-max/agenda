'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EventDashboard } from './EventDashboard';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { EventForm } from './EventForm';
import { type Event, type Artista, type Contratante } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';

export function DashboardClient({
  initialEvents,
  initialArtistas,
  initialContratantes,
  pastEvents,
}: {
  initialEvents: Event[];
  initialArtistas: Artista[];
  initialContratantes: Contratante[];
  pastEvents: string[];
}) {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  const handleCloseSheet = () => {
    setIsCreateSheetOpen(false);
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
        <SheetContent className="p-0" onInteractOutside={handleCloseSheet}>
          <SheetHeader className="p-6">
            <SheetTitle className="font-headline">Criar Novo Evento</SheetTitle>
          </SheetHeader>
          <div className="p-6 pt-0">
             <EventForm
                artistas={initialArtistas}
                contratantes={initialContratantes}
                pastEvents={pastEvents}
                onCancel={handleCloseSheet}
              />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
