'use client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { deleteContratanteAction } from '@/lib/actions';
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

export function ContratanteActions({ contratanteId, onDelete }: { contratanteId: string, onDelete: () => void }) {
  const { toast } = useToast();

  const handleDelete = async () => {
    toast({ title: 'Excluindo contratante...' });
    const result = await deleteContratanteAction(contratanteId);

    if (result.success) {
        toast({ title: 'Contratante excluído com sucesso.' });
        onDelete();
    } else {
        toast({ variant: 'destructive', title: 'Erro ao excluir contratante.', description: result.message })
    }
  };

  return (
    <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href={`/contratantes/${contratanteId}/edit`}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar</span>
            </Link>
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
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Continuar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
