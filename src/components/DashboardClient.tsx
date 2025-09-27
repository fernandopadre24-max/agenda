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
  const [sheetKey, setSheetKey] = useState(Date.now()); // Chave para forçar remontagem
  const router = useRouter();

  const handleSaveSuccess = () => {
    setIsCreateSheetOpen(false);
    setSheetKey(Date.now()); // Atualiza a chave para forçar a remontagem do Sheet
    router.refresh();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Se o usuário fechar (cancelar), também atualizamos a chave para garantir que da próxima vez ele pegue dados novos
      setSheetKey(Date.now());
    }
    setIsCreateSheetOpen(open);
  }

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
      
      <Sheet key={sheetKey} open={isCreateSheetOpen} onOpenChange={handleOpenChange}>
        <SheetContent className="p-0">
          <EventForm
              onSave={handleSaveSuccess}
              onCancel={() => handleOpenChange(false)}
            />
        </SheetContent>
      </Sheet>
    </div>
  );
}
