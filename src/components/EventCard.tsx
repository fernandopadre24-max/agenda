'use client';

import Link from 'next/link';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { type Event } from '@/lib/types';
import { Briefcase, ArrowUp, ArrowDown, Edit, Trash2, CheckCircle, Mic } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState, useTransition } from 'react';
import { Button } from './ui/button';
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
import { deleteEventAction, updateEventStatusAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


export function EventCard({ event }: { event: Event }) {
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDelete = async () => {
    toast({ title: 'Excluindo evento...' });
    await deleteEventAction(event.id);
    toast({ title: 'Evento excluído com sucesso.' });
    router.refresh();
  };

  const handleStatusUpdate = (type: 'pagar' | 'receber') => {
    startTransition(async () => {
        toast({ title: 'Atualizando status...' });
        const result = await updateEventStatusAction(event.id, type);
        if (result.success) {
            toast({ title: type === 'receber' ? 'Recebimento confirmado!' : 'Pagamento confirmado!' });
            router.refresh();
        } else {
            toast({ variant: 'destructive', title: 'Erro ao atualizar status.', description: result.message });
        }
    });
  }


  if (!isMounted) {
    return null;
  }

  const eventDate = new Date(event.date);
  const now = new Date();
  now.setHours(0,0,0,0);
  const isPast = eventDate < now;
  
  const day = eventDate.toLocaleDateString('pt-BR', { day: '2-digit' });
  const month = eventDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  const time = event.hora;

  const renderFinancials = () => {
    if (event.receber) {
      if (event.receber.status === 'pendente') {
        return (
          <Badge variant='secondary' className="bg-green-600/20 text-green-400 border-green-600/30">
            <ArrowUp className="mr-1 h-3 w-3" /> {formatCurrency(event.receber.valor)}
          </Badge>
        );
      } else {
        return (
           <Badge className="bg-green-500/80">Recebido</Badge>
        )
      }
    }
    if (event.pagar) {
      if (event.pagar.status === 'pendente') {
        return (
          <Badge variant='secondary' className="bg-red-600/20 text-red-400 border-red-600/30">
            <ArrowDown className="mr-1 h-3 w-3" /> {formatCurrency(event.pagar.valor)}
          </Badge>
        );
      } else {
        return (
           <Badge variant="destructive">Pago</Badge>
        )
      }
    }
    return null;
  }
  
  const showReceberAction = event.receber?.status === 'pendente' && !isPast;
  const showPagarAction = event.pagar?.status === 'pendente' && !isPast;


  return (
      <Card className={`hover:border-primary transition-all duration-200 ${isPast ? 'opacity-60' : ''}`}>
        <div className="flex">
            <Link href={`/events/${event.id}`} className="flex-1">
                <div className="flex">
                    <div className="flex flex-col items-center justify-center p-2.5 bg-secondary/50 border-r border-border w-16">
                        <span className="text-xs uppercase font-bold text-primary">{month}</span>
                        <span className="text-2xl font-bold">{day}</span>
                    </div>
                    <div className="flex-1 p-3">
                      <div className="flex justify-between items-start">
                          <CardTitle className="font-headline text-base leading-tight flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            {event.contratante}
                          </CardTitle>
                          {renderFinancials()}
                      </div>
                      <CardDescription className="flex items-center gap-2 text-xs text-muted-foreground pt-1 pl-1">
                          <Mic className="h-3 w-3" />
                          {event.artista}
                      </CardDescription>
                      <div className="text-xs text-muted-foreground mt-1.5 pl-1">{time}</div>
                    </div>
                </div>
            </Link>
            <div className="p-1 border-l flex flex-col justify-center items-center">
                {(showReceberAction || showPagarAction) && (
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-green-500 hover:text-green-500 hover:bg-green-500/10" 
                        onClick={() => handleStatusUpdate(showReceberAction ? 'receber' : 'pagar')}
                        disabled={isPending}
                        aria-label={showReceberAction ? "Marcar como Recebido" : "Marcar como Pago"}
                      >
                        <CheckCircle className="h-4 w-4" />
                    </Button>
                )}
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <Link href={`/events/${event.id}/edit`}>
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
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="bg-destructive hover:bg-destructive/90">Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
      </Card>
  );
}
