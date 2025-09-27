'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Edit, Loader2, Trash2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { deleteContratanteAction } from '@/lib/actions';

export function ContratanteActions({ contratanteId, onEdit }: { contratanteId: string, onEdit: () => void }) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  
  const handleDelete = () => {
    startDeleteTransition(async () => {
        toast({ title: 'Excluindo contratante...' });
        const result = await deleteContratanteAction(contratanteId);

        if (result.success) {
            toast({ title: 'Contratante excluído com sucesso.' });
            router.refresh();
        } else {
            toast({ variant: 'destructive', title: 'Erro ao excluir contratante.', description: result.message })
        }
    });
  }

  return (
    <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Editar</span>
        </Button>
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o contratante e pode afetar eventos associados.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continuar
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
