'use client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CalendarPlus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
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


export function EventActions({ eventId }: { eventId: string }) {
  const { toast } = useToast();
  const router = useRouter();

  const handleReminder = () => {
    toast({
      title: 'Lembrete Criado!',
      description: 'Você será notificado 1 hora antes do evento.',
      duration: 3000,
    });
  };

  const handleDelete = async () => {
    toast({ title: 'Excluindo evento...' });
    await deleteEventAction(eventId);
    toast({ title: 'Evento excluído com sucesso.' });
    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" asChild>
        <Link href={`/events/${eventId}/edit`}>
          <Edit className="mr-2 h-4 w-4" /> Editar
        </Link>
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Continuar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
