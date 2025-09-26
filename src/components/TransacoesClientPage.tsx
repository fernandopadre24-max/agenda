'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, ArrowUp, ArrowDown, Trash2, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { createTransactionAction, deleteTransactionAction } from '@/lib/actions';
import { Transaction } from '@/lib/types';
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
} from "@/components/ui/alert-dialog";
import { Badge } from './ui/badge';


const transactionFormSchema = z.object({
  description: z.string().min(3, 'A descrição é obrigatória.'),
  value: z.coerce.number().positive('O valor deve ser positivo.'),
  type: z.enum(['receber', 'pagar'], { required_error: 'Selecione o tipo.' }),
  date: z.coerce.date({ required_error: 'A data é obrigatória.' }),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export function TransacoesClientPage({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPending, startTransition] = useState(false);
  const { toast } = useToast();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: '',
      value: 0,
      type: 'receber',
      date: new Date(),
    },
  });

  const onSubmit = (data: TransactionFormValues) => {
    startTransition(true);
    createTransactionAction(data).then(result => {
      if (result.success && result.data) {
        toast({ title: 'Transação adicionada!' });
        setTransactions(prev => [result.data as Transaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsFormOpen(false);
        form.reset();
      } else {
        toast({ variant: 'destructive', title: 'Erro', description: result.message });
      }
      startTransition(false);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(true);
    deleteTransactionAction(id).then(result => {
      if (result.success) {
        toast({ title: 'Transação excluída!' });
        setTransactions(prev => prev.filter(t => t.id !== id));
      } else {
        toast({ variant: 'destructive', title: 'Erro', description: result.message });
      }
      startTransition(false);
    })
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Transação
        </Button>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Transação</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input placeholder="Ex: Adiantamento Cachê, Despesa de transporte" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="value" render={({ field }) => (
                  <FormItem><FormLabel>Valor</FormLabel><FormControl><Input type="number" placeholder="0,00" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} onChange={e => field.onChange(e.target.valueAsDate)} value={field.value.toISOString().split('T')[0]} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem className="space-y-3"><FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="receber" /></FormControl><FormLabel className="font-normal">A Receber</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="pagar" /></FormControl><FormLabel className="font-normal">A Pagar</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? <Loader2 className="animate-spin" /> : 'Salvar Transação'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-headline">Histórico de Transações</h3>
        {transactions.length > 0 ? (
          transactions.map(tx => (
            <Card key={tx.id}>
              <CardContent className="p-3 flex justify-between items-center">
                <div className="flex-1">
                  <p className={`font-semibold flex items-center gap-2 ${tx.type === 'receber' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'receber' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    {formatCurrency(tx.value)}
                  </p>
                  <p className="text-sm text-muted-foreground">{tx.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(tx.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={tx.status === 'concluido' ? 'default' : 'secondary'} className={tx.status === 'concluido' ? 'bg-green-500/80' : ''}>
                        {tx.status === 'concluido' ? <CheckCircle className="h-4 w-4 mr-1"/> : <Clock className="h-4 w-4 mr-1" />}
                        {tx.status}
                    </Badge>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>Esta ação não pode ser desfeita. Isso excluirá permanentemente a transação.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(tx.id)} disabled={isPending}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-4">Nenhuma transação registrada.</p>
        )}
      </div>
    </>
  );
}
