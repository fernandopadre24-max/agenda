'use client';

import Link from 'next/link';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { type Event } from '@/lib/types';
import { Briefcase, ArrowUp, ArrowDown, Edit, Trash2, Check, Mic, DollarSign, Loader2 } from 'lucide-react';
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
import { deleteEventAction, updateEventCompletionStatusAction, updateEventStatusAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent } from './ui/sheet';
import { EventForm } from './EventForm';


export function EventCard({ event }: { event: Event }) {
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(Date.now());
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDelete = () => {
    startTransition(async () => {
        toast({ title: 'Excluindo evento...' });
        const result = await deleteEventAction(event.id);
        if (result.success) {
            toast({ title: 'Evento excluído com sucesso.' });
            router.refresh();
        } else {
            toast({ variant: 'destructive', title: 'Erro ao excluir evento.', description: result.message });
        }
    });
  };

  const handleFinancialStatusUpdate = (type: 'pagar' | 'receber') => {
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

  const handleCompletionStatusUpdate = () => {
    startTransition(async () => {
        toast({ title: 'Marcando como realizado...' });
        const result = await updateEventCompletionStatusAction(event.id);
        if (result.success) {
            toast({ title: 'Evento marcado como realizado!'});
            router.refresh();
        } else {
            toast({ variant: 'destructive', title: 'Erro ao atualizar status.', description: result.message });
        }
    });
  }
  
  const handleSaveSuccess = () => {
    setIsEditSheetOpen(false);
    router.refresh();
  }
  
  const handleOpenEdit = () => {
    setSheetKey(Date.now()); // Garante que o form sempre tenha dados novos ao abrir
    setIsEditSheetOpen(true);
  }

  if (!isMounted) {
    // Avoid hydration errors by returning a placeholder or null on the first render
    return (
        <Card className="h-[100px]">
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        </Card>
    );
  }

  const eventDate = new Date(event.date);
  
  const day = eventDate.toLocaleDateString('pt-BR', { day: '2-digit', timeZone: 'UTC' });
  const month = eventDate.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '');
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
  
  const showReceberAction = event.receber?.status === 'pendente';
  const showPagarAction = event.pagar?.status === 'pendente';
  const showCompletionAction = event.status === 'pendente';


  return (
      <>
        <Card className={`hover:border-primary transition-all duration-200 ${event.status === 'realizado' ? 'opacity-60' : ''}`}>
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
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 pl-1">
                            {time}
                            {event.status === 'realizado' && <Badge variant="outline">Realizado</Badge>}
                        </div>
                        </div>
                    </div>
                </Link>
                <div className="p-1 border-l flex flex-col justify-center items-center">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin my-2"/> : (
                        <>
                            {showCompletionAction && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" 
                                    onClick={(e) => { e.stopPropagation(); handleCompletionStatusUpdate(); }}
                                    aria-label={"Marcar como Realizado"}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                            )}
                            {(showReceberAction || showPagarAction) && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-green-500 hover:text-green-500 hover:bg-green-500/10" 
                                    onClick={(e) => { e.stopPropagation(); handleFinancialStatusUpdate(showReceberAction ? 'receber' : 'pagar'); }}
                                    aria-label={showReceberAction ? "Marcar como Recebido" : "Marcar como Pago"}
                                >
                                    <DollarSign className="h-4 w-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleOpenEdit(); }}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Excluir</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Continuar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
            </div>
        </Card>
        <Sheet key={sheetKey} open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
            <SheetContent className="p-0">
                <EventForm
                    event={event}
                    onSave={handleSaveSuccess}
                    onCancel={() => setIsEditSheetOpen(false)}
                />
            </SheetContent>
        </Sheet>
      </>
  );
}
