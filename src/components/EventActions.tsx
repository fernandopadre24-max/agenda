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
import { Sheet, SheetContent } from './ui/sheet';
import { EventForm } from './EventForm';
import type { Event, Artista, Contratante } from '@/lib/types';
import { getArtistas, getContratantes } from '@/lib/data';


export function EventActions({ 
    event
}: { 
    event: Event
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [contratantes, setContratantes] = useState<Contratante[]>([]);

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
        router.refresh(); 
      } else {
        toast({ title: 'Erro ao excluir evento.', description: result.message, variant: 'destructive' });
      }
    });
  };
  
  const handleSaveSuccess = () => {
    setIsSheetOpen(false);
    router.refresh();
  }

  const handleOpenEdit = async () => {
    const [fetchedArtistas, fetchedContratantes] = await Promise.all([
      getArtistas(),
      getContratantes()
    ]);
    setArtistas(fetchedArtistas);
    setContratantes(fetchedContratantes);
    setIsSheetOpen(true);
  }

  return (
    <>
        <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleOpenEdit}>
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
            <SheetContent>
                <EventForm
                    event={event}
                    onSave={handleSaveSuccess}
                    onCancel={() => setIsSheetOpen(false)}
                    artistas={artistas}
                    contratantes={contratantes}
                />
            </SheetContent>
      </Sheet>
    </>
  );
}
