'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { createEventAction, updateEventAction } from '@/lib/actions';
import type { Event } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useState } from 'react';

const eventFormSchema = z.object({
  contratante: z.string().min(1, 'O nome do contratante é obrigatório.'),
  artista: z.string().min(1, 'O nome do artista é obrigatório.'),
  date: z.coerce.date({ required_error: 'A data do evento é obrigatória.' }),
  hora: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM).'),
  entrada: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM).'),
  saida: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM).'),
  financeType: z.enum(['receber', 'pagar', 'nenhum']).default('nenhum'),
  valor: z.coerce.number().optional(),
  status: z.enum(['pendente', 'concluido']).optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90">
      {pending ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar Alterações' : 'Criar Evento')}
    </Button>
  );
}

export function EventForm({ event }: { event?: Event }) {
  const isEditing = !!event;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      contratante: event?.contratante ?? '',
      artista: event?.artista ?? '',
      date: event?.date ?? new Date(),
      hora: event?.hora ?? '',
      entrada: event?.entrada ?? '',
      saida: event?.saida ?? '',
      financeType: event?.receber ? 'receber' : event?.pagar ? 'pagar' : 'nenhum',
      valor: event?.receber?.valor ?? event?.pagar?.valor,
      status: event?.receber?.status === 'recebido' || event?.pagar?.status === 'pago' ? 'concluido' : 'pendente',
    },
  });

  const [financeType, setFinanceType] = useState<string>(form.getValues('financeType'));

  const action = isEditing ? updateEventAction.bind(null, event.id) : createEventAction;
  const [state, formAction] = useFormState(action, { message: '' });

  const transformAndSubmit = (data: EventFormValues) => {
    const formData = new FormData();
    formData.append('contratante', data.contratante);
    formData.append('artista', data.artista);
    formData.append('date', data.date.toISOString());
    formData.append('hora', data.hora);
    formData.append('entrada', data.entrada);
    formData.append('saida', data.saida);
    formData.append('financeType', data.financeType);
    if (data.financeType !== 'nenhum' && data.valor && data.status) {
        formData.append('valor', String(data.valor));
        formData.append('status', data.status);
    }
    formAction(formData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(transformAndSubmit)} className="space-y-6">
        <Card>
            <CardHeader><CardTitle className="font-headline">Informações do Evento</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="contratante" render={({ field }) => (
                    <FormItem><FormLabel>Contratante</FormLabel><FormControl><Input placeholder="Ex: Casamento Joana & Miguel" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="artista" render={({ field }) => (
                    <FormItem><FormLabel>Artista / Serviço</FormLabel><FormControl><Input placeholder="Ex: Banda Sinfonia" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="date" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Data</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl>
                            <Button variant={'outline'} className={cn(!field.value && 'text-muted-foreground')}>
                                {field.value ? format(field.value, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent></Popover><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="hora" render={({ field }) => (
                        <FormItem><FormLabel>Hora</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="entrada" render={({ field }) => (
                        <FormItem><FormLabel>Entrada</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="saida" render={({ field }) => (
                        <FormItem><FormLabel>Saída</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle className="font-headline">Financeiro</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="financeType" render={({ field }) => (
                    <FormItem className="space-y-3"><FormLabel>Tipo de Transação</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={(value) => { field.onChange(value); setFinanceType(value); }} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="nenhum" /></FormControl><FormLabel className="font-normal">Nenhum</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="receber" /></FormControl><FormLabel className="font-normal">A Receber</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="pagar" /></FormControl><FormLabel className="font-normal">A Pagar</FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl><FormMessage /></FormItem>
                )}/>
                {financeType !== 'nenhum' && (
                    <>
                        <FormField control={form.control} name="valor" render={({ field }) => (
                            <FormItem><FormLabel>Valor</FormLabel><FormControl><Input type="number" placeholder="0,00" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem className="space-y-3"><FormLabel>Status</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="pendente" /></FormControl><FormLabel className="font-normal">Pendente</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="concluido" /></FormControl><FormLabel className="font-normal">{financeType === 'receber' ? 'Recebido' : 'Pago'}</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl><FormMessage /></FormItem>
                        )}/>
                    </>
                )}
            </CardContent>
        </Card>

        {state?.message && <p className={cn('text-sm', state.errors ? 'text-red-500' : 'text-green-500')}>{state.message}</p>}
        <SubmitButton isEditing={isEditing} />
      </form>
    </Form>
  );
}
