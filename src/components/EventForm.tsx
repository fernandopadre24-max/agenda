'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { createEventAction, updateEventAction } from '@/lib/actions';
import type { Event, Contratante, Artista } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';

const eventFormSchema = z
  .object({
    contratante: z.string().min(1, 'O nome do contratante é obrigatório.'),
    artista: z.string().min(1, 'O nome do artista é obrigatório.'),
    date: z.coerce.date({ required_error: 'A data do evento é obrigatória.' }),
    hora: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Formato de hora inválido (HH:MM).'
      ),
    entrada: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Formato de hora inválido (HH:MM).'
      ),
    saida: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Formato de hora inválido (HH:MM).'
      ),
    cidade: z.string().min(1, 'A cidade é obrigatória.'),
    local: z.string().min(1, 'O local é obrigatório.'),
    financeType: z.enum(['receber', 'pagar', 'nenhum']).default('nenhum'),
    valor: z.coerce.number().optional(),
    status: z.enum(['pendente', 'concluido']).optional(),
  })
  .refine(
    data => {
      if (data.financeType !== 'nenhum') {
        return data.valor !== undefined && data.valor > 0 && data.status !== undefined;
      }
      return true;
    },
    {
      message:
        'Valor (maior que zero) e status são obrigatórios para transações financeiras.',
      path: ['valor'],
    }
  );

export type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: Event;
  artistas: Artista[];
  contratantes: Contratante[];
  onSave: () => void;
  onCancel: () => void;
}

export function EventForm({
  event,
  artistas,
  contratantes,
  onSave,
  onCancel,
}: EventFormProps) {
  const isEditing = !!event;
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      contratante: event?.contratante ?? '',
      artista: event?.artista ?? '',
      date: event?.date ? new Date(event.date) : new Date(),
      hora: event?.hora ?? '19:00',
      entrada: event?.entrada ?? '18:00',
      saida: event?.saida ?? '22:00',
      cidade: event?.cidade ?? '',
      local: event?.local ?? '',
      financeType: event?.receber ? 'receber' : event?.pagar ? 'pagar' : 'nenhum',
      valor: event?.receber?.valor ?? event?.pagar?.valor,
      status:
        event?.receber?.status === 'recebido' || event?.pagar?.status === 'pago'
          ? 'concluido'
          : 'pendente',
    },
  });

  const financeType = form.watch('financeType');

  const onSubmit = async (data: EventFormValues) => {
    startTransition(async () => {
      const action =
        isEditing && event.id
          ? updateEventAction(event.id, data)
          : createEventAction(data);

      const result = await action;

      if (result.success) {
        toast({
          title: `Evento ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
        });
        onSave();
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao salvar o evento.',
          description: result.message,
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full"
      >
        <SheetHeader>
          <SheetTitle className="font-headline">
            {isEditing ? 'Editar Evento' : 'Novo Evento'}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-lg">
                    Informações do Evento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contratante"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contratante</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!contratantes || contratantes.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                               <SelectValue placeholder={!contratantes || contratantes.length === 0 ? "Nenhum contratante" : "Selecione um contratante"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contratantes.map(c => (
                              <SelectItem key={c.id} value={c.name}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="artista"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Artista / Serviço</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!artistas || artistas.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={!artistas || artistas.length === 0 ? "Nenhum artista" : "Selecione um artista"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {artistas.map(a => (
                              <SelectItem key={a.id} value={a.name}>
                                {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data do Evento</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: ptBR })
                                ) : (
                                  <span>Escolha uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hora"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora do Evento</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-lg">
                    Detalhes de Horário e Local
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="entrada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entrada no Local</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="saida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saída do Local</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade do evento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="local"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local</FormLabel>
                        <FormControl>
                          <Input placeholder="Local do evento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-lg">
                    Informações Financeiras
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="financeType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Tipo de Transação</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="nenhum" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Nenhum
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="receber" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                A Receber
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="pagar" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                A Pagar
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {financeType !== 'nenhum' && (
                    <>
                      <FormField
                        control={form.control}
                        name="valor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.00"
                                {...field}
                                onChange={e =>
                                  field.onChange(e.target.valueAsNumber || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex space-x-4"
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="pendente" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Pendente
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="concluido" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {financeType === 'receber'
                                      ? 'Recebido'
                                      : 'Pago'}
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
        </ScrollArea>
        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} variant="default">
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : isEditing ? (
              'Salvar Alterações'
            ) : (
              'Salvar Evento'
            )}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
