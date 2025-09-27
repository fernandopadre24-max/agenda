'use client';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CalendarPlus, Edit, Loader2, Trash2 } from 'lucide-react';
import { deleteEventAction } from '@/lib/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { EventForm } from './EventForm';
import type { Artista, Contratante, Event } from '@/lib/types';


export function EventActions({ 
    event,
    artistas,
    contratantes,
    pastEvents
}: { 
    event: Event,
    artistas: Artista[],
    contratantes: Contratante[],
    pastEvents: string[]
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleReminder = () => {
    toast({
      title: 'Lembrete Criado!',
      description: 'Você será notificado 1 hora antes do evento.',
      duration: 3000,
    });
  };

  const handleDelete = async () => {
    startDeleteTransition(async () => {
      toast({ title: 'Excluindo evento...' });
      const result = await deleteEventAction(event.id);
      if(result.success) {
        toast({ title: 'Evento excluído com sucesso.' });
        router.push('/');
        router.refresh(); // This ensures the list on the homepage is updated
      } else {
        toast({ title: 'Erro ao excluir evento.', description: result.message, variant: 'destructive' });
      }
    });
  };
  
  const handleEdit = () => {
    setIsSheetOpen(true);
  }
  
  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  }

  return (
    <>
        <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
            <Button variant="outline" onClick={handleReminder}>
                <CalendarPlus className="mr-2 h-4 w-4" /> Lembrete
            </Button>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Continuar
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent className="p-0" onInteractOutside={handleCloseSheet}>
                 <SheetHeader className="p-6">
                    <SheetTitle className="font-headline">Editar Evento</SheetTitle>
                </SheetHeader>
                <EventForm
                    event={event}
                    artistas={artistas}
                    contratantes={contratantes}
                    pastEvents={pastEvents}
                    onCancel={handleCloseSheet}
                />
            </SheetContent>
      </Sheet>
    </>
  );
}
